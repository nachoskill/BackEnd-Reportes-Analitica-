import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { AuthClient } from './auth.client';
import { AuthConnectionManager } from './auth-connection-manager.service';

/**
 * Servicio que gestiona automáticamente el token de autenticación
 * con el microservicio de auth.
 * 
 * - Obtiene el token al iniciar el módulo
 * - Renueva el token cada 21 horas (3 horas antes de expirar)
 * - Almacena el token en memoria
 */
@Injectable()
export class AuthTokenManager implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(AuthTokenManager.name);
    private accessToken: string | null = null;
    private renewalInterval: NodeJS.Timeout | null = null;

    // Renovar cada 20 horas (72000000 ms)
    private readonly RENEWAL_INTERVAL_MS = 20 * 60 * 60 * 1000;

    constructor(
        private readonly authClient: AuthClient,
        private readonly connectionManager: AuthConnectionManager,
    ) { }

    /**
     * Se ejecuta automáticamente cuando el módulo se inicializa
     * AHORA ES NO BLOQUEANTE - usa el connection manager
     */
    async onModuleInit() {
        this.logger.log('🔐 Iniciando gestor de tokens automático...');

        // Intentar conectar en background (NO BLOQUEANTE)
        this.connectionManager.attemptConnection(async () => {
            // Durante la conexión inicial, lanzar errores para que el connection manager los detecte
            await this.refreshToken(true);
        }).catch(error => {
            this.logger.warn('⚠️ No se pudo obtener token inicial, continuando sin autenticación externa');
        });

        // Configurar renovación automática cada 20 horas
        this.renewalInterval = setInterval(async () => {
            this.logger.log('⏰ Renovando token automáticamente (cada 20 horas)...');
            // En renovaciones automáticas, NO lanzar errores
            await this.refreshToken(false);
        }, this.RENEWAL_INTERVAL_MS);

        this.logger.log(`✅ Token manager iniciado. Renovación automática cada 20 horas.`);
    }

    /**
     * Se ejecuta cuando el módulo se destruye (al cerrar la aplicación)
     */
    onModuleDestroy() {
        if (this.renewalInterval) {
            clearInterval(this.renewalInterval);
            this.logger.log('🛑 Token manager detenido');
        }
    }

    /**
     * Obtiene un nuevo token del microservicio de autenticación
     * @param throwOnError Si es true, lanza el error en lugar de capturarlo (para conexión inicial)
     */
    private async refreshToken(throwOnError: boolean = false): Promise<void> {
        try {
            const loginResponse = await this.authClient.login();
            this.accessToken = loginResponse.access_token;

            this.logger.log('✅ Token obtenido y almacenado en memoria');
            this.logger.debug(`Token: ${this.accessToken.substring(0, 20)}...`);

            // Marcar como conectado en el connection manager
            this.connectionManager.markAsConnected();
        } catch (error) {
            this.logger.error(`❌ Error al obtener token: ${error.message}`);

            // Si estamos en fase de conexión inicial, lanzar el error
            if (throwOnError) {
                throw error;
            }
            // En renovaciones automáticas, no lanzar error para evitar que la app falle
            // El siguiente intento será en 20 horas
        }
    }

    /**
     * Obtiene el token actual almacenado en memoria
     * @returns Token de acceso o null si no está disponible
     */
    getToken(): string | null {
        if (!this.accessToken) {
            this.logger.warn('⚠️ No hay token disponible. Intentando obtener uno...');
            // Intentar obtener token de forma asíncrona (no bloqueante)
            this.refreshToken().catch(err =>
                this.logger.error(`Error al obtener token: ${err.message}`)
            );
        }
        return this.accessToken;
    }

    /**
     * Verifica si hay un token válido disponible
     */
    hasValidToken(): boolean {
        return this.accessToken !== null;
    }

    /**
     * Fuerza la renovación del token manualmente
     */
    async forceRefresh(): Promise<void> {
        this.logger.log('🔄 Forzando renovación manual del token...');
        await this.refreshToken(false);
    }
}
