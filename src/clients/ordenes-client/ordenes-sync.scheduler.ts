import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OrdenesClient } from './ordenes.client';
import { AuthTokenManager } from '../auth-client/auth-token-manager.service';
import { OrdenesConnectionManager } from './ordenes-connection-manager.service';

@Injectable()
export class OrdenesSyncScheduler implements OnModuleInit {
    private readonly logger = new Logger(OrdenesSyncScheduler.name);
    private syncInterval: NodeJS.Timeout | null = null;

    constructor(
        private readonly ordenesClient: OrdenesClient,
        private readonly tokenManager: AuthTokenManager,
        private readonly connectionManager: OrdenesConnectionManager,
    ) { }

    /**
     * Se ejecuta cuando el módulo se inicializa (al arrancar el backend)
     * AHORA ES NO BLOQUEANTE - usa el connection manager
     */
    async onModuleInit() {
        this.logger.log('🔄 Preparando análisis de carritos pagados...');

        // Ejecutar análisis inicial en background (NO BLOQUEANTE)
        this.connectionManager.attemptConnection(async () => {
            // Durante la conexión inicial, lanzar errores para que el connection manager los detecte
            await this.ejecutarAnalisis(true);
        }).catch(error => {
            this.logger.warn('⚠️ No se pudo realizar análisis inicial de carritos, continuando sin él');
        });

        // Programar análisis cada 24 horas (86400000 ms)
        this.syncInterval = setInterval(async () => {
            this.logger.log('⏰ Ejecutando análisis programado de carritos pagados...');
            // En análisis programados, NO lanzar errores
            await this.ejecutarAnalisis(false);
        }, 86400000); // 24 horas

        this.logger.log('✅ Análisis programado configurado (cada 24 horas)');
    }

    /**
     * Método privado que ejecuta el análisis
     * @param throwOnError Si es true, lanza el error en lugar de capturarlo (para conexión inicial)
     */
    private async ejecutarAnalisis(throwOnError: boolean = false) {
        try {
            // Obtener el token admin del TokenManager
            const token = this.tokenManager.getToken();

            if (!token) {
                const errorMsg = 'No hay token disponible';

                // Si estamos en fase de conexión inicial, lanzar error sin logging adicional
                if (throwOnError) {
                    throw new Error(errorMsg);
                }

                // Solo loguear en análisis programados
                this.logger.warn(`⚠️ ${errorMsg}. Análisis cancelado.`);
                return;
            }

            // Ejecutar el análisis
            const resultado = await this.ordenesClient.analizarCarritosPagados(token);

            this.logger.log(`✅ Análisis completado exitosamente`);
            this.logger.log(`   📦 Carritos pagados: ${resultado.carritosPagados.length}`);
            this.logger.log(`   💰 Monto total: $${resultado.montoTotalPagado.toFixed(2)}`);
            this.logger.log(`   📊 Productos vendidos: ${Object.keys(resultado.productosVendidos).length} únicos`);

            // Marcar como conectado en el connection manager
            this.connectionManager.markAsConnected();

            // Aquí podrías guardar los resultados en la base de datos si lo necesitas
            // await this.guardarResultados(resultado);

        } catch (error) {
            // Si estamos en fase de conexión inicial, solo lanzar el error sin logging
            if (throwOnError) {
                throw error;
            }

            // En análisis programados, loguear el error completo
            this.logger.error(`❌ Error en análisis de carritos: ${error.message}`, error.stack);
        }
    }

    /**
     * Limpieza al destruir el servicio
     */
    onModuleDestroy() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.logger.log('🛑 Análisis programado detenido');
        }
    }

    /**
     * Método público para forzar un análisis manual
     */
    async forzarAnalisis(): Promise<void> {
        this.logger.log('🔄 Forzando análisis manual de carritos...');
        await this.ejecutarAnalisis(false);
    }
}
