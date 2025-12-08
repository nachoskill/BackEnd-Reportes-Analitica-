import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// ==========================================
// NUEVOS ESQUEMAS PARA ANALÍTICAS
// ==========================================

// --- VENTAS GENERALES ---
// Colección: ventas_generales
// Ejemplo: { fecha: "2025-02-16T09:40:18.123+00:00", ganancia: 156000 }
export type VentaGeneralDocument = VentaGeneral & Document;

@Schema({ collection: 'ventas generales' })
export class VentaGeneral {
  @Prop({ required: true, type: Date })
  fecha: Date;

  @Prop({ required: true, type: Number })
  ganancia: number;
}

// --- ENVIOS POR REGION ---
// Colección: envios_region
// Ejemplo: { cantidad_envios: 12, region: "ohiggins" }
export type EnvioRegionDocument = EnvioRegion & Document;

@Schema({ collection: 'envios region' })
export class EnvioRegion {
  @Prop({ required: true, type: Number })
  cantidad_envios: number;

  @Prop({ required: true, type: String })
  region: string;
}

// ==========================================
// ESQUEMAS ACTIVOS
// ==========================================

export type CarritoDocument = Carrito & Document;



@Schema({ collection: 'carritos', _id: false })
export class Carrito {
  @Prop({ type: Number, required: true })
  _id: number;

  @Prop({ type: [String], required: true })
  items: string[];
}



// --- DESCUBRIMIENTO ---
// Colección: descubrimiento
// Ejemplo: { tipo: "CLICK", fecha: "2025-01-19T22:27:25.000Z", detalle: "Apple iPhone 15 Pro Max", metadata: { id_producto: "apple_001" } }
export type DescubrimientoDocument = Descubrimiento & Document;

@Schema({ collection: 'descubrimiento' })
export class Descubrimiento {
  @Prop({ required: true, type: String })
  tipo: string; // "CLICK" o "BUSQUEDA"

  @Prop({ required: true, type: Date })
  fecha: Date;

  @Prop({ required: true, type: String })
  detalle: string; // Nombre del producto o término de búsqueda

  @Prop({ type: Object })
  metadata: {
    id_producto?: string;
  };
}

// Generamos los Schemas de Mongoose
export const VentaGeneralSchema = SchemaFactory.createForClass(VentaGeneral);
export const EnvioRegionSchema = SchemaFactory.createForClass(EnvioRegion);
export const CarritoSchema = SchemaFactory.createForClass(Carrito);
export const DescubrimientoSchema = SchemaFactory.createForClass(Descubrimiento);