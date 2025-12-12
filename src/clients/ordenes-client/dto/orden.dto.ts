export interface CarritoDto {
    id: string;
    id_usuario: string;
    items: CarritoItemDto[];
    total: number;
    fecha_creacion: Date;
    fecha_actualizacion: Date;
}

export interface CarritoItemDto {
    id_producto: string;
    nombre_producto: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}

export interface OrdenDto {
    id: string;
    id_usuario: string;
    items: OrdenItemDto[];
    subtotal: number;
    impuestos: number;
    total: number;
    estado: 'pendiente' | 'procesando' | 'completada' | 'cancelada';
    direccion_envio?: DireccionDto;
    metodo_pago?: string;
    fecha_creacion: Date;
    fecha_actualizacion: Date;
}

export interface OrdenItemDto {
    id_producto: string;
    nombre_producto: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}

export interface DireccionDto {
    calle: string;
    numero: string;
    comuna: string;
    ciudad: string;
    region: string;
    codigo_postal?: string;
}

export interface CreateOrdenDto {
    id_usuario: string;
    items: {
        id_producto: string;
        cantidad: number;
    }[];
    direccion_envio: DireccionDto;
    metodo_pago: string;
}

// DTOs para análisis de carritos pagados
export interface CarritoPagadoDto {
    id: string;
    monto: number;
    estado: string;
    items: CarritoItemDto[];
}

export interface ProductosVendidosDto {
    [productoId: string]: number;
}

export interface AnalisisCarritosPagadosDto {
    carritosPagados: CarritoPagadoDto[];
    montoTotalPagado: number;
    productosVendidos: ProductosVendidosDto;
}
