import { Model } from 'mongoose';
import { Productos } from './schemas/productos.schema';
import { Vendedor } from './schemas/vendedores.schema';
import { FiltroReporteDto } from './schemas/dto/filtro-reporte.dto';
import { PaginacionDto } from './schemas/dto/paginacion.dto';
import { Response } from 'express';
import { FiltrosService } from './filtros.services';
export declare class ReportesService {
    private productoModel;
    private vendedorModel;
    private filtrosService;
    constructor(productoModel: Model<Productos>, vendedorModel: Model<Vendedor>, filtrosService: FiltrosService);
    obtenerTiendasVendedor(id_usuario: number): Promise<{
        tiendas: import("./schemas/vendedores.schema").TiendaEmbebida[];
        tienda_default: import("./schemas/vendedores.schema").TiendaEmbebida[];
    }>;
    private validarTiendaVendedor;
    obtenerDatos(id_usuario: number, paginacionDto: PaginacionDto): Promise<{
        productos: any[];
        total: any;
        page: number;
        limit: number;
        totalPages: number;
        id_tienda: number;
        nombre_tienda: string;
    }>;
    obtenerDatosConFiltros(filtros: FiltroReporteDto): Promise<any[]>;
    generarReportePDF(filtros: FiltroReporteDto, res: Response): Promise<void>;
}
