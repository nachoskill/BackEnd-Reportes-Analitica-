import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ProductoGetDto, TiendaGetDto } from './dto/inventario.dto'; // Importa los DTOs nuevos

@Injectable()
export class InventarioClient {
    private readonly logger = new Logger(InventarioClient.name);
    private readonly baseUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.baseUrl = this.configService.get<string>('INVENTARIO_SERVICE_URL') || 'http://localhost:16004';
    }

    /**
     * Obtiene todas las tiendas (FALTABA ESTE MÉTODO)
     * Ruta: /api/tiendas
     */
    async getTiendas(token: string): Promise<TiendaGetDto[]> {
        this.logger.log('Obteniendo todas las tiendas...');
        try {
            const response = await firstValueFrom(
                this.httpService.get<TiendaGetDto[]>(`${this.baseUrl}/api/tiendas`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            );
            return response.data;
        } catch (error) {
            this.logger.error(`Error al obtener tiendas: ${error.message}`);
            throw error;
        }
    }

    /**
     * Obtiene todos los productos
     * Ruta: /api/productos
     */
    async getProductos(token: string): Promise<ProductoGetDto[]> {
        this.logger.log('Obteniendo todos los productos...');
        try {
            const response = await firstValueFrom(
                this.httpService.get<ProductoGetDto[]>(`${this.baseUrl}/api/productos`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            );
            // Filtramos solo los activos según tu imagen, aunque si eres admin llegan todos
            return response.data; 
        } catch (error) {
            this.logger.error(`Error al obtener productos: ${error.message}`);
            throw error;
        }
    }
}