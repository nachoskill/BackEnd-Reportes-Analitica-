import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ProductoDto, UpdateStockDto, StockResponse } from './dto/producto.dto';
export declare class InventarioClient {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    constructor(httpService: HttpService, configService: ConfigService);
    getProductos(token: string): Promise<ProductoDto[]>;
    getProductoById(productoId: string, token: string): Promise<ProductoDto>;
    getProductosByCategoria(categoria: string, token: string): Promise<ProductoDto[]>;
    updateStock(updateStockDto: UpdateStockDto, token: string): Promise<StockResponse>;
    verificarStock(productoId: string, cantidad: number, token: string): Promise<boolean>;
    getProductosStockBajo(umbral: number, token: string): Promise<ProductoDto[]>;
}
