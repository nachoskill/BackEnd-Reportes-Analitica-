export interface EnvioDto {
    id: string;
    id_orden: string;
    id_usuario: string;
    estado: 'pendiente' | 'en_transito' | 'entregado' | 'cancelado';
    direccion_destino: DireccionEnvioDto;
    empresa_transporte?: string;
    numero_seguimiento?: string;
    fecha_estimada_entrega?: Date;
    fecha_entrega?: Date;
    fecha_creacion: Date;
    fecha_actualizacion: Date;
}

export interface DireccionEnvioDto {
    calle: string;
    numero: string;
    comuna: string;
    ciudad: string;
    region: string;
    codigo_postal?: string;
    referencia?: string;
}

export interface CreateEnvioDto {
    id_orden: string;
    id_usuario: string;
    direccion_destino: DireccionEnvioDto;
    empresa_transporte?: string;
}

export interface TrackingInfoDto {
    numero_seguimiento: string;
    estado: string;
    ubicacion_actual?: string;
    historial: TrackingEventDto[];
}

export interface TrackingEventDto {
    fecha: Date;
    estado: string;
    ubicacion: string;
    descripcion: string;
}
