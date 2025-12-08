import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnaliticasController } from './analiticas.controller';
import { AnaliticasService } from './analiticas.services';
import {
  VentaGeneral, VentaGeneralSchema,
  EnvioRegion, EnvioRegionSchema,
  Carrito, CarritoSchema,
  Descubrimiento, DescubrimientoSchema
} from './schemas/analiticas.schemas';
import { Cliente, ClienteSchema } from '../clients/auth-client/schemas/clientes.schemas';
import { Vendedor, VendedorSchema } from '../reportes/schemas/vendedores.schema';
import { AuthClientModule } from '../clients/auth-client/auth-client.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VentaGeneral.name, schema: VentaGeneralSchema },
      { name: EnvioRegion.name, schema: EnvioRegionSchema },
      { name: Carrito.name, schema: CarritoSchema },
      { name: Descubrimiento.name, schema: DescubrimientoSchema },
      { name: Cliente.name, schema: ClienteSchema },
      { name: Vendedor.name, schema: VendedorSchema },
    ]),
    AuthClientModule,
  ],
  controllers: [AnaliticasController],
  providers: [AnaliticasService],
})
export class AnaliticasModule { }