"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnaliticasService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const analiticas_schemas_1 = require("./schemas/analiticas.schemas");
let AnaliticasService = class AnaliticasService {
    constructor(pagoModel, envioModel, productoModel, carritoModel) {
        this.pagoModel = pagoModel;
        this.envioModel = envioModel;
        this.productoModel = productoModel;
        this.carritoModel = carritoModel;
    }
    async getEnviosRegional() {
        const data = await this.envioModel.aggregate([
            {
                $group: {
                    _id: '$region',
                    cantidad: { $sum: 1 }
                }
            },
            {
                $sort: { cantidad: -1 }
            }
        ]);
        return data.map(d => ({
            name: d._id || 'Sin Región',
            value: d.cantidad
        }));
    }
    async getKpiMejorRegion() {
        const datos = await this.envioModel.aggregate([
            {
                $group: {
                    _id: "$region",
                    cantidad: { $sum: 1 }
                }
            },
            { $sort: { cantidad: -1 } }
        ]);
        if (datos.length === 0) {
            return { mejorRegion: "Sin Datos", porcentajeRegion: 0 };
        }
        const mejor = datos[0];
        const totalEnvios = datos.reduce((acumulado, actual) => acumulado + actual.cantidad, 0);
        const porcentaje = (mejor.cantidad / totalEnvios) * 100;
        return {
            mejorRegion: mejor._id,
            porcentajeRegion: Math.round(porcentaje)
        };
    }
    async getKpiIngresos() {
        const fechaHoy = new Date();
        const inicioMesActual = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth(), 1);
        const finMesActual = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth() + 1, 0);
        const inicioMesAnterior = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth() - 1, 1);
        const finMesAnterior = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth(), 0);
        const resultados = await this.productoModel.aggregate([
            {
                $addFields: {
                    fecha_real: { $toDate: "$fecha_creacion" }
                }
            },
            {
                $match: {
                    fecha_real: {
                        $gte: inicioMesAnterior,
                        $lte: finMesActual
                    }
                }
            },
            {
                $project: {
                    mes: { $month: "$fecha_real" },
                    ingreso: {
                        $multiply: [
                            { $ifNull: ["$precio", 0] },
                            { $ifNull: ["$veces_vendido", 0] }
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: "$mes",
                    totalMes: { $sum: "$ingreso" }
                }
            }
        ]);
        const mesActualNum = fechaHoy.getMonth() + 1;
        let mesAnteriorNum = fechaHoy.getMonth();
        if (mesAnteriorNum === 0)
            mesAnteriorNum = 12;
        const datosMesActual = resultados.find(r => r._id === mesActualNum);
        const datosMesAnterior = resultados.find(r => r._id === mesAnteriorNum);
        const totalActual = datosMesActual ? datosMesActual.totalMes : 0;
        const totalAnterior = datosMesAnterior ? datosMesAnterior.totalMes : 0;
        let porcentaje = 0;
        if (totalAnterior > 0) {
            porcentaje = ((totalActual - totalAnterior) / totalActual) * 100;
        }
        else if (totalActual > 0) {
            porcentaje = 100;
        }
        return {
            ingresos: totalActual,
            porcentaje: Number(porcentaje.toFixed(1))
        };
    }
    async getIngresosMensuales() {
        const fechaActual = new Date();
        const mesActual = fechaActual.getMonth() + 1;
        const primerDiaAño = new Date(fechaActual.getFullYear(), 0, 1);
        const ultimoDiaAño = new Date(fechaActual.getFullYear(), 11, 31);
        const resultados = await this.productoModel.aggregate([
            {
                $addFields: {
                    fecha_creacion_real: { $toDate: "$fecha_creacion" }
                }
            },
            {
                $match: {
                    fecha_creacion_real: {
                        $gte: primerDiaAño,
                        $lte: ultimoDiaAño
                    }
                }
            },
            {
                $project: {
                    mesNumero: { $month: "$fecha_creacion_real" },
                    ingresoProducto: {
                        $multiply: [
                            "$precio",
                            { $ifNull: ["$veces_vendido", 0] }
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: "$mesNumero",
                    totalVentas: { $sum: "$ingresoProducto" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);
        const mesesNombres = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const dataCompleta = [];
        for (let i = 1; i <= mesActual; i++) {
            const datoMes = resultados.find(r => r._id === i);
            const ventas = datoMes ? datoMes.totalVentas : 0;
            dataCompleta.push({
                mes: mesesNombres[i],
                ventas: ventas,
                meta: Math.round(ventas > 0 ? ventas * 1.2 : 100000)
            });
        }
        return dataCompleta;
    }
    async getEstadoCarritos() {
        const data = await this.carritoModel.aggregate([
            {
                $lookup: {
                    from: 'pagos',
                    localField: 'id_carrito',
                    foreignField: 'id_carrito',
                    as: 'info_pago'
                }
            },
            {
                $project: {
                    estado_final: {
                        $cond: {
                            if: { $gt: [{ $size: "$info_pago" }, 0] },
                            then: { $arrayElemAt: ["$info_pago.estado", 0] },
                            else: "abandonado"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$estado_final",
                    cantidad: { $sum: 1 }
                }
            }
        ]);
        return data.map(d => ({
            name: d._id ? (d._id.charAt(0).toUpperCase() + d._id.slice(1)) : 'Desconocido',
            value: d.cantidad
        }));
    }
    async getTendenciaProductos() {
        const data = await this.carritoModel.aggregate([
            {
                $lookup: {
                    from: 'pagos',
                    localField: 'id_carrito',
                    foreignField: 'id_carrito',
                    as: 'info_pago'
                }
            },
            {
                $addFields: {
                    estado_calculado: {
                        $cond: {
                            if: { $gt: [{ $size: "$info_pago" }, 0] },
                            then: { $arrayElemAt: ["$info_pago.estado", 0] },
                            else: "abandonado"
                        }
                    }
                }
            },
            { $unwind: "$items" },
            {
                $addFields: {
                    id_producto_number: { $toInt: "$items" }
                }
            },
            {
                $lookup: {
                    from: 'productos',
                    localField: 'id_producto_number',
                    foreignField: 'id_producto',
                    as: 'detalle_producto'
                }
            },
            { $unwind: "$detalle_producto" },
            {
                $group: {
                    _id: {
                        estado: "$estado_calculado",
                        producto: "$detalle_producto.nombre"
                    },
                    total: { $sum: 1 }
                }
            },
            { $sort: { total: -1 } },
            {
                $group: {
                    _id: "$_id.estado",
                    top_lista: {
                        $push: {
                            name: "$_id.producto",
                            value: "$total"
                        }
                    }
                }
            }
        ]);
        const respuesta = {
            completado: [],
            abandonado: [],
            cancelado: []
        };
        data.forEach(grupo => {
            const estado = grupo._id;
            if (respuesta[estado] !== undefined) {
                respuesta[estado] = grupo.top_lista.slice(0, 5);
            }
        });
        return respuesta;
    }
};
exports.AnaliticasService = AnaliticasService;
exports.AnaliticasService = AnaliticasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(analiticas_schemas_1.Pago.name)),
    __param(1, (0, mongoose_1.InjectModel)(analiticas_schemas_1.Envio.name)),
    __param(2, (0, mongoose_1.InjectModel)(analiticas_schemas_1.Producto.name)),
    __param(3, (0, mongoose_1.InjectModel)(analiticas_schemas_1.Carrito.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AnaliticasService);
//# sourceMappingURL=analiticas.services.js.map