import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventarioClient } from './inventario.client';
import { SyncService } from './inventario-sync.services';
import { InventarioSyncScheduler } from './inventario-sync.scheduler';
import { HttpModule } from '../http/http.module';
import { AuthClientModule } from '../auth-client/auth-client.module';
import { Vendedor, VendedorSchema } from '../../reportes/schemas/vendedores.schema';
import { Productos, ProductosSchema } from '../../reportes/schemas/productos.schema';

@Module({
    imports: [
        HttpModule,
        AuthClientModule, // Para obtener el token admin
        MongooseModule.forFeature([
            { name: Vendedor.name, schema: VendedorSchema },
            { name: Productos.name, schema: ProductosSchema },
        ]),
    ],
    providers: [InventarioClient, SyncService, InventarioSyncScheduler],
    exports: [InventarioClient, SyncService],
})
export class InventarioClientModule { }
