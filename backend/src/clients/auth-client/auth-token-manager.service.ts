import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { AuthClient } from './auth.client';

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

    // Renovar cada 21 horas (75600000 ms)
    private readonly RENEWAL_INTERVAL_MS = 21 * 60 * 60 * 1000;

    constructor(private readonly authClient: AuthClient) { }

    /**
     * Se ejecuta automáticamente cuando el módulo se inicializa
     */
    async onModuleInit() {
        this.logger.log('🔐 Iniciando gestor de tokens automático...');

        // Obtener token inicial
        await this.refreshToken();

        // Configurar renovación automática cada 21 horas
        this.renewalInterval = setInterval(async () => {
            this.logger.log('⏰ Renovando token automáticamente (cada 21 horas)...');
            await this.refreshToken();
        }, this.RENEWAL_INTERVAL_MS);

        this.logger.log(`✅ Token manager iniciado. Renovación automática cada 21 horas.`);
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
     */
    private async refreshToken(): Promise<void> {
        try {
            const loginResponse = await this.authClient.login();
            this.accessToken = loginResponse.access_token;

            this.logger.log('✅ Token obtenido y almacenado en memoria');
            this.logger.debug(`Token: ${this.accessToken.substring(0, 20)}...`);
        } catch (error) {
            this.logger.error(`❌ Error al obtener token: ${error.message}`);
            // No lanzar error para evitar que la app falle al iniciar
            // El siguiente intento será en 21 horas
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
        await this.refreshToken();
    }
}
