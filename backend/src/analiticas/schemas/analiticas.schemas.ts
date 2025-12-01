import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Tipos para TypeScript (opcionales, pero útiles)
export type PagoDocument = Pago & Document;
export type CarritoDocument = Carrito & Document;
export type ProductoDocument = Producto & Document;
export type EnvioDocument = Envio & Document;

// --- PRODUCTOS ---
// Origen: Productos.json
@Schema({ collection: 'productos', _id: false })
export class Producto {
  @Prop({ type: Number, required: true })
  id_producto: number; // Cambiado de '_id' a 'id_producto'

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  precio: number;

  @Prop()
  categoria: string;

  @Prop()
  cantidad: number;      // Cambiado de 'stock' a 'cantidad'

  @Prop()
  veces_vendido: number;

  @Prop()
  veces_buscado: number;

  @Prop()
  fecha_creacion: Date;
}

// --- CARRITOS ---
// Origen: Carrito.json
@Schema({ collection: 'carritos', _id: false })
export class Carrito {
  @Prop({ type: Number, required: true })
  _id: number; // ID Manual (2000, 2001...)

  @Prop({ type: [String], required: true })
  items: string[]; // ["5000", "5001"]
}

// --- PAGOS ---
// Origen: Pagos.json
// Nota: Pagos NO tiene ID propio en tu JSON, dejamos que Mongo genere su _id.
@Schema({ collection: 'pagos' })
export class Pago {
  @Prop({ type: Number, required: true, index: true })
  id_carrito: number; // FK hacia Carrito

  @Prop({ required: true })
  estado: string; // "completado", "abandonado", etc.
}

// --- ENVIOS ---
// Origen: Envio.json
@Schema({ collection: 'envios' }) // Nombre real de tu colección en Mongo
export class Envio {
  @Prop()
  id_envio: number;

  @Prop()
  id_carrito: number;

  @Prop()
  id_usuario: number;

  @Prop()
  region: string; 
}

// Generamos los Schemas de Mongoose
export const ProductoSchema = SchemaFactory.createForClass(Producto);
export const CarritoSchema = SchemaFactory.createForClass(Carrito);
export const PagoSchema = SchemaFactory.createForClass(Pago);
export const EnvioSchema = SchemaFactory.createForClass(Envio);