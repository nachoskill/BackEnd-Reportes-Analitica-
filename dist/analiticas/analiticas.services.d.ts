import { Model } from 'mongoose';
import { PagoDocument, EnvioDocument, ProductoDocument, CarritoDocument } from './schemas/analiticas.schemas';
export declare class AnaliticasService {
    private pagoModel;
    private envioModel;
    private productoModel;
    private carritoModel;
    constructor(pagoModel: Model<PagoDocument>, envioModel: Model<EnvioDocument>, productoModel: Model<ProductoDocument>, carritoModel: Model<CarritoDocument>);
    getEnviosRegional(): Promise<{
        name: any;
        value: any;
    }[]>;
    getKpiMejorRegion(): Promise<{
        mejorRegion: any;
        porcentajeRegion: number;
    }>;
    getKpiIngresos(): Promise<{
        ingresos: any;
        porcentaje: number;
    }>;
    getIngresosMensuales(): Promise<any[]>;
    getEstadoCarritos(): Promise<{
        name: any;
        value: any;
    }[]>;
    getTendenciaProductos(): Promise<{
        completado: any[];
        abandonado: any[];
        cancelado: any[];
    }>;
}
