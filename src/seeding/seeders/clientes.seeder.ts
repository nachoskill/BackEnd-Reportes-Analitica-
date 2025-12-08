import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cliente } from '../../clients/auth-client/schemas/clientes.schemas';
import * as clientesDataImport from '../data/clientes.json';

@Injectable()
export class ClientesSeeder {
    constructor(
        @InjectModel(Cliente.name) private clienteModel: Model<Cliente>,
    ) { }

    async seed(): Promise<number> {
        // Manejar importación de JSON (puede venir como default o directo)
        const clientesData = Array.isArray(clientesDataImport)
            ? clientesDataImport
            : (clientesDataImport as any).default || [];

        const clientesToInsert = [];

        // Verificar cada cliente del JSON
        for (const ejemplo of clientesData) {
            // Verificar si ya existe en la BD
            const existe = await this.clienteModel.findOne({
                id_cliente: ejemplo.id_cliente
            }).exec();

            // Solo agregar si NO existe
            if (!existe) {
                clientesToInsert.push({
                    id_cliente: ejemplo.id_cliente,
                    // Manejar formato de MongoDB: { "$date": "..." } o string directo
                    creado_en: new Date(
                        typeof ejemplo.creado_en === 'string'
                            ? ejemplo.creado_en
                            : ejemplo.creado_en.$date
                    ),
                });
            }
        }

        // Insertar solo los nuevos
        if (clientesToInsert.length > 0) {
            await this.clienteModel.insertMany(clientesToInsert);
        }

        return clientesToInsert.length;
    }
}
