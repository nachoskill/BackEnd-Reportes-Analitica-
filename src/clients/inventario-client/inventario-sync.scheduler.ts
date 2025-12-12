import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SyncService } from './inventario-sync.services';
import { AuthTokenManager } from '../auth-client/auth-token-manager.service';
import { InventarioConnectionManager } from './inventario-connection-manager.service';

@Injectable()
export class InventarioSyncScheduler implements OnModuleInit {
    private readonly logger = new Logger(InventarioSyncScheduler.name);
    private syncInterval: NodeJS.Timeout | null = null;

    constructor(
        private readonly syncService: SyncService,
        private readonly tokenManager: AuthTokenManager,
        private readonly connectionManager: InventarioConnectionManager,
    ) { }

    /**
     * Se ejecuta cuando el módulo se inicializa (al arrancar el backend)
     * AHORA ES NO BLOQUEANTE - usa el connection manager
     */
    async onModuleInit() {
        this.logger.log('🔄 Preparando sincronización de inventario...');

        // Ejecutar sincronización inicial en background (NO BLOQUEANTE)
        this.connectionManager.attemptConnection(async () => {
            // Durante la conexión inicial, lanzar errores para que el connection manager los detecte
            await this.ejecutarSincronizacion(true);
        }).catch(error => {
            this.logger.warn('⚠️ No se pudo realizar sincronización inicial de inventario, continuando sin ella');
        });

        // Programar sincronización cada 2 horas (7200000 ms)
        this.syncInterval = setInterval(async () => {
            this.logger.log('⏰ Ejecutando sincronización programada de inventario...');
            // En sincronizaciones programadas, NO lanzar errores
            await this.ejecutarSincronizacion(false);
        }, 7200000); // 2 horas

        this.logger.log('✅ Sincronización programada configurada (cada 2 horas)');
    }

    /**
     * Método privado que ejecuta la sincronización
     * @param throwOnError Si es true, lanza el error en lugar de capturarlo (para conexión inicial)
     */
    private async ejecutarSincronizacion(throwOnError: boolean = false) {
        try {
            // Obtener el token admin del TokenManager
            const token = this.tokenManager.getToken();

            if (!token) {
                const errorMsg = 'No hay token disponible';

                // Si estamos en fase de conexión inicial, lanzar error sin logging adicional
                if (throwOnError) {
                    throw new Error(errorMsg);
                }

                // Solo loguear en sincronizaciones programadas
                this.logger.warn(`⚠️ ${errorMsg}. Sincronización cancelada.`);
                return;
            }

            // Ejecutar la sincronización
            const resultado = await this.syncService.sincronizarDatos(token);
            this.logger.log(`✅ Sincronización completada: ${JSON.stringify(resultado)}`);

            // Marcar como conectado en el connection manager
            this.connectionManager.markAsConnected();
        } catch (error) {
            // Si estamos en fase de conexión inicial, solo lanzar el error sin logging
            if (throwOnError) {
                throw error;
            }

            // En sincronizaciones programadas, loguear el error completo
            this.logger.error(`❌ Error en sincronización de inventario: ${error.message}`, error.stack);
        }
    }

    /**
     * Limpieza al destruir el servicio
     */
    onModuleDestroy() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.logger.log('🛑 Sincronización programada detenida');
        }
    }
}
