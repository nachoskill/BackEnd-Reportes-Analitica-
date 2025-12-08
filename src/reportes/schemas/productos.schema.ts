import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Schema para productos embebidos (sin _id propio)
@Schema({ _id: false })
export class ProductoEmbebido {
  @Prop({ required: true })
  id_producto: number;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  categoria: string;

  @Prop({ required: true })
  precio: number;

  @Prop({ required: true })
  cantidad: number;

  @Prop({ default: 0 })
  veces_vendido: number;

  @Prop({ default: 0 })
  veces_buscado: number;

  @Prop({ type: Date })
  fecha_creacion: Date;
}

export const ProductoEmbebidoSchema = SchemaFactory.createForClass(ProductoEmbebido);

// Schema principal del documento Reporte (uno por tienda)
@Schema({ collection: 'productos' })
export class Productos extends Document {
  @Prop({ required: true, unique: true })
  id_tienda: number;

  @Prop({ type: [ProductoEmbebidoSchema], default: [] })
  productos: ProductoEmbebido[];
}

export const ProductosSchema = SchemaFactory.createForClass(Productos);