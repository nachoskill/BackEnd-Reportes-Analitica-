import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pago, PagoDocument, Envio, EnvioDocument, Producto, ProductoDocument, Carrito, CarritoDocument } from './schemas/analiticas.schemas';

@Injectable()
export class AnaliticasService {
  constructor(
    @InjectModel(Pago.name) private pagoModel: Model<PagoDocument>,
    @InjectModel(Envio.name) private envioModel: Model<EnvioDocument>,
    @InjectModel(Producto.name) private productoModel: Model<ProductoDocument>,
    @InjectModel(Carrito.name) private carritoModel: Model<CarritoDocument>,
  ) {}


  // ==========================================
  // GRÁFICO: Envios por region (Listo)
  // ==========================================
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

  // ==========================================
  // KPI: MEJOR REGIÓN (listo)
  // ==========================================
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

  // ==========================================
  // KPI: INGRESOS DEL MES (Listo)
  // ==========================================
  async getKpiIngresos() {
    const fechaHoy = new Date();
    
    // Definir fechas (Inicio y Fin de mes actual y anterior)
    const inicioMesActual = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth(), 1);
    const finMesActual = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth() + 1, 0);

    const inicioMesAnterior = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth() - 1, 1);
    const finMesAnterior = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth(), 0);

    const resultados = await this.productoModel.aggregate([
      {
        // 1. PASO CRÍTICO: Convertir "fecha_creacion" a objeto Date real
        // Esto soluciona el problema si el dato viene como string en el JSON importado.
        $addFields: {
          fecha_real: { $toDate: "$fecha_creacion" }
        }
      },
      {
        // 2. MATCH: Filtramos usando la fecha convertida
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
          // 3. CALCULO SEGURO: Usamos ifNull para que no falle si falta un dato
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
          _id: "$mes", // Agrupamos por número de mes (10, 11, etc.)
          totalMes: { $sum: "$ingreso" }
        }
      }
    ]);

    // --- LÓGICA DE COMPARACIÓN ---
    // Nota: getMonth() devuelve 0=Ene, 11=Dic. En Mongo $month devuelve 1=Ene, 12=Dic.
    // Por eso sumamos +1 aquí para que coincidan.
    const mesActualNum = fechaHoy.getMonth() + 1; 
    
    // Truco: Si estamos en Enero (0), el mes anterior es Diciembre (12)
    let mesAnteriorNum = fechaHoy.getMonth(); 
    if (mesAnteriorNum === 0) mesAnteriorNum = 12;

    const datosMesActual = resultados.find(r => r._id === mesActualNum);
    const datosMesAnterior = resultados.find(r => r._id === mesAnteriorNum);

    const totalActual = datosMesActual ? datosMesActual.totalMes : 0;
    const totalAnterior = datosMesAnterior ? datosMesAnterior.totalMes : 0;

    let porcentaje = 0;
    if (totalAnterior > 0) {
      porcentaje = ((totalActual - totalAnterior) / totalActual) * 100;
    } else if (totalActual > 0) {
      porcentaje = 100; 
    }

    return {
      ingresos: totalActual,
      porcentaje: Number(porcentaje.toFixed(1))
    };
  }


  // ==========================================
  // GRÁFICO: Ingresos Mensuales (Listo)
  // ==========================================
  async getIngresosMensuales() {
    const fechaActual = new Date();
    
    // 1. OBTENEMOS EL MES ACTUAL (1 = Enero, ..., 11 = Noviembre)
    // getMonth() devuelve 0-11, así que sumamos 1 para que coincida con tu lógica
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
    
    // 2. CAMBIO EN EL BUCLE:
    // Iteramos solo hasta 'mesActual' (ej: 11) en lugar de hasta 12.
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
  
  // ==========================================
  // GRÁFICO: ESTADOS DEL CARRITO (Listo)
  // ==========================================
  async getEstadoCarritos() {
    const data = await this.carritoModel.aggregate([
      {
        // 1. UNIÓN (JOIN)
        $lookup: {
          from: 'pagos',             
          localField: 'id_carrito',  // <--- CAMBIO CLAVE: Usamos id_carrito, no _id
          foreignField: 'id_carrito',
          as: 'info_pago'            
        }
      },
      {
        // 2. DETERMINAR ESTADO
        $project: {
          estado_final: {
            $cond: {
              // ¿Encontró un pago asociado?
              if: { $gt: [{ $size: "$info_pago" }, 0] }, 
              
              // SI: Toma el estado real del pago
              then: { $arrayElemAt: ["$info_pago.estado", 0] },
              
              // NO: Es un abandono porque no hay registro de pago
              else: "abandonado"
            }
          }
        }
      },
      {
        // 3. AGRUPAR Y CONTAR
        $group: {
          _id: "$estado_final", 
          cantidad: { $sum: 1 }
        }
      }
    ]);

    // 4. FORMATEO
    return data.map(d => ({
      name: d._id ? (d._id.charAt(0).toUpperCase() + d._id.slice(1)) : 'Desconocido', 
      value: d.cantidad
    }));
  }
  // ==========================================
  // TENDENCIA DE PRODUCTOS MÁS VENDIDOS POR ESTADO DEL CARRITO 
  // ==========================================
  async getTendenciaProductos() {
    const data = await this.carritoModel.aggregate([
      // 1. Traer información del pago para saber el estado
      {
        $lookup: {
          from: 'pagos',
          localField: 'id_carrito', // OJO: Asegúrate que coincida con tu esquema (id_carrito vs _id)
          foreignField: 'id_carrito',
          as: 'info_pago'
        }
      },
      // 2. Calcular el estado (igual que hicimos antes)
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
      // 3. Separar los items (Array ["5001", "5002"] se convierte en documentos separados)
      { $unwind: "$items" },
      // 4. Convertir el ID del item de String a Number (según tus JSONs items son string "5000", productos id es number 5000)
      {
        $addFields: {
          id_producto_number: { $toInt: "$items" }
        }
      },
      // 5. Unir con la colección de Productos para sacar el Nombre
      {
        $lookup: {
          from: 'productos',
          localField: 'id_producto_number',
          foreignField: 'id_producto',
          as: 'detalle_producto'
        }
      },
      // 6. Limpiar objetos que no cruzaron (seguridad) y aplanar array
      { $unwind: "$detalle_producto" },
      // 7. Agrupar para contar: Por Estado y Por Nombre de Producto
      {
        $group: {
          _id: { 
            estado: "$estado_calculado", 
            producto: "$detalle_producto.nombre" 
          },
          total: { $sum: 1 }
        }
      },
      // 8. Ordenar descendente
      { $sort: { total: -1 } },
      // 9. Re-agrupar por estado para entregar JSON ordenado
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

    // 10. Formatear la salida para que el Frontend no sufra
    const respuesta = {
      completado: [],
      abandonado: [],
      cancelado: []
    };

    data.forEach(grupo => {
      const estado = grupo._id; // "completado", "abandonado", etc.
      if (respuesta[estado] !== undefined) {
        // Tomamos solo los top 5
        respuesta[estado] = grupo.top_lista.slice(0, 5);
      }
    });

    return respuesta;
  }



}