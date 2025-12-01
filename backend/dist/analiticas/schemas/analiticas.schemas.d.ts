import { Document } from 'mongoose';
export type PagoDocument = Pago & Document;
export type CarritoDocument = Carrito & Document;
export type ProductoDocument = Producto & Document;
export type EnvioDocument = Envio & Document;
export declare class Producto {
    id_producto: number;
    nombre: string;
    precio: number;
    categoria: string;
    cantidad: number;
    veces_vendido: number;
    veces_buscado: number;
    fecha_creacion: Date;
}
export declare class Carrito {
    _id: number;
    items: string[];
}
export declare class Pago {
    id_carrito: number;
    estado: string;
}
export declare class Envio {
    id_envio: number;
    id_carrito: number;
    id_usuario: number;
    region: string;
}
export declare const ProductoSchema: import("mongoose").Schema<Producto, import("mongoose").Model<Producto, any, any, any, Document<unknown, any, Producto, any, {}> & Producto & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Producto, Document<unknown, {}, import("mongoose").FlatRecord<Producto>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Producto> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare const CarritoSchema: import("mongoose").Schema<Carrito, import("mongoose").Model<Carrito, any, any, any, Document<unknown, any, Carrito, any, {}> & Carrito & Required<{
    _id: number;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Carrito, Document<unknown, {}, import("mongoose").FlatRecord<Carrito>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Carrito> & Required<{
    _id: number;
}> & {
    __v: number;
}>;
export declare const PagoSchema: import("mongoose").Schema<Pago, import("mongoose").Model<Pago, any, any, any, Document<unknown, any, Pago, any, {}> & Pago & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Pago, Document<unknown, {}, import("mongoose").FlatRecord<Pago>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Pago> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare const EnvioSchema: import("mongoose").Schema<Envio, import("mongoose").Model<Envio, any, any, any, Document<unknown, any, Envio, any, {}> & Envio & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Envio, Document<unknown, {}, import("mongoose").FlatRecord<Envio>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Envio> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
