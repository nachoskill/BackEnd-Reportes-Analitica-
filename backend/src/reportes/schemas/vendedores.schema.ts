import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Schema para tiendas embebidas (sin _id propio)
@Schema({ _id: false })
export class TiendaEmbebida {
    @Prop({ required: true })
    id_tienda: number;

    @Prop({ required: true })
    nombre_tienda: string;
}

export const TiendaEmbebidaSchema = SchemaFactory.createForClass(TiendaEmbebida);

// Schema principal del documento Vendedor
@Schema({ collection: 'vendedores' })
export class Vendedor extends Document {
    @Prop({ required: true, unique: true })
    id_vendedor: string; // Este es el id_usuario del vendedor

    @Prop({ type: [TiendaEmbebidaSchema], default: [] })
    tiendas: TiendaEmbebida[];
}

export const VendedorSchema = SchemaFactory.createForClass(Vendedor);
