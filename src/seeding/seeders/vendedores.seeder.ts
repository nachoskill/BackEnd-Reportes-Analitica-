import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vendedor } from '../../reportes/schemas/vendedores.schema';
import * as vendedoresDataImport from '../data/vendedores.json';

@Injectable()
export class VendedoresSeeder {
    constructor(
        @InjectModel(Vendedor.name) private vendedorModel: Model<Vendedor>,
    ) { }

    async seed(): Promise<number> {
        // Manejar importación de JSON (puede venir como default o directo)
        const vendedoresData = Array.isArray(vendedoresDataImport)
            ? vendedoresDataImport
            : (vendedoresDataImport as any).default || [];

        const vendedoresToInsert = [];

        // Verificar cada vendedor del JSON
        for (const ejemplo of vendedoresData) {
            // Verificar si ya existe en la BD
            const existe = await this.vendedorModel.findOne({
                id_vendedor: ejemplo.id_vendedor
            }).exec();

            // Solo agregar si NO existe
            if (!existe) {
                vendedoresToInsert.push({
                    id_vendedor: ejemplo.id_vendedor,
                    tiendas: ejemplo.tiendas,
                });
            }
        }

        // Insertar solo los nuevos
        if (vendedoresToInsert.length > 0) {
            await this.vendedorModel.insertMany(vendedoresToInsert);
        }

        return vendedoresToInsert.length;
    }
}
