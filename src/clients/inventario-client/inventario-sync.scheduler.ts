import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SyncService } from './inventario-sync.services';
import { AuthTokenManager } from '../auth-client/auth-token-manager.service';

@Injectable()
export class InventarioSyncScheduler implements OnModuleInit {
    private readonly logger = new Logger(InventarioSyncScheduler.name);
    private syncInterval: NodeJS.Timeout | null = null;

    constructor(
        private readonly syncService: SyncService,
        private readonly tokenManager: AuthTokenManager,
    ) { }

    /**
     * Se ejecuta cuando el módulo se inicializa (al arrancar el backend)
     */
    async onModuleInit() {
        this.logger.log('🔄 Iniciando sincronización inicial de inventario...');

        // Esperar 5 segundos para que el token esté disponible
        setTimeout(async () => {
            await this.ejecutarSincronizacion();

            // Programar sincronización cada 2 horas (7200000 ms)
            this.syncInterval = setInterval(async () => {
                this.logger.log('⏰ Ejecutando sincronización programada de inventario...');
                await this.ejecutarSincronizacion();
            }, 7200000); // 2 horas

            this.logger.log('✅ Sincronización programada configurada (cada 2 horas)');
        }, 5000);
    }

    /**
     * Método privado que ejecuta la sincronización
     */
    private async ejecutarSincronizacion() {
        try {
            // Obtener el token admin del TokenManager
            const token = this.tokenManager.getToken();

            if (!token) {
                this.logger.warn('⚠️ No hay token disponible. Sincronización cancelada.');
                return;
            }

            // Ejecutar la sincronización
            const resultado = await this.syncService.sincronizarDatos(token);
            this.logger.log(`✅ Sincronización completada: ${JSON.stringify(resultado)}`);
        } catch (error) {
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
