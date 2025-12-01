import { Document } from 'mongoose';
export declare class TiendaEmbebida {
    id_tienda: number;
    nombre_tienda: string;
}
export declare const TiendaEmbebidaSchema: import("mongoose").Schema<TiendaEmbebida, import("mongoose").Model<TiendaEmbebida, any, any, any, Document<unknown, any, TiendaEmbebida, any, {}> & TiendaEmbebida & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, TiendaEmbebida, Document<unknown, {}, import("mongoose").FlatRecord<TiendaEmbebida>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<TiendaEmbebida> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare class Vendedor extends Document {
    id_vendedor: number;
    tiendas: TiendaEmbebida[];
}
export declare const VendedorSchema: import("mongoose").Schema<Vendedor, import("mongoose").Model<Vendedor, any, any, any, Document<unknown, any, Vendedor, any, {}> & Vendedor & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Vendedor, Document<unknown, {}, import("mongoose").FlatRecord<Vendedor>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Vendedor> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
