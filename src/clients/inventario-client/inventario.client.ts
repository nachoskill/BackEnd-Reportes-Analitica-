import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ProductoDto, UpdateStockDto, StockResponse } from './dto/producto.dto';

/**
 * Cliente para el microservicio de Inventario
 * Maneja productos, stock y categorías
 */
@Injectable()
export class InventarioClient {
    private readonly logger = new Logger(InventarioClient.name);
    private readonly baseUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.baseUrl = this.configService.get<string>('INVENTARIO_SERVICE_URL') || 'http://localhost:3001';
    }

    /**
     * Obtiene todos los productos
     * @param token - JWT token de autenticación
     */
    async getProductos(token: string): Promise<ProductoDto[]> {
        this.logger.log('Obteniendo todos los productos...');

        try {
            const response = await firstValueFrom(
                this.httpService.get<ProductoDto[]>(`${this.baseUrl}/api/productos`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            );

            this.logger.log(`Obtenidos ${response.data.length} productos`);
            return response.data;
        } catch (error) {
            this.logger.error(`Error al obtener productos: ${error.message}`);
            throw error;
        }
    }

    /**
     * Obtiene un producto por ID
     * @param productoId - ID del producto
     * @param token - JWT token de autenticación
     */
    async getProductoById(productoId: string, token: string): Promise<ProductoDto> {
        this.logger.log(`Obteniendo producto con ID: ${productoId}`);

        try {
            const response = await firstValueFrom(
                this.httpService.get<ProductoDto>(`${this.baseUrl}/api/productos/${productoId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            );

            return response.data;
        } catch (error) {
            this.logger.error(`Error al obtener producto ${productoId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Obtiene productos por categoría
     * @param categoria - Nombre de la categoría
     * @param token - JWT token de autenticación
     */
    async getProductosByCategoria(categoria: string, token: string): Promise<ProductoDto[]> {
        this.logger.log(`Obteniendo productos de categoría: ${categoria}`);

        try {
            const response = await firstValueFrom(
                this.httpService.get<ProductoDto[]>(`${this.baseUrl}/api/productos/categoria/${categoria}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            );

            return response.data;
        } catch (error) {
            this.logger.error(`Error al obtener productos de categoría ${categoria}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Actualiza el stock de un producto
     * @param updateStockDto - Datos de actualización de stock
     * @param token - JWT token de autenticación
     */
    async updateStock(updateStockDto: UpdateStockDto, token: string): Promise<StockResponse> {
        this.logger.log(`Actualizando stock del producto: ${updateStockDto.id_producto}`);

        try {
            const response = await firstValueFrom(
                this.httpService.patch<StockResponse>(
                    `${this.baseUrl}/api/productos/${updateStockDto.id_producto}/stock`,
                    updateStockDto,
                    { headers: { Authorization: `Bearer ${token}` } }
                )
            );

            this.logger.log(`Stock actualizado: ${response.data.stock_anterior} → ${response.data.stock_nuevo}`);
            return response.data;
        } catch (error) {
            this.logger.error(`Error al actualizar stock: ${error.message}`);
            throw error;
        }
    }

    /**
     * Verifica si hay stock disponible
     * @param productoId - ID del producto
     * @param cantidad - Cantidad requerida
     * @param token - JWT token de autenticación
     */
    async verificarStock(productoId: string, cantidad: number, token: string): Promise<boolean> {
        const producto = await this.getProductoById(productoId, token);
        return producto.stock >= cantidad;
    }

    /**
     * Obtiene productos con stock bajo (menos de cierta cantidad)
     * @param umbral - Cantidad mínima de stock
     * @param token - JWT token de autenticación
     */
    async getProductosStockBajo(umbral: number, token: string): Promise<ProductoDto[]> {
        const productos = await this.getProductos(token);
        return productos.filter(p => p.stock < umbral && p.activo);
    }
}
