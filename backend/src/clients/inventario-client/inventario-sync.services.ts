import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vendedor } from '../../reportes/schemas/vendedores.schema';
import { Productos, ProductoEmbebido } from '../../reportes/schemas/productos.schema';
import { InventarioClient } from './inventario.client';

@Injectable()
export class SyncService {
    private readonly logger = new Logger(SyncService.name);

    constructor(
        @InjectModel(Vendedor.name) private vendedorModel: Model<Vendedor>,
        @InjectModel(Productos.name) private productosModel: Model<Productos>,
        private inventarioClient: InventarioClient,
    ) { }

    async sincronizarDatos(tokenAdmin: string) {
        this.logger.log('Iniciando sincronización masiva...');

        // 1. Obtener datos externos (Del microservicio)
        const [tiendasExternas, productosExternos] = await Promise.all([
            this.inventarioClient.getTiendas(tokenAdmin),
            this.inventarioClient.getProductos(tokenAdmin),
        ]);

        // 2. Obtener datos locales (Mis vendedores registrados)
        const vendedoresLocales = await this.vendedorModel.find().exec();

        // Set para guardar IDs de tiendas válidas para el siguiente paso
        const idsTiendasValidas = new Set<number>();

        // ---------------------------------------------------------
        // ETAPA A: Sincronizar Tiendas dentro de Vendedores
        // ---------------------------------------------------------
        for (const vendedor of vendedoresLocales) {
            // Ahora tanto el schema local como el externo usan String (MongoDB ObjectId)
            const idVendedorLocal = vendedor.id_vendedor;

            // Buscamos las tiendas externas que pertenecen a este vendedor
            const susTiendas = tiendasExternas.filter(t => t.id_vendedor === idVendedorLocal);

            if (susTiendas.length > 0) {
                // Mapeamos a tu estructura TiendaEmbebida
                vendedor.tiendas = susTiendas.map(t => {
                    idsTiendasValidas.add(t.id_tienda); // Guardamos ID para usarlo luego en productos
                    return {
                        id_tienda: t.id_tienda,
                        nombre_tienda: t.nombre,
                    };
                });

                await vendedor.save();
                this.logger.log(`Vendedor ${vendedor.id_vendedor} actualizado con ${susTiendas.length} tiendas.`);
            }
        }

        // ---------------------------------------------------------
        // ETAPA B: Sincronizar Productos por Tienda (CON MERGE)
        // ---------------------------------------------------------

        const tiendasIds = Array.from(idsTiendasValidas);

        for (const idTienda of tiendasIds) {
            // 1. Filtrar productos externos que sean de esta tienda
            const productosDeLaTiendaExternos = productosExternos.filter(p => p.id_tienda === idTienda);

            if (productosDeLaTiendaExternos.length > 0) {

                // 2. Buscar el documento actual en BD Local para tener los contadores viejos
                let documentoTienda = await this.productosModel.findOne({ id_tienda: idTienda }).exec();

                // 3. Crear un Mapa para búsqueda rápida de productos locales existentes
                // Clave: id_producto, Valor: Objeto producto completo
                const mapaProductosLocales = new Map();
                if (documentoTienda && documentoTienda.productos) {
                    documentoTienda.productos.forEach(p => mapaProductosLocales.set(p.id_producto, p));
                }

                // 4. Mapeo con lógica de Fusión (Merge)
                const productosFusionados: ProductoEmbebido[] = productosDeLaTiendaExternos.map(pExt => {
                    // Buscamos si ya teniamos este producto
                    const productoLocal = mapaProductosLocales.get(pExt.id_producto);

                    return {
                        // Datos Maestros (Vienen del Externo - Fuente de la verdad)
                        id_producto: pExt.id_producto,
                        nombre: pExt.nombre,
                        categoria: pExt.categoria,
                        precio: pExt.precio,
                        cantidad: pExt.stock, // Stock actualizado
                        fecha_creacion: new Date(pExt.fecha_creacion),

                        // Datos Históricos (Vienen del Local - Se preservan)
                        // Si existe localmente usamos su valor, si es nuevo ponemos 0
                        veces_vendido: productoLocal ? productoLocal.veces_vendido : 0,
                        veces_buscado: productoLocal ? productoLocal.veces_buscado : 0
                    };
                });

                // 5. Guardado
                if (documentoTienda) {
                    // Si la tienda ya existía, actualizamos su array de productos
                    documentoTienda.productos = productosFusionados;
                    await documentoTienda.save();
                } else {
                    // Si es la primera vez que sincronizamos esta tienda, la creamos
                    await this.productosModel.create({
                        id_tienda: idTienda,
                        productos: productosFusionados
                    });
                }
            }
        }

        this.logger.log('Sincronización finalizada exitosamente.');
        return { status: 'success', tiendas_procesadas: tiendasIds.length };
    }
}