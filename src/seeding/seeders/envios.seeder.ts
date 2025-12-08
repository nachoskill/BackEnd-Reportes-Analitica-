import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EnvioRegion } from '../../analiticas/schemas/analiticas.schemas';
import * as enviosDataImport from '../data/envios-region.json';

@Injectable()
export class EnviosSeeder {
    constructor(
        @InjectModel(EnvioRegion.name) private envioRegionModel: Model<EnvioRegion>,
    ) { }

    async seed(): Promise<number> {
        // Manejar importación de JSON (puede venir como default o directo)
        const enviosData = Array.isArray(enviosDataImport)
            ? enviosDataImport
            : (enviosDataImport as any).default || [];

        const envios = [];

        // Insertar datos del JSON
        for (const ejemplo of enviosData) {
            envios.push({
                region: ejemplo.region,
                cantidad_envios: ejemplo.cantidad_envios,
            });
        }

        if (envios.length > 0) {
            await this.envioRegionModel.insertMany(envios);
        }

        return envios.length;
    }
}
