import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Productos } from '../../reportes/schemas/productos.schema';
import * as productosDataImport from '../data/productos.json';

@Injectable()
export class ProductosSeeder {
    constructor(
        @InjectModel(Productos.name) private productosModel: Model<Productos>,
    ) { }

    async seed(): Promise<number> {
        // Manejar importación de JSON (puede venir como default o directo)
        const productosData = Array.isArray(productosDataImport)
            ? productosDataImport
            : (productosDataImport as any).default || [];

        const productosToInsert = [];

        // Insertar datos del JSON
        for (const ejemplo of productosData) {
            productosToInsert.push({
                id_tienda: ejemplo.id_tienda,
                productos: ejemplo.productos.map(prod => ({
                    ...prod,
                    // Manejar formato de MongoDB: { "$date": "..." } o string directo
                    fecha_creacion: new Date(
                        typeof prod.fecha_creacion === 'string'
                            ? prod.fecha_creacion
                            : prod.fecha_creacion.$date
                    )
                }))
            });
        }

        if (productosToInsert.length > 0) {
            await this.productosModel.insertMany(productosToInsert);
        }

        return productosToInsert.length;
    }
}
