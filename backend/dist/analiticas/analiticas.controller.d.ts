import { AnaliticasService } from './analiticas.services';
export declare class AnaliticasController {
    private readonly analiticasService;
    constructor(analiticasService: AnaliticasService);
    getEstadoCarritos(): Promise<{
        name: any;
        value: any;
    }[]>;
    getTendenciaProductos(): Promise<{
        completado: any[];
        abandonado: any[];
        cancelado: any[];
    }>;
    getIngresosMensuales(): Promise<any[]>;
    getEnviosRegional(): Promise<{
        name: any;
        value: any;
    }[]>;
    getKpiIngresos(): Promise<{
        ingresos: any;
        porcentaje: number;
    }>;
    getKpiMejorRegion(): Promise<{
        mejorRegion: any;
        porcentajeRegion: number;
    }>;
}
