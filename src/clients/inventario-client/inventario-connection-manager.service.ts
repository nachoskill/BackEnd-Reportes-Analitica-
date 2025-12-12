import { Injectable, Logger } from '@nestjs/common';

/**
 * Servicio que gestiona la conexión con el microservicio de inventario
 * implementando reintentos limitados y no bloqueantes.
 * 
 * - Intenta conectar al inicio con un máximo de reintentos
 * - No bloquea el inicio del microservicio
 * - Permite degradación elegante del servicio
 */
@Injectable()
export class InventarioConnectionManager {
    private readonly logger = new Logger(InventarioConnectionManager.name);
    private isConnected: boolean = false;
    private connectionAttempts: number = 0;
    private readonly MAX_RETRIES = 3;
    private readonly RETRY_DELAY_MS = 5000; // 5 segundos entre reintentos
    private readonly INITIAL_DELAY_MS = 3000; // 3 segundos antes del primer intento

    /**
     * Intenta establecer conexión con reintentos limitados
     * Esta función NO es bloqueante - se ejecuta en background
     */
    async attemptConnection(connectFn: () => Promise<void>): Promise<void> {
        // Esperar un poco antes del primer intento para que el auth service esté listo
        await this.delay(this.INITIAL_DELAY_MS);

        for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
            this.connectionAttempts = attempt;

            try {
                this.logger.log(`🔄 Intento ${attempt}/${this.MAX_RETRIES} de conexión al servicio de inventario...`);

                await connectFn();

                this.isConnected = true;
                this.logger.log(`✅ Conexión exitosa al servicio de inventario (intento ${attempt})`);
                return;

            } catch (error) {
                this.logger.warn(
                    `⚠️ Intento ${attempt}/${this.MAX_RETRIES} fallido: ${error.message}`
                );

                // Si no es el último intento, esperar antes de reintentar
                if (attempt < this.MAX_RETRIES) {
                    this.logger.log(`⏳ Esperando ${this.RETRY_DELAY_MS / 1000}s antes del siguiente intento...`);
                    await this.delay(this.RETRY_DELAY_MS);
                }
            }
        }

        // Si llegamos aquí, todos los intentos fallaron
        this.isConnected = false;
        this.logger.error(
            `❌ No se pudo conectar al servicio de inventario después de ${this.MAX_RETRIES} intentos. ` +
            `El microservicio continuará funcionando con funcionalidad reducida.`
        );
    }

    /**
     * Verifica si hay conexión establecida
     */
    isServiceConnected(): boolean {
        return this.isConnected;
    }

    /**
     * Obtiene el número de intentos realizados
     */
    getConnectionAttempts(): number {
        return this.connectionAttempts;
    }

    /**
     * Marca la conexión como establecida (para uso externo)
     */
    markAsConnected(): void {
        this.isConnected = true;
    }

    /**
     * Marca la conexión como desconectada (para uso externo)
     */
    markAsDisconnected(): void {
        this.isConnected = false;
    }

    /**
     * Obtiene el estado de la conexión para health checks
     */
    getConnectionStatus(): {
        connected: boolean;
        attempts: number;
        maxRetries: number;
    } {
        return {
            connected: this.isConnected,
            attempts: this.connectionAttempts,
            maxRetries: this.MAX_RETRIES,
        };
    }

    /**
     * Utilidad para esperar un tiempo determinado
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
