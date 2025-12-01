import { FiltroReporteDto } from './schemas/dto/filtro-reporte.dto';
export declare class FiltrosService {
    construirQuery(filtros: FiltroReporteDto, prefijo?: string): {
        query: any;
        sort: any;
    };
}
