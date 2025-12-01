import { Document } from 'mongoose';
export declare class ProductoEmbebido {
    id_producto: number;
    nombre: string;
    categoria: string;
    precio: number;
    cantidad: number;
    veces_vendido: number;
    veces_buscado: number;
    fecha_creacion: Date;
}
export declare const ProductoEmbebidoSchema: import("mongoose").Schema<ProductoEmbebido, import("mongoose").Model<ProductoEmbebido, any, any, any, Document<unknown, any, ProductoEmbebido, any, {}> & ProductoEmbebido & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProductoEmbebido, Document<unknown, {}, import("mongoose").FlatRecord<ProductoEmbebido>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ProductoEmbebido> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare class Productos extends Document {
    id_tienda: number;
    productos: ProductoEmbebido[];
}
export declare const ProductosSchema: import("mongoose").Schema<Productos, import("mongoose").Model<Productos, any, any, any, Document<unknown, any, Productos, any, {}> & Productos & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Productos, Document<unknown, {}, import("mongoose").FlatRecord<Productos>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Productos> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
