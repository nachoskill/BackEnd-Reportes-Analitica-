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
    const { page = 1, limit = 20, id_tienda, ordenarPor = 'precio', orden = 'asc' } = paginacionDto;

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

    // Mapeo de campos para ordenamiento
    const campoMap: { [key: string]: string } = {
      'precio': 'productos.precio',
      'nombre': 'productos.nombre',
      'stock': 'productos.cantidad',
      'veces_vendido': 'productos.veces_vendido',
      'categoria': 'productos.categoria'
    };

    const campoOrden = campoMap[ordenarPor] || 'productos.precio';
    const direccionOrden = orden === 'desc' ? -1 : 1;

    // Pipeline de agregación
    const pipeline: any[] = [
      { $match: { id_tienda: { $in: tiendasIds } } },
      { $unwind: '$productos' },
      { $sort: { [campoOrden]: direccionOrden } },
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

  async obtenerProductosFiltrados(id_usuario: number, filtros: FiltroReporteDto, page: number = 1, limit: number = 20) {
    const pipeline: any[] = [];

    // Obtener tiendas del vendedor para construir el mapeo de nombres Y filtrar
    let tiendasIds: number[] = [];
    let tiendasMap: Map<number, string> = new Map();

    if (filtros.id_tienda) {
      // Si se filtra por una tienda específica, validar que pertenece al vendedor
      const tienePermiso = await this.validarTiendaVendedor(id_usuario, Number(filtros.id_tienda));
      if (!tienePermiso) {
        throw new ForbiddenException('No tienes permiso para acceder a esta tienda');
      }
      tiendasIds = [Number(filtros.id_tienda)];

      const vendedor = await this.vendedorModel.findOne({ id_vendedor: id_usuario }).exec();
      const tienda = vendedor?.tiendas.find(t => t.id_tienda === Number(filtros.id_tienda));
      if (tienda) tiendasMap.set(Number(filtros.id_tienda), tienda.nombre_tienda);
    } else {
      // Si no hay filtro, obtener TODAS las tiendas del vendedor
      const { tiendas } = await this.obtenerTiendasVendedor(id_usuario);
      tiendasIds = tiendas.map(t => t.id_tienda);
      tiendas.forEach(t => tiendasMap.set(t.id_tienda, t.nombre_tienda));
    }

    // Construir ramas para el $switch del nombre de tienda
    const branches = Array.from(tiendasMap.entries()).map(([id, nombre]) => ({
      case: { $eq: ['$id_tienda', id] },
      then: nombre
    }));

    // 1. SIEMPRE Filtrar por las tiendas del vendedor (SEGURIDAD)
    pipeline.push({ $match: { id_tienda: { $in: tiendasIds } } });

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

    // 5. Proyección con nombre de tienda dinámico
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
        tienda: {
          $switch: {
            branches: branches,
            default: 'General'
          }
        }
      }
    });

    // Contar total de productos ANTES de paginar
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
      totalPages: Math.ceil(total / limit)
    };
  }

  // reportes.services.ts (función generarReportePDF)
  async generarReportePDF(id_usuario: number, filtros: FiltroReporteDto, res: Response) {
    // Obtener TODOS los productos filtrados para el PDF (limit alto)
    const response = await this.obtenerProductosFiltrados(id_usuario, filtros, 1, 10000);
    const productos = response.productos;

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Función para formatear precios como enteros (sin decimales)
    const formatearPrecio = (precio: number) => {
      return new Intl.NumberFormat('es-CL').format(Math.round(precio));
    };

    // Cabeceras de respuesta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_ventas.pdf');
    doc.pipe(res);

    // Encabezado
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
      .moveDown(0.5);

    // SECCIÓN DE FILTROS APLICADOS
    doc
      .fontSize(12)
      .fillColor('#666666')
      .text('Filtros Aplicados:', 50, doc.y, { underline: true })
      .moveDown(0.3);

    const filtrosTexto: string[] = [];
    if (filtros.nombre) filtrosTexto.push(`Nombre: "${filtros.nombre}"`);
    if (filtros.categoria) filtrosTexto.push(`Categoría: ${filtros.categoria}`);
    if (filtros.minPrecio !== undefined) filtrosTexto.push(`Precio Min: $${formatearPrecio(filtros.minPrecio)}`);
    if (filtros.maxPrecio !== undefined) filtrosTexto.push(`Precio Max: $${formatearPrecio(filtros.maxPrecio)}`);
    if (filtros.ordenarPor) {
      const ordenTexto = filtros.orden === 'desc' ? 'Descendente' : 'Ascendente';
      const campoTexto = filtros.ordenarPor.charAt(0).toUpperCase() + filtros.ordenarPor.slice(1);
      filtrosTexto.push(`Ordenado por: ${campoTexto} (${ordenTexto})`);
    }

    if (filtrosTexto.length > 0) {
      doc
        .fontSize(10)
        .fillColor('#333333')
        .text(filtrosTexto.join(' | '), 50, doc.y, { width: 500 })
        .moveDown(0.5);
    } else {
      doc
        .fontSize(10)
        .fillColor('#999999')
        .text('Sin filtros aplicados', 50, doc.y)
        .moveDown(0.5);
    }

    doc
      .fontSize(10)
      .fillColor('#666666')
      .text(`Total de productos: ${productos.length}`, 50, doc.y)
      .moveDown(1);

    // ===== TABLA SIMPLE (SIN AGRUPAR POR CATEGORÍA) =====
    const startX = 50;
    const colWidths = {
      nombre: 140,    // Reducido de 150 a 140
      precio: 75,     // Reducido de 80 a 75
      stock: 45,      // Reducido de 50 a 45
      vendidos: 55,   // Reducido de 60 a 55
      categoria: 85,  // Reducido de 90 a 85
      tienda: 100     // Aumentado de 80 a 100 ✅
    };
    const tableWidth = Object.values(colWidths).reduce((a, b) => a + b, 0);
    let y = doc.y;

    // Encabezados de tabla
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('white')
      .rect(startX, y, tableWidth, 20)
      .fill('#003366');

    let xPos = startX + 5;
    doc
      .fillColor('white')
      .text('Producto', xPos, y + 5, { width: colWidths.nombre });
    xPos += colWidths.nombre;
    doc.text('Precio', xPos, y + 5, { width: colWidths.precio });
    xPos += colWidths.precio;
    doc.text('Stock', xPos, y + 5, { width: colWidths.stock });
    xPos += colWidths.stock;
    doc.text('Vendidos', xPos, y + 5, { width: colWidths.vendidos });
    xPos += colWidths.vendidos;
    doc.text('Categoría', xPos, y + 5, { width: colWidths.categoria });
    xPos += colWidths.categoria;
    doc.text('Tienda', xPos, y + 5, { width: colWidths.tienda });

    y += 20;

    // Filas de productos (YA VIENEN ORDENADOS DEL BACKEND)
    doc.font('Helvetica').fontSize(9).fillColor('black');

    productos.forEach((p, index) => {
      // Nueva página si se necesita
      if (y > 750) {
        doc.addPage();
        y = 50;

        // Repetir encabezados
        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor('white')
          .rect(startX, y, tableWidth, 20)
          .fill('#003366');

        let xPosHeader = startX + 5;
        doc.fillColor('white')
          .text('Producto', xPosHeader, y + 5, { width: colWidths.nombre });
        xPosHeader += colWidths.nombre;
        doc.text('Precio', xPosHeader, y + 5, { width: colWidths.precio });
        xPosHeader += colWidths.precio;
        doc.text('Stock', xPosHeader, y + 5, { width: colWidths.stock });
        xPosHeader += colWidths.stock;
        doc.text('Vendidos', xPosHeader, y + 5, { width: colWidths.vendidos });
        xPosHeader += colWidths.vendidos;
        doc.text('Categoría', xPosHeader, y + 5, { width: colWidths.categoria });
        xPosHeader += colWidths.categoria;
        doc.text('Tienda', xPosHeader, y + 5, { width: colWidths.tienda });

        y += 20;
        doc.font('Helvetica').fontSize(9).fillColor('black');
      }

      // Fondo alterno de fila
      if (index % 2 === 0) {
        doc.save();
        doc.rect(startX, y, tableWidth, 18).fill('#f8f9fa');
        doc.restore();
      }

      // Datos de la fila
      let xData = startX + 5;

      // Nombre (truncar si es muy largo)
      const nombreTruncado = p.nombre.length > 25 ? p.nombre.substring(0, 22) + '...' : p.nombre;
      doc.text(nombreTruncado, xData, y + 4, { width: colWidths.nombre - 5 });
      xData += colWidths.nombre;

      // Precio
      doc.text(`$${formatearPrecio(p.precio)}`, xData, y + 4, { width: colWidths.precio - 5 });
      xData += colWidths.precio;

      // Stock
      doc.text(p.stock.toString(), xData, y + 4, { width: colWidths.stock - 5 });
      xData += colWidths.stock;

      // Vendidos
      doc.text(p.veces_vendido.toString(), xData, y + 4, { width: colWidths.vendidos - 5 });
      xData += colWidths.vendidos;

      // Categoría
      const categoriaTruncada = p.categoria.length > 15 ? p.categoria.substring(0, 12) + '...' : p.categoria;
      doc.text(categoriaTruncada, xData, y + 4, { width: colWidths.categoria - 5 });
      xData += colWidths.categoria;

      // Tienda (sin truncar, ahora hay espacio suficiente)
      doc.text(p.tienda || 'General', xData, y + 4, { width: colWidths.tienda - 5 });

      y += 18;
    });

    // Marco negro alrededor de toda la tabla
    const tablaAltura = (productos.length * 18) + 20; // 20 del header
    const paginasNecesarias = Math.ceil(tablaAltura / 700);

    // Dibujar borde solo en la última posición
    doc
      .rect(startX, y - (productos.length % Math.floor(700 / 18)) * 18, tableWidth, (productos.length % Math.floor(700 / 18)) * 18)
      .lineWidth(1)
      .strokeColor('#e5e7eb')
      .stroke();

    // Pie de página
    doc
      .fontSize(10)
      .fillColor('gray')
      .text(`Generado el: ${new Date().toLocaleString('es-CL')}`, 50, 780, { align: 'right', width: 500 });

    doc.end();
  }
}