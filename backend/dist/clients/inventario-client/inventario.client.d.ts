import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ProductoGetDto, TiendaGetDto } from './dto/inventario.dto';
export declare class InventarioClient {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    constructor(httpService: HttpService, configService: ConfigService);
    getTiendas(token: string): Promise<TiendaGetDto[]>;
    getProductos(token: string): Promise<ProductoGetDto[]>;
}
