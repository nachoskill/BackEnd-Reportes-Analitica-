import { ReportesService } from './reportes.services';
import { FiltroReporteDto } from './schemas/dto/filtro-reporte.dto';
import { PaginacionDto } from './schemas/dto/paginacion.dto';
import { Response } from 'express';
export declare class ReportesController {
    private readonly reportesService;
    constructor(reportesService: ReportesService);
    obtenerTiendasVendedor(id_usuario: number): Promise<{
        tiendas: import("./schemas/vendedores.schema").TiendaEmbebida[];
        tienda_default: import("./schemas/vendedores.schema").TiendaEmbebida[];
    }>;
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
