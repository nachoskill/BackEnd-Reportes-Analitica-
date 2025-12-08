import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Descubrimiento } from '../../analiticas/schemas/analiticas.schemas';
import * as descubrimientoDataImport from '../data/descubrimiento.json';

@Injectable()
export class DescubrimientoSeeder {
    constructor(
        @InjectModel(Descubrimiento.name) private descubrimientoModel: Model<Descubrimiento>,
    ) { }

    async seed(): Promise<number> {
        // Manejar importación de JSON (puede venir como default o directo)
        const descubrimientoData = Array.isArray(descubrimientoDataImport)
            ? descubrimientoDataImport
            : (descubrimientoDataImport as any).default || [];

        const interacciones = [];

        // Insertar datos del JSON
        for (const ejemplo of descubrimientoData) {
            interacciones.push({
                tipo: ejemplo.tipo,
                detalle: ejemplo.detalle,
                fecha: new Date(ejemplo.fecha),
                metadata: ejemplo.metadata,
            });
        }

        if (interacciones.length > 0) {
            await this.descubrimientoModel.insertMany(interacciones);
        }

        return interacciones.length;
    }
}
