import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
    CarritoDto,
    AnalisisCarritosPagadosDto,
    CarritoPagadoDto,
    ProductosVendidosDto
} from './dto/orden.dto';

/**
 * Cliente para el microservicio de Carrito y Órdenes
 * Maneja análisis de carritos pagados
 */
@Injectable()
export class OrdenesClient {
    private readonly logger = new Logger(OrdenesClient.name);
    private readonly baseUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.baseUrl = this.configService.get<string>('ORDENES_SERVICE_URL') || 'http://localhost:4010';
    }

    /**
     * Obtiene todos los carritos
     * @param token - JWT token de autenticación
     */
    async getAllCarritos(token: string): Promise<CarritoDto[]> {
        this.logger.log('Obteniendo todos los carritos...');

        try {
            const response = await firstValueFrom(
                this.httpService.get<CarritoDto[]>(`${this.baseUrl}/api/v1/carrito/obtenerCarritos`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            );

            this.logger.log(`Obtenidos ${response.data.length} carritos`);
            return response.data;
        } catch (error) {
            this.logger.error(`Error al obtener carritos: ${error.message}`);
            throw error;
        }
    }

    /**
     * Obtiene el estado de pago de un carrito
     * @param carritoId - ID del carrito
     * @param token - JWT token de autenticación
     */
    async getEstadoPago(carritoId: string, token: string): Promise<string> {
        try {
            const response = await firstValueFrom(
                this.httpService.get<{ estado: string }>(`${this.baseUrl}/api/v1/ordenes/estado-pago/${carritoId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            );

            return response.data.estado;
        } catch (error) {
            this.logger.error(`Error al obtener estado de pago del carrito ${carritoId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Analiza todos los carritos y obtiene información de los carritos pagados
     * Realiza las peticiones de manera asíncrona y eficiente
     * @param token - JWT token de autenticación
     */
    async analizarCarritosPagados(token: string): Promise<AnalisisCarritosPagadosDto> {
        this.logger.log('🔍 Iniciando análisis de carritos pagados...');

        try {
            // Paso 1: Obtener todos los carritos
            const carritos = await this.getAllCarritos(token);
            this.logger.log(`📦 Obtenidos ${carritos.length} carritos para analizar`);

            // Variables para almacenar resultados
            const carritosPagados: CarritoPagadoDto[] = [];
            let montoTotalPagado = 0;
            const productosVendidos: ProductosVendidosDto = {};

            // Paso 2: Verificar estado de pago de todos los carritos de manera asíncrona
            const estadosPromises = carritos.map(async (carrito) => {
                try {
                    const estado = await this.getEstadoPago(carrito.id, token);
                    return { carrito, estado };
                } catch (error) {
                    this.logger.warn(`⚠️ No se pudo obtener estado del carrito ${carrito.id}, asumiendo NO PAGADO`);
                    return { carrito, estado: 'NO_PAGADO' };
                }
            });

            // Esperar a que todas las peticiones de estado se completen
            const resultados = await Promise.all(estadosPromises);

            // Paso 3: Filtrar y acumular datos de carritos pagados
            for (const { carrito, estado } of resultados) {
                if (estado === 'PAGADO') {
                    // Agregar carrito pagado
                    carritosPagados.push({
                        id: carrito.id,
                        monto: carrito.total,
                        estado: 'PAGADO',
                        items: carrito.items
                    });

                    // Sumar monto total pagado
                    montoTotalPagado += carrito.total;

                    // Contar productos vendidos
                    carrito.items.forEach(item => {
                        if (!productosVendidos[item.id_producto]) {
                            productosVendidos[item.id_producto] = 0;
                        }
                        productosVendidos[item.id_producto] += item.cantidad;
                    });
                }
            }

            this.logger.log(`✅ Análisis completado: ${carritosPagados.length} carritos pagados de ${carritos.length} totales`);
            this.logger.log(`💰 Monto total pagado: $${montoTotalPagado.toFixed(2)}`);
            this.logger.log(`📊 Productos únicos vendidos: ${Object.keys(productosVendidos).length}`);

            return {
                carritosPagados,
                montoTotalPagado,
                productosVendidos
            };
        } catch (error) {
            this.logger.error(`❌ Error al analizar carritos pagados: ${error.message}`);
            throw error;
        }
    }
}
