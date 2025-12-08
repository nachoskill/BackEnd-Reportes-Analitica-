import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthClient } from './auth.client';
import { AuthTokenManager } from './auth-token-manager.service';
import { UserDto } from './dto/user.dto';

/**
 * Servicio que sincroniza automáticamente usuarios del microservicio de autenticación
 * a las colecciones locales de vendedores y clientes cada 2 horas
 */
@Injectable()
export class UserSyncService implements OnModuleInit {
    private readonly logger = new Logger(UserSyncService.name);
    private syncInterval: NodeJS.Timeout | null = null;

    // Sincronizar cada 2 minutos (120000 ms) - TEMPORAL PARA PRUEBAS
    // TODO: Cambiar a 2 horas (7200000 ms) en producción
    private readonly SYNC_INTERVAL_MS = 21 * 60 * 60 * 1000;

    constructor(
        @InjectModel('Vendedor') private vendedorModel: Model<any>,
        @InjectModel('Cliente') private clienteModel: Model<any>,
        private readonly authClient: AuthClient,
        private readonly authTokenManager: AuthTokenManager,
    ) { }

    /**
     * Ejecuta la sincronización al iniciar la aplicación
     * Espera a que el token esté disponible antes de sincronizar
     */
    async onModuleInit() {
        this.logger.log('🔄 Esperando token de autenticación...');

        // Esperar hasta que el token esté disponible (máximo 10 segundos)
        await this.waitForToken(10000);

        this.logger.log('🔄 Ejecutando sincronización inicial de usuarios...');
        await this.syncUsers();

        // Configurar sincronización automática cada 2 minutos
        this.syncInterval = setInterval(async () => {
            this.logger.log('⏰ Sincronización programada de usuarios (cada 2 minutos - PRUEBAS)');
            await this.syncUsers();
        }, this.SYNC_INTERVAL_MS);

        this.logger.log('✅ Sincronización automática configurada (cada 2 minutos - PRUEBAS)');
    }

    /**
     * Espera hasta que el token esté disponible
     * @param maxWaitMs Tiempo máximo de espera en milisegundos
     */
    private async waitForToken(maxWaitMs: number = 10000): Promise<void> {
        const startTime = Date.now();

        while (!this.authTokenManager.getToken()) {
            // Si pasó el tiempo máximo, salir
            if (Date.now() - startTime > maxWaitMs) {
                this.logger.warn('⚠️ Timeout esperando token. Continuando sin sincronización inicial.');
                return;
            }

            // Esperar 100ms antes de volver a verificar
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        this.logger.log('✅ Token disponible, procediendo con sincronización');
    }

    /**
     * Limpia el intervalo al destruir el módulo
     */
    onModuleDestroy() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.logger.log('🛑 Sincronización automática detenida');
        }
    }

    /**
     * Obtiene usuarios del microservicio y sincroniza en colecciones locales
     */
    private async syncUsers(): Promise<void> {
        try {
            // Obtener token
            const token = this.authTokenManager.getToken();
            if (!token) {
                this.logger.warn('⚠️ No hay token disponible. Saltando sincronización.');
                return;
            }

            // Obtener usuarios del microservicio
            this.logger.log('📡 Obteniendo usuarios del microservicio de autenticación...');
            const users = await this.authClient.getAllUsers(token);
            this.logger.log(`✅ Obtenidos ${users.length} usuarios del microservicio`);

            // Filtrar y sincronizar vendedores
            const vendedores = users.filter(user =>
                user.roles.includes('Vendedor') || user.roles.includes('vendedor')
            );
            await this.syncVendedores(vendedores);

            // Filtrar y sincronizar clientes
            const clientes = users.filter(user =>
                user.roles.includes('Cliente') || user.roles.includes('cliente')
            );
            await this.syncClientes(clientes);

            this.logger.log('✅ Sincronización completada exitosamente');
        } catch (error) {
            this.logger.error(`❌ Error durante la sincronización: ${error.message}`);
        }
    }

    /**
     * Sincroniza vendedores en la colección local
     * Solo guarda el id como id_vendedor
     */
    private async syncVendedores(vendedores: UserDto[]): Promise<void> {
        let syncCount = 0;

        for (const user of vendedores) {
            try {
                await this.vendedorModel.findOneAndUpdate(
                    { id_vendedor: user.id },
                    { id_vendedor: user.id },
                    { upsert: true, new: true }
                );
                syncCount++;
            } catch (error) {
                this.logger.error(`Error al sincronizar vendedor ${user.id}: ${error.message}`);
            }
        }

        this.logger.log(`✅ Sincronizados ${syncCount} vendedores`);
    }

    /**
     * Sincroniza clientes en la colección local
     * Guarda id y creado_en
     */
    private async syncClientes(clientes: UserDto[]): Promise<void> {
        let syncCount = 0;

        for (const user of clientes) {
            try {
                await this.clienteModel.findOneAndUpdate(
                    { id_cliente: user.id },
                    {
                        id_cliente: user.id,
                        creado_en: user.creado_en,
                    },
                    { upsert: true, new: true }
                );
                syncCount++;
            } catch (error) {
                this.logger.error(`Error al sincronizar cliente ${user.id}: ${error.message}`);
            }
        }

        this.logger.log(`✅ Sincronizados ${syncCount} clientes`);
    }

    /**
     * Fuerza una sincronización manual
     */
    async forceSyncUsers(): Promise<void> {
        this.logger.log('🔄 Forzando sincronización manual de usuarios...');
        await this.syncUsers();
    }
}
