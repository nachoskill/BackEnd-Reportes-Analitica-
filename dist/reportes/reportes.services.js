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
exports.ReportesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const productos_schema_1 = require("./schemas/productos.schema");
const vendedores_schema_1 = require("./schemas/vendedores.schema");
const PDFDocument = require("pdfkit");
const filtros_services_1 = require("./filtros.services");
let ReportesService = class ReportesService {
    constructor(productoModel, vendedorModel, filtrosService) {
        this.productoModel = productoModel;
        this.vendedorModel = vendedorModel;
        this.filtrosService = filtrosService;
    }
    async obtenerTiendasVendedor(id_usuario) {
        const vendedor = await this.vendedorModel.findOne({ id_vendedor: id_usuario }).exec();
        if (!vendedor || vendedor.tiendas.length === 0) {
            throw new common_1.NotFoundException('No se encontraron tiendas asociadas a este vendedor');
        }
        return {
            tiendas: vendedor.tiendas,
            tienda_default: vendedor.tiendas
        };
    }
    async validarTiendaVendedor(id_usuario, id_tienda) {
        const vendedor = await this.vendedorModel.findOne({ id_vendedor: id_usuario }).exec();
        if (!vendedor) {
            return false;
        }
        return vendedor.tiendas.some(tienda => tienda.id_tienda === id_tienda);
    }
    async obtenerDatos(id_usuario, paginacionDto) {
        const { page = 1, limit = 20, id_tienda } = paginacionDto;
        let tiendasIds = [];
        let tiendasMap = new Map();
        if (id_tienda) {
            const tienePermiso = await this.validarTiendaVendedor(id_usuario, id_tienda);
            if (!tienePermiso) {
                throw new common_1.ForbiddenException('No tienes permiso para acceder a esta tienda');
            }
            tiendasIds = [id_tienda];
            const vendedor = await this.vendedorModel.findOne({ id_vendedor: id_usuario }).exec();
            const tienda = vendedor?.tiendas.find(t => t.id_tienda === id_tienda);
            if (tienda)
                tiendasMap.set(id_tienda, tienda.nombre_tienda);
        }
        else {
            const { tiendas } = await this.obtenerTiendasVendedor(id_usuario);
            tiendasIds = tiendas.map(t => t.id_tienda);
            tiendas.forEach(t => tiendasMap.set(t.id_tienda, t.nombre_tienda));
        }
        const branches = Array.from(tiendasMap.entries()).map(([id, nombre]) => ({
            case: { $eq: ['$id_tienda', id] },
            then: nombre
        }));
        const pipeline = [
            { $match: { id_tienda: { $in: tiendasIds } } },
            { $unwind: '$productos' },
            { $sort: { 'productos.precio': 1 } },
            {
                $project: {
                    _id: '$productos.id_producto',
                    id_tienda: '$id_tienda',
                    nombre: '$productos.nombre',
                    precio: '$productos.precio',
                    categoria: '$productos.categoria',
                    stock: '$productos.cantidad',
                    veces_vendido: '$productos.veces_vendido',
                    veces_buscado: '$productos.veces_buscado',
                    fecha_creacion: '$productos.fecha_creacion',
                    tienda: {
                        $switch: {
                            branches: branches,
                            default: 'General'
                        }
                    }
                }
            }
        ];
        const totalPipeline = [...pipeline, { $count: 'total' }];
        const totalResult = await this.productoModel.aggregate(totalPipeline).exec();
        const total = totalResult.length > 0 ? totalResult[0].total : 0;
        const skip = (page - 1) * limit;
        const paginationPipeline = [
            ...pipeline,
            { $skip: skip },
            { $limit: limit }
        ];
        const productosPaginados = await this.productoModel.aggregate(paginationPipeline).exec();
        return {
            productos: productosPaginados,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            id_tienda: id_tienda || 0,
            nombre_tienda: id_tienda ? (tiendasMap.get(id_tienda) || 'General') : 'Todas las tiendas'
        };
    }
    async obtenerDatosConFiltros(filtros) {
        const pipeline = [];
        if (filtros.id_tienda) {
            pipeline.push({ $match: { id_tienda: Number(filtros.id_tienda) } });
        }
        pipeline.push({ $unwind: '$productos' });
        const { query, sort } = this.filtrosService.construirQuery(filtros, 'productos');
        if (Object.keys(query).length > 0) {
            pipeline.push({ $match: query });
        }
        pipeline.push({ $sort: sort });
        pipeline.push({
            $project: {
                _id: '$productos.id_producto',
                id_tienda: '$id_tienda',
                nombre: '$productos.nombre',
                precio: '$productos.precio',
                categoria: '$productos.categoria',
                stock: '$productos.cantidad',
                veces_vendido: '$productos.veces_vendido',
                veces_buscado: '$productos.veces_buscado',
            }
        });
        return this.productoModel.aggregate(pipeline).exec();
    }
    async generarReportePDF(filtros, res) {
        const productos = await this.obtenerDatosConFiltros(filtros);
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const formatearPrecio = (precio) => {
            return new Intl.NumberFormat('es-CL').format(precio);
        };
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte_ventas.pdf');
        doc.pipe(res);
        doc
            .fontSize(22)
            .fillColor('#003366')
            .text('Reporte de ventas', { align: 'center' })
            .moveDown(0.5);
        doc
            .moveTo(50, doc.y)
            .lineTo(550, doc.y)
            .strokeColor('#003366')
            .lineWidth(1)
            .stroke()
            .moveDown(1);
        const productosPorCategoria = {};
        productos.forEach(p => {
            if (!productosPorCategoria[p.categoria]) {
                productosPorCategoria[p.categoria] = [];
            }
            productosPorCategoria[p.categoria].push(p);
        });
        Object.keys(productosPorCategoria).forEach(categoria => {
            productosPorCategoria[categoria].sort((a, b) => a.precio - b.precio);
        });
        const startX = 50;
        let y = doc.y;
        Object.keys(productosPorCategoria).forEach(categoria => {
            if (y > 700) {
                doc.addPage();
                y = 70;
                doc
                    .fontSize(22)
                    .fillColor('#003366')
                    .text('Reporte de Productos', { align: 'center' })
                    .moveDown(0.5);
                doc
                    .moveTo(50, doc.y)
                    .lineTo(550, doc.y)
                    .strokeColor('#003366')
                    .lineWidth(1)
                    .stroke()
                    .moveDown(1);
                y = doc.y;
            }
            doc
                .font('Helvetica-Bold')
                .fontSize(14)
                .fillColor('#003366')
                .text(`Categoría: ${categoria}`, startX, y);
            y += 25;
            const tablaY = y;
            doc
                .font('Helvetica-Bold')
                .fontSize(12)
                .fillColor('white')
                .rect(startX, y, 500, 20)
                .fill('#003366');
            doc
                .fillColor('white')
                .text('Nombre', startX + 5, y + 5, { width: 150 })
                .text('Precio', startX + 160, y + 5, { width: 100 })
                .text('Stock', startX + 270, y + 5, { width: 60 })
                .text('Vendidos', startX + 335, y + 5, { width: 80 })
                .text('Buscados', startX + 420, y + 5, { width: 80 });
            y += 25;
            doc.font('Helvetica').fontSize(11).fillColor('black');
            productosPorCategoria[categoria].forEach((p, index) => {
                if (y > 750) {
                    doc.addPage();
                    y = 50;
                }
                if (index > 0) {
                    doc
                        .moveTo(startX, y - 1)
                        .lineTo(startX + 500, y - 1)
                        .strokeColor('#000000')
                        .lineWidth(1)
                        .stroke();
                }
                if (index % 2 === 0) {
                    doc.save();
                    doc.rect(startX, y, 500, 20).fill('#f2f2f2');
                    doc.restore();
                }
                doc.text(p.nombre, startX + 5, y + 5, { width: 150 });
                doc.text(`$${formatearPrecio(p.precio)}`, startX + 160, y + 5, { width: 100 });
                doc.text(p.stock.toString(), startX + 270, y + 5, { width: 60 });
                doc.text(p.veces_vendido.toString(), startX + 335, y + 5, { width: 80 });
                doc.text(p.veces_buscado.toString(), startX + 420, y + 5, { width: 80 });
                y += 20;
            });
            const tablaAltura = y - tablaY;
            doc
                .rect(startX, tablaY, 500, tablaAltura)
                .lineWidth(2)
                .strokeColor('black')
                .stroke();
            y += 25;
        });
        doc
            .fontSize(10)
            .fillColor('gray')
            .text(`Generado el: ${new Date().toLocaleString()}`, 50, 780, { align: 'right', width: 500 });
        doc.end();
    }
};
exports.ReportesService = ReportesService;
exports.ReportesService = ReportesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(productos_schema_1.Productos.name)),
    __param(1, (0, mongoose_1.InjectModel)(vendedores_schema_1.Vendedor.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        filtros_services_1.FiltrosService])
], ReportesService);
//# sourceMappingURL=reportes.services.js.map