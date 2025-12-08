export class TiendaGetDto {
    id_tienda: number;      // Integer según imagen
    id_vendedor: string;    // String (MongoDB ObjectId del vendedor)
    nombre: string;
    id_ciudad: number;
    descripcion: string;
    direccion: string;
    telefono: string;
    fecha_creacion: string; // string($date-time)
    online: boolean;
}

export class ProductoGetDto {
    id_producto: number;
    id_tienda: number;
    nombre: string;
    stock: number;
    precio: number;
    sku: string;
    condicion: string;      // Enum: 'NUEVO', etc.
    fecha_creacion: string; // string($date-time)
    marca: string;
    categoria: string;      // Enum: 'GENERAL', etc.
    descripcion: string;
    activo: boolean;
}