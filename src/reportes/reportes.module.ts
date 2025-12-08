// reportes.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.services';
import { Productos, ProductosSchema } from './schemas/productos.schema';
import { Vendedor, VendedorSchema } from './schemas/vendedores.schema';
import { FiltrosService } from './filtros.services';
import { AuthClientModule } from '../clients/auth-client/auth-client.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Productos.name, schema: ProductosSchema },
      { name: Vendedor.name, schema: VendedorSchema }
    ]),
    AuthClientModule,
  ],
  controllers: [ReportesController],
  providers: [ReportesService, FiltrosService],
})
export class ReportesModule { }