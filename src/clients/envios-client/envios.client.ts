import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { EnvioDto, CreateEnvioDto, TrackingInfoDto } from './dto/envio.dto';

/**
 * Cliente para el microservicio de Envíos
 * Maneja seguimiento de envíos y logística
 */
@Injectable()
export class EnviosClient {
    private readonly logger = new Logger(EnviosClient.name);
    private readonly baseUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.baseUrl = this.configService.get<string>('ENVIOS_SERVICE_URL') || 'http://localhost:3003';
    }

    /**
     * Obtiene todos los envíos
     * @param token - JWT token de autenticación
     */
    async getEnvios(token: string): Promise<EnvioDto[]> {
        this.logger.log('Obteniendo todos los envíos...');

        try {
            const response = await firstValueFrom(
                this.httpService.get<EnvioDto[]>(`${this.baseUrl}/api/envios`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            );

            this.logger.log(`Obtenidos ${response.data.length} envíos`);
            return response.data;
        } catch (error) {
            this.logger.error(`Error al obtener envíos: ${error.message}`);
            throw error;
        }
    }

    /**
     * Obtiene un envío por ID
     * @param envioId - ID del envío
     * @param token - JWT token de autenticación
     */
    async getEnvioById(envioId: string, token: string): Promise<EnvioDto> {
        this.logger.log(`Obteniendo envío con ID: ${envioId}`);

        try {
            const response = await firstValueFrom(
                this.httpService.get<EnvioDto>(`${this.baseUrl}/api/envios/${envioId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            );

            return response.data;
        } catch (error) {
            this.logger.error(`Error al obtener envío ${envioId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Obtiene envíos por orden
     * @param ordenId - ID de la orden
     * @param token - JWT token de autenticación
     */
    async getEnviosByOrden(ordenId: string, token: string): Promise<EnvioDto[]> {
        this.logger.log(`Obteniendo envíos de la orden: ${ordenId}`);

        try {
            const response = await firstValueFrom(
                this.httpService.get<EnvioDto[]>(`${this.baseUrl}/api/envios/orden/${ordenId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            );

            return response.data;
        } catch (error) {
            this.logger.error(`Error al obtener envíos de la orden: ${error.message}`);
            throw error;
        }
    }

    /**
     * Obtiene envíos de un usuario
     * @param userId - ID del usuario
     * @param token - JWT token de autenticación
     */
    async getEnviosByUser(userId: string, token: string): Promise<EnvioDto[]> {
        this.logger.log(`Obteniendo envíos del usuario: ${userId}`);

        try {
            const response = await firstValueFrom(
                this.httpService.get<EnvioDto[]>(`${this.baseUrl}/api/envios/usuario/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            );

            return response.data;
        } catch (error) {
            this.logger.error(`Error al obtener envíos del usuario: ${error.message}`);
            throw error;
        }
    }

    /**
     * Crea un nuevo envío
     * @param createEnvioDto - Datos del envío
     * @param token - JWT token de autenticación
     */
    async createEnvio(createEnvioDto: CreateEnvioDto, token: string): Promise<EnvioDto> {
        this.logger.log(`Creando nuevo envío para orden: ${createEnvioDto.id_orden}`);

        try {
            const response = await firstValueFrom(
                this.httpService.post<EnvioDto>(
                    `${this.baseUrl}/api/envios`,
                    createEnvioDto,
                    { headers: { Authorization: `Bearer ${token}` } }
                )
            );

            this.logger.log(`Envío creado con ID: ${response.data.id}`);
            return response.data;
        } catch (error) {
            this.logger.error(`Error al crear envío: ${error.message}`);
            throw error;
        }
    }

    /**
     * Actualiza el estado de un envío
     * @param envioId - ID del envío
     * @param estado - Nuevo estado
     * @param token - JWT token de autenticación
     */
    async updateEstadoEnvio(
        envioId: string,
        estado: 'pendiente' | 'en_transito' | 'entregado' | 'cancelado',
        token: string
    ): Promise<EnvioDto> {
        this.logger.log(`Actualizando estado de envío ${envioId} a: ${estado}`);

        try {
            const response = await firstValueFrom(
                this.httpService.patch<EnvioDto>(
                    `${this.baseUrl}/api/envios/${envioId}/estado`,
                    { estado },
                    { headers: { Authorization: `Bearer ${token}` } }
                )
            );

            return response.data;
        } catch (error) {
            this.logger.error(`Error al actualizar estado de envío: ${error.message}`);
            throw error;
        }
    }

    /**
     * Obtiene información de seguimiento de un envío
     * @param numeroSeguimiento - Número de seguimiento
     * @param token - JWT token de autenticación
     */
    async trackEnvio(numeroSeguimiento: string, token: string): Promise<TrackingInfoDto> {
        this.logger.log(`Rastreando envío: ${numeroSeguimiento}`);

        try {
            const response = await firstValueFrom(
                this.httpService.get<TrackingInfoDto>(
                    `${this.baseUrl}/api/envios/tracking/${numeroSeguimiento}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                )
            );

            return response.data;
        } catch (error) {
            this.logger.error(`Error al rastrear envío: ${error.message}`);
            throw error;
        }
    }

    /**
     * Obtiene envíos por estado
     * @param estado - Estado de los envíos
     * @param token - JWT token de autenticación
     */
    async getEnviosByEstado(
        estado: 'pendiente' | 'en_transito' | 'entregado' | 'cancelado',
        token: string
    ): Promise<EnvioDto[]> {
        const envios = await this.getEnvios(token);
        return envios.filter(envio => envio.estado === estado);
    }

    /**
     * Obtiene envíos en tránsito
     * @param token - JWT token de autenticación
     */
    async getEnviosEnTransito(token: string): Promise<EnvioDto[]> {
        return this.getEnviosByEstado('en_transito', token);
    }

    /**
     * Obtiene envíos pendientes
     * @param token - JWT token de autenticación
     */
    async getEnviosPendientes(token: string): Promise<EnvioDto[]> {
        return this.getEnviosByEstado('pendiente', token);
    }
}
