import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedingService } from './seeding.service';
import { SeedingController } from './seeding.controller';

// Seeders
import { ClientesSeeder } from './seeders/clientes.seeder';
import { VendedoresSeeder } from './seeders/vendedores.seeder';
import { VentasSeeder } from './seeders/ventas.seeder';
import { EnviosSeeder } from './seeders/envios.seeder';
import { DescubrimientoSeeder } from './seeders/descubrimiento.seeder';
import { ProductosSeeder } from './seeders/productos.seeder';

// Schemas
import { Cliente, ClienteSchema } from '../clients/auth-client/schemas/clientes.schemas';
import { Vendedor, VendedorSchema } from '../reportes/schemas/vendedores.schema';
import { Productos, ProductosSchema } from '../reportes/schemas/productos.schema';
import {
    VentaGeneral, VentaGeneralSchema,
    EnvioRegion, EnvioRegionSchema,
    Descubrimiento, DescubrimientoSchema
} from '../analiticas/schemas/analiticas.schemas';
import { AuthClientModule } from '../clients/auth-client/auth-client.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Cliente.name, schema: ClienteSchema },
            { name: Vendedor.name, schema: VendedorSchema },
            { name: VentaGeneral.name, schema: VentaGeneralSchema },
            { name: EnvioRegion.name, schema: EnvioRegionSchema },
            { name: Descubrimiento.name, schema: DescubrimientoSchema },
            { name: Productos.name, schema: ProductosSchema },
        ]),
        AuthClientModule, // Importar para usar AuthClient
    ],
    controllers: [SeedingController],
    providers: [
        SeedingService,
        ClientesSeeder,
        VendedoresSeeder,
        VentasSeeder,
        EnviosSeeder,
        DescubrimientoSeeder,
        ProductosSeeder,
    ],
    exports: [SeedingService],
})
export class SeedingModule { }
