export interface ProductoDto {
    id: string;
    nombre: string;
    descripcion?: string;
    precio: number;
    stock: number;
    categoria?: string;
    sku?: string;
    activo: boolean;
    imagen?: string;
}
export interface UpdateStockDto {
    id_producto: string;
    cantidad: number;
    tipo: 'incremento' | 'decremento' | 'ajuste';
}
export interface StockResponse {
    id_producto: string;
    stock_anterior: number;
    stock_nuevo: number;
    fecha_actualizacion: Date;
}
