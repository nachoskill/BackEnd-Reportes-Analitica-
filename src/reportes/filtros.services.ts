// filtros.service.ts
import { Injectable } from '@nestjs/common';
import { FiltroReporteDto } from './schemas/dto/filtro-reporte.dto';

@Injectable()
export class FiltrosService {

  // Agregamos el parámetro opcional 'prefijo' (ej: 'productos')
  construirQuery(filtros: FiltroReporteDto, prefijo: string = ''): { query: any; sort: any } {
    const query: any = {};

    // Función helper para agregar el prefijo si existe
    const getKey = (campo: string) => prefijo ? `${prefijo}.${campo}` : campo;

    // Filtrar por nombre
    if (filtros.nombre) {
      query[getKey('nombre')] = { $regex: new RegExp(filtros.nombre, 'i') };
    }

    // Filtrar por categoría
    if (filtros.categoria) {
      const categorias = filtros.categoria.split(',').map(cat => cat.trim());
      const regexCategorias = categorias.map(c => new RegExp(c, 'i'));
      query[getKey('categoria')] = { $in: regexCategorias };
    }

    // Filtrar por rango de precios
    if (filtros.minPrecio !== undefined || filtros.maxPrecio !== undefined) {
      const keyPrecio = getKey('precio');
      query[keyPrecio] = {};
      if (filtros.minPrecio !== undefined) query[keyPrecio].$gte = filtros.minPrecio;
      if (filtros.maxPrecio !== undefined) query[keyPrecio].$lte = filtros.maxPrecio;
    }

    // Ordenamiento con mapeo de campos
    const sort: any = {};

    // Mapeo de campos: frontend -> MongoDB
    const campoMap: { [key: string]: string } = {
      'precio': 'precio',
      'nombre': 'nombre',
      'stock': 'cantidad',  // ⚠️ IMPORTANTE: stock se mapea a cantidad en MongoDB
      'veces_vendido': 'veces_vendido',
      'categoria': 'categoria'
    };

    const campoFrontend = filtros.ordenarPor || 'precio';
    const campoMongoDB = campoMap[campoFrontend] || campoFrontend;

    // Aplicar prefijo al campo mapeado
    sort[getKey(campoMongoDB)] = filtros.orden === 'desc' ? -1 : 1;

    return { query, sort };
  }
}