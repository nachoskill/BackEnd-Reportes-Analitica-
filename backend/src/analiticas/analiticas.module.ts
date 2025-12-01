import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnaliticasController } from './analiticas.controller';
import { AnaliticasService } from './analiticas.services';
import {
  Pago, PagoSchema,
  Carrito, CarritoSchema,
  Producto, ProductoSchema,
  Envio, EnvioSchema
} from './schemas/analiticas.schemas'; // <--- Ruta actualizada
import { AuthClientModule } from '../clients/auth-client/auth-client.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Pago.name, schema: PagoSchema },
      { name: Carrito.name, schema: CarritoSchema },
      { name: Producto.name, schema: ProductoSchema },
      { name: Envio.name, schema: EnvioSchema },
    ]),
    AuthClientModule,
  ],
  controllers: [AnaliticasController],
  providers: [AnaliticasService],
})
export class AnaliticasModule { }