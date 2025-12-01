import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'clientes' }) // Define el nombre de la colección en MongoDB
export class Cliente extends Document {

    @Prop({ required: true, unique: true })
    id_cliente: string; // Asumo que es un ID numérico propio (similar a tu id_vendedor)

    @Prop({ default: Date.now }) // Se genera automáticamente la fecha actual
    creado_en: Date;
}

// Genera el esquema de Mongoose a partir de la clase
export const ClienteSchema = SchemaFactory.createForClass(Cliente);