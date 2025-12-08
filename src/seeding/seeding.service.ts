import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientesSeeder } from './seeders/clientes.seeder';
import { VendedoresSeeder } from './seeders/vendedores.seeder';
import { VentasSeeder } from './seeders/ventas.seeder';
import { EnviosSeeder } from './seeders/envios.seeder';
import { DescubrimientoSeeder } from './seeders/descubrimiento.seeder';
import { ProductosSeeder } from './seeders/productos.seeder';
import { Cliente } from '../clients/auth-client/schemas/clientes.schemas';
import { Vendedor } from '../reportes/schemas/vendedores.schema';
import { Productos } from '../reportes/schemas/productos.schema';
import { VentaGeneral, EnvioRegion, Descubrimiento } from '../analiticas/schemas/analiticas.schemas';
import { AuthClient } from '../clients/auth-client/auth.client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedingService implements OnModuleInit {
    private readonly logger = new Logger(SeedingService.name);

    constructor(
        @InjectModel(Cliente.name) private clienteModel: Model<Cliente>,
        @InjectModel(Vendedor.name) private vendedorModel: Model<Vendedor>,
        @InjectModel(VentaGeneral.name) private ventaGeneralModel: Model<VentaGeneral>,
        @InjectModel(EnvioRegion.name) private envioRegionModel: Model<EnvioRegion>,
        @InjectModel(Descubrimiento.name) private descubrimientoModel: Model<Descubrimiento>,
        @InjectModel(Productos.name) private productosModel: Model<Productos>,
        private clientesSeeder: ClientesSeeder,
        private vendedoresSeeder: VendedoresSeeder,
        private ventasSeeder: VentasSeeder,
        private enviosSeeder: EnviosSeeder,
        private descubrimientoSeeder: DescubrimientoSeeder,
        private productosSeeder: ProductosSeeder,
        private authClient: AuthClient,
    ) { }

    /**
     * Se ejecuta automáticamente cuando el módulo se inicializa
     */
    async onModuleInit() {
        this.logger.log('🚀 Iniciando auto-seeding...');

        try {
            // 2. Ejecutar seeding de colecciones vacías
            await this.seedAll();

            this.logger.log('✅ Auto-seeding completado');
        } catch (error) {
            this.logger.warn(`⚠️ Auto-seeding falló: ${error.message}`);
            this.logger.warn('Puedes ejecutar manualmente con POST /seed/update-ids y POST /seed/run');
        }
    }


    /**
     * Ejecuta el seeding de todas las colecciones vacías
     */
    async seedAll(): Promise<{ [key: string]: number }> {
        this.logger.log('🌱 Iniciando proceso de seeding...');
        const results: { [key: string]: number } = {};

        try {
            // Clientes - SIEMPRE ejecutar (verifica duplicados internamente)
            this.logger.log(`📝 Verificando clientes...`);
            const insertedClientes = await this.clientesSeeder.seed();
            results.clientes = insertedClientes;
            if (insertedClientes > 0) {
                this.logger.log(`✓ ${insertedClientes} nuevos clientes insertados`);
            } else {
                this.logger.log(`⏭️  No hay nuevos clientes para insertar`);
            }

            // Vendedores - SIEMPRE ejecutar (verifica duplicados internamente)
            this.logger.log(`📝 Verificando vendedores...`);
            const insertedVendedores = await this.vendedoresSeeder.seed();
            results.vendedores = insertedVendedores;
            if (insertedVendedores > 0) {
                this.logger.log(`✓ ${insertedVendedores} nuevos vendedores insertados`);
            } else {
                this.logger.log(`⏭️  No hay nuevos vendedores para insertar`);
            }

            // Ventas Generales
            results.ventas_generales = await this.seedIfEmpty(
                'ventas generales',
                this.ventaGeneralModel,
                () => this.ventasSeeder.seed()
            );

            // Envíos por Región
            results.envios_region = await this.seedIfEmpty(
                'envios region',
                this.envioRegionModel,
                () => this.enviosSeeder.seed()
            );

            // Descubrimiento
            results.descubrimiento = await this.seedIfEmpty(
                'descubrimiento',
                this.descubrimientoModel,
                () => this.descubrimientoSeeder.seed()
            );

            // Productos
            results.productos = await this.seedIfEmpty(
                'productos',
                this.productosModel,
                () => this.productosSeeder.seed()
            );

            this.logger.log('✅ Seeding completado exitosamente');
            return results;
        } catch (error) {
            this.logger.error('❌ Error durante el seeding:', error);
            throw error;
        }
    }

    /**
     * Ejecuta el seeding solo si la colección está vacía
     */
    private async seedIfEmpty(
        collectionName: string,
        model: Model<any>,
        seederFn: () => Promise<number>
    ): Promise<number> {
        const count = await model.countDocuments().exec();

        if (count > 0) {
            this.logger.log(`⏭️  Colección '${collectionName}' ya tiene datos (${count} documentos). Saltando...`);
            return 0;
        }

        this.logger.log(`📝 Poblando colección '${collectionName}'...`);
        const inserted = await seederFn();
        this.logger.log(`✓ ${inserted} documentos insertados en '${collectionName}'`);
        return inserted;
    }


}
