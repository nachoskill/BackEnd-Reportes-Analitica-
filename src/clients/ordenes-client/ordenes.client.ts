import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CarritoDto, OrdenDto, CreateOrdenDto } from './dto/orden.dto';

/**
 * Cliente para el microservicio de Carrito y Órdenes
 * Maneja carritos de compra y órdenes de clientes
 */
@Injectable()
export class OrdenesClient {
    private readonly logger = new Logger(OrdenesClient.name);
    private readonly baseUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.baseUrl = this.configService.get<string>('ORDENES_SERVICE_URL') || 'http://localhost:3002';
    }

    /**
     * Obtiene el carrito de un usuario
     * @param userId - ID del usuario
     * @param token - JWT token de autenticación
     */
    async getCarrito(userId: string, token: string): Promise<CarritoDto> {
        this.logger.log(`Obteniendo carrito del usuario: ${userId}`);

        try {
            const response = await firstValueFrom(
                this.httpService.get<CarritoDto>(`${this.baseUrl}/api/carrito/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            );

            this.logger.log(`Carrito obtenido con ${response.data.items.length} items`);
            return response.data;
        } catch (error) {
            this.logger.error(`Error al obtener carrito: ${error.message}`);
            throw error;
        }
    }

    /**
     * Agrega un producto al carrito
     * @param userId - ID del usuario
     * @param productoId - ID del producto
     * @param cantidad - Cantidad a agregar
     * @param token - JWT token de autenticación
     */
    async addToCarrito(
        userId: string,
        productoId: string,
        cantidad: number,
        token: string
    ): Promise<CarritoDto> {
        this.logger.log(`Agregando producto ${productoId} al carrito de ${userId}`);

        try {
            const response = await firstValueFrom(
                this.httpService.post<CarritoDto>(
                    `${this.baseUrl}/api/carrito/${userId}/items`,
                    { id_producto: productoId, cantidad },
                    { headers: { Authorization: `Bearer ${token}` } }
                )
            );

            return response.data;
        } catch (error) {
            this.logger.error(`Error al agregar al carrito: ${error.message}`);
            throw error;
        }
    }

    /**
     * Obtiene todas las órdenes
     * @param token - JWT token de autenticación
     */
    async getOrdenes(token: string): Promise<OrdenDto[]> {
        this.logger.log('Obteniendo todas las órdenes...');

        try {
            const response = await firstValueFrom(
                this.httpService.get<OrdenDto[]>(`${this.baseUrl}/api/ordenes`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            );

            this.logger.log(`Obtenidas ${response.data.length} órdenes`);
            return response.data;
        } catch (error) {
            this.logger.error(`Error al obtener órdenes: ${error.message}`);
            throw error;
        }
    }

    /**
     * Obtiene órdenes de un usuario específico
     * @param userId - ID del usuario
     * @param token - JWT token de autenticación
     */
    async getOrdenesByUser(userId: string, token: string): Promise<OrdenDto[]> {
        this.logger.log(`Obteniendo órdenes del usuario: ${userId}`);

        try {
            const response = await firstValueFrom(
                this.httpService.get<OrdenDto[]>(`${this.baseUrl}/api/ordenes/usuario/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            );

            return response.data;
        } catch (error) {
            this.logger.error(`Error al obtener órdenes del usuario: ${error.message}`);
            throw error;
        }
    }

    /**
     * Obtiene una orden por ID
     * @param ordenId - ID de la orden
     * @param token - JWT token de autenticación
     */
    async getOrdenById(ordenId: string, token: string): Promise<OrdenDto> {
        this.logger.log(`Obteniendo orden con ID: ${ordenId}`);

        try {
            const response = await firstValueFrom(
                this.httpService.get<OrdenDto>(`${this.baseUrl}/api/ordenes/${ordenId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            );

            return response.data;
        } catch (error) {
            this.logger.error(`Error al obtener orden ${ordenId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Crea una nueva orden
     * @param createOrdenDto - Datos de la orden
     * @param token - JWT token de autenticación
     */
    async createOrden(createOrdenDto: CreateOrdenDto, token: string): Promise<OrdenDto> {
        this.logger.log(`Creando nueva orden para usuario: ${createOrdenDto.id_usuario}`);

        try {
            const response = await firstValueFrom(
                this.httpService.post<OrdenDto>(
                    `${this.baseUrl}/api/ordenes`,
                    createOrdenDto,
                    { headers: { Authorization: `Bearer ${token}` } }
                )
            );

            this.logger.log(`Orden creada con ID: ${response.data.id}`);
            return response.data;
        } catch (error) {
            this.logger.error(`Error al crear orden: ${error.message}`);
            throw error;
        }
    }

    /**
     * Actualiza el estado de una orden
     * @param ordenId - ID de la orden
     * @param estado - Nuevo estado
     * @param token - JWT token de autenticación
     */
    async updateEstadoOrden(
        ordenId: string,
        estado: 'pendiente' | 'procesando' | 'completada' | 'cancelada',
        token: string
    ): Promise<OrdenDto> {
        this.logger.log(`Actualizando estado de orden ${ordenId} a: ${estado}`);

        try {
            const response = await firstValueFrom(
                this.httpService.patch<OrdenDto>(
                    `${this.baseUrl}/api/ordenes/${ordenId}/estado`,
                    { estado },
                    { headers: { Authorization: `Bearer ${token}` } }
                )
            );

            return response.data;
        } catch (error) {
            this.logger.error(`Error al actualizar estado de orden: ${error.message}`);
            throw error;
        }
    }

    /**
     * Obtiene órdenes por estado
     * @param estado - Estado de las órdenes
     * @param token - JWT token de autenticación
     */
    async getOrdenesByEstado(
        estado: 'pendiente' | 'procesando' | 'completada' | 'cancelada',
        token: string
    ): Promise<OrdenDto[]> {
        const ordenes = await this.getOrdenes(token);
        return ordenes.filter(orden => orden.estado === estado);
    }
}
