// reportes.services.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Productos } from './schemas/productos.schema';
import { Vendedor } from './schemas/vendedores.schema';
import { FiltroReporteDto } from './schemas/dto/filtro-reporte.dto';
import { PaginacionDto } from './schemas/dto/paginacion.dto';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';
import { FiltrosService } from './filtros.services';

@Injectable()
export class ReportesService {
  constructor(
    @InjectModel(Productos.name) private productoModel: Model<Productos>,
    @InjectModel(Vendedor.name) private vendedorModel: Model<Vendedor>,
    private filtrosService: FiltrosService
  ) { }

  // Obtener tiendas del vendedor
  async obtenerTiendasVendedor(id_usuario: number) {
    const vendedor = await this.vendedorModel.findOne({ id_vendedor: id_usuario }).exec();

    if (!vendedor || vendedor.tiendas.length === 0) {
      throw new NotFoundException('No se encontraron tiendas asociadas a este vendedor');
    }

    return {
      tiendas: vendedor.tiendas,
      tienda_default: vendedor.tiendas
    };
  }

  // Validar que la tienda pertenece al vendedor
  private async validarTiendaVendedor(id_usuario: number, id_tienda: number): Promise<boolean> {
    const vendedor = await this.vendedorModel.findOne({ id_vendedor: id_usuario }).exec();

    if (!vendedor) {
      return false;
    }

    return vendedor.tiendas.some(tienda => tienda.id_tienda === id_tienda);
  }

  // Obtener productos paginados con filtro por tienda
  async obtenerDatos(id_usuario: number, paginacionDto: PaginacionDto) {
    const { page = 1, limit = 20, id_tienda } = paginacionDto;

    // Si no se proporciona id_tienda, usar TODAS las tiendas del vendedor
    let tiendasIds: number[] = [];
    let tiendasMap: Map<number, string> = new Map();

    if (id_tienda) {
      // Validar que la tienda pertenece al vendedor
      const tienePermiso = await this.validarTiendaVendedor(id_usuario, id_tienda);
      if (!tienePermiso) {
        throw new ForbiddenException('No tienes permiso para acceder a esta tienda');
      }
      tiendasIds = [id_tienda];

      // Obtener nombre de la tienda específica
      const vendedor = await this.vendedorModel.findOne({ id_vendedor: id_usuario }).exec();
      const tienda = vendedor?.tiendas.find(t => t.id_tienda === id_tienda);
      if (tienda) tiendasMap.set(id_tienda, tienda.nombre_tienda);

    } else {
      // Obtener todas las tiendas del vendedor
      const { tiendas } = await this.obtenerTiendasVendedor(id_usuario);
      tiendasIds = tiendas.map(t => t.id_tienda);
      tiendas.forEach(t => tiendasMap.set(t.id_tienda, t.nombre_tienda));
    }

    // Construir ramas para el $switch del nombre de tienda
    const branches = Array.from(tiendasMap.entries()).map(([id, nombre]) => ({
      case: { $eq: ['$id_tienda', id] },
      then: nombre
    }));

    // Pipeline de agregación
    const pipeline: any[] = [
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

    // Contar total de productos
    const totalPipeline: any[] = [...pipeline, { $count: 'total' }];
    const totalResult = await this.productoModel.aggregate(totalPipeline).exec();
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    // Aplicar paginación
    const skip = (page - 1) * limit;
    const paginationPipeline: any[] = [
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
      id_tienda: id_tienda || 0, // 0 indica todas las tiendas
      nombre_tienda: id_tienda ? (tiendasMap.get(id_tienda) || 'General') : 'Todas las tiendas'
    };
  }

  async obtenerDatosConFiltros(filtros: FiltroReporteDto) {
    const pipeline: any[] = [];

    // 1. Filtrar Tienda (Optimización)
    if (filtros.id_tienda) {
      pipeline.push({ $match: { id_tienda: Number(filtros.id_tienda) } });
    }

    // 2. Unwind
    pipeline.push({ $unwind: '$productos' });

    // 3. USAR EL SERVICIO DE FILTROS AQUI
    // Le pasamos 'productos' como prefijo porque los datos están dentro de ese objeto
    const { query, sort } = this.filtrosService.construirQuery(filtros, 'productos');

    // Aplicar Match generado por el servicio
    if (Object.keys(query).length > 0) {
      pipeline.push({ $match: query });
    }

    // 4. Ordenamiento
    pipeline.push({ $sort: sort });

    // 5. Proyección
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

  // reportes.services.ts (función generarReportePDF)
  async generarReportePDF(filtros: FiltroReporteDto, res: Response) {
    const productos = await this.obtenerDatosConFiltros(filtros);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Función para formatear precios con puntos
    const formatearPrecio = (precio: number) => {
      return new Intl.NumberFormat('es-CL').format(precio);
    };

    // Cabeceras de respuesta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_ventas.pdf');
    doc.pipe(res);

    // Encabezado
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

    // Agrupar productos por categoría
    const productosPorCategoria: { [categoria: string]: any[] } = {};
    productos.forEach(p => {
      if (!productosPorCategoria[p.categoria]) {
        productosPorCategoria[p.categoria] = [];
      }
      productosPorCategoria[p.categoria].push(p);
    });

    // Ordenar productos dentro de cada categoría por precio
    Object.keys(productosPorCategoria).forEach(categoria => {
      productosPorCategoria[categoria].sort((a, b) => a.precio - b.precio);
    });

    // ===== TABLA =====
    const startX = 50;
    let y = doc.y;

    Object.keys(productosPorCategoria).forEach(categoria => {
      // Nueva página si se necesita
      if (y > 700) {
        doc.addPage();
        y = 70;

        // Repetir título y línea azul
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

      // Título de categoría
      doc
        .font('Helvetica-Bold')
        .fontSize(14)
        .fillColor('#003366')
        .text(`Categoría: ${categoria}`, startX, y);
      y += 25;

      const tablaY = y;

      // Encabezados de tabla
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

      // Filas de productos
      doc.font('Helvetica').fontSize(11).fillColor('black');
      productosPorCategoria[categoria].forEach((p, index) => {
        if (y > 750) {
          doc.addPage();
          y = 50;
        }

        // Línea horizontal separadora (excepto la primera fila)
        if (index > 0) {
          doc
            .moveTo(startX, y - 1)
            .lineTo(startX + 500, y - 1)
            .strokeColor('#000000')
            .lineWidth(1)
            .stroke();
        }

        // Fondo alterno de fila
        if (index % 2 === 0) {
          doc.save(); // guardar estado
          doc.rect(startX, y, 500, 20).fill('#f2f2f2');
          doc.restore(); // restaurar para que la línea no se borre
        }

        // Datos de la fila
        doc.text(p.nombre, startX + 5, y + 5, { width: 150 });
        doc.text(`$${formatearPrecio(p.precio)}`, startX + 160, y + 5, { width: 100 });
        doc.text(p.stock.toString(), startX + 270, y + 5, { width: 60 });
        doc.text(p.veces_vendido.toString(), startX + 335, y + 5, { width: 80 });
        doc.text(p.veces_buscado.toString(), startX + 420, y + 5, { width: 80 });

        y += 20;
      });

      // Marco negro alrededor de la tabla
      const tablaAltura = y - tablaY;
      doc
        .rect(startX, tablaY, 500, tablaAltura)
        .lineWidth(2)
        .strokeColor('black')
        .stroke();

      y += 25; // espacio entre categorías
    });

    // Pie de página
    doc
      .fontSize(10)
      .fillColor('gray')
      .text(`Generado el: ${new Date().toLocaleString()}`, 50, 780, { align: 'right', width: 500 });

    doc.end();
  }
}