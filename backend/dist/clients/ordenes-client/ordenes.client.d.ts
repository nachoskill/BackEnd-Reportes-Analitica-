import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CarritoDto, OrdenDto, CreateOrdenDto } from './dto/orden.dto';
export declare class OrdenesClient {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    constructor(httpService: HttpService, configService: ConfigService);
    getCarrito(userId: string, token: string): Promise<CarritoDto>;
    addToCarrito(userId: string, productoId: string, cantidad: number, token: string): Promise<CarritoDto>;
    getOrdenes(token: string): Promise<OrdenDto[]>;
    getOrdenesByUser(userId: string, token: string): Promise<OrdenDto[]>;
    getOrdenById(ordenId: string, token: string): Promise<OrdenDto>;
    createOrden(createOrdenDto: CreateOrdenDto, token: string): Promise<OrdenDto>;
    updateEstadoOrden(ordenId: string, estado: 'pendiente' | 'procesando' | 'completada' | 'cancelada', token: string): Promise<OrdenDto>;
    getOrdenesByEstado(estado: 'pendiente' | 'procesando' | 'completada' | 'cancelada', token: string): Promise<OrdenDto[]>;
}
