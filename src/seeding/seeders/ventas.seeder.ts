import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VentaGeneral } from '../../analiticas/schemas/analiticas.schemas';
import * as ventasDataImport from '../data/ventas-generales.json';

@Injectable()
export class VentasSeeder {
    constructor(
        @InjectModel(VentaGeneral.name) private ventaGeneralModel: Model<VentaGeneral>,
    ) { }

    async seed(): Promise<number> {
        // Manejar importación de JSON (puede venir como default o directo)
        const ventasData = Array.isArray(ventasDataImport)
            ? ventasDataImport
            : (ventasDataImport as any).default || [];

        const ventas = [];

        // Insertar datos del JSON
        for (const ejemplo of ventasData) {
            ventas.push({
                fecha: new Date(ejemplo.fecha),
                ganancia: ejemplo.ganancia,
            });
        }

        if (ventas.length > 0) {
            await this.ventaGeneralModel.insertMany(ventas);
        }

        return ventas.length;
    }
}
