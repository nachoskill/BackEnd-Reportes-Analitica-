import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  VentaGeneral, VentaGeneralDocument,
  EnvioRegion, EnvioRegionDocument,
  Carrito, CarritoDocument,
  Descubrimiento, DescubrimientoDocument
} from './schemas/analiticas.schemas';
import { Cliente } from '../clients/auth-client/schemas/clientes.schemas';
import { Vendedor } from '../reportes/schemas/vendedores.schema';

@Injectable()
export class AnaliticasService {
  constructor(
    @InjectModel(VentaGeneral.name) private ventaGeneralModel: Model<VentaGeneralDocument>,
    @InjectModel(EnvioRegion.name) private envioRegionModel: Model<EnvioRegionDocument>,
    @InjectModel(Carrito.name) private carritoModel: Model<CarritoDocument>,
    @InjectModel(Descubrimiento.name) private descubrimientoModel: Model<DescubrimientoDocument>,
    @InjectModel(Cliente.name) private clienteModel: Model<Cliente>,
    @InjectModel(Vendedor.name) private vendedorModel: Model<Vendedor>,
  ) { }


  // ==========================================
  // GRÁFICO: Envios por region
  // Obtiene la region y cantidad de envios de la colección envios_region
  // ==========================================
  async getEnviosRegional() {
    const data = await this.envioRegionModel.find().exec();

    // Ordenar por cantidad_envios descendente
    const dataSorted = data.sort((a, b) => b.cantidad_envios - a.cantidad_envios);

    return dataSorted.map(d => ({
      name: d.region || 'Sin Región',
      value: d.cantidad_envios
    }));
  }

  // ==========================================
  // KPI: MEJOR REGIÓN
  // Obtiene la mejor region de envios de la colección envios_region
  // ==========================================
  async getKpiMejorRegion() {
    const datos = await this.envioRegionModel.find().exec();

    if (datos.length === 0) {
      return { mejorRegion: "Sin Datos", porcentajeRegion: 0 };
    }

    // Encontrar la región con más envíos
    const mejor = datos.reduce((prev, current) =>
      (current.cantidad_envios > prev.cantidad_envios) ? current : prev
    );

    // Calcular total de envíos
    const totalEnvios = datos.reduce((sum, d) => sum + d.cantidad_envios, 0);
    const porcentaje = (mejor.cantidad_envios / totalEnvios) * 100;

    return {
      mejorRegion: mejor.region,
      porcentajeRegion: Math.round(porcentaje)
    };
  }

  // ==========================================
  // KPI: INGRESOS DEL MES
  // Calcula el monto generado del mes y % diferencia respecto al anterior
  // Usa la colección ventas_generales
  // ==========================================
  async getKpiIngresos() {
    const fechaHoy = new Date();

    // Definir fechas (Inicio y Fin de mes actual y anterior)
    const inicioMesActual = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth(), 1);
    const finMesActual = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth() + 1, 0);

    const inicioMesAnterior = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth() - 1, 1);
    const finMesAnterior = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth(), 0);

    const resultados = await this.ventaGeneralModel.aggregate([
      {
        $addFields: {
          fecha_real: { $toDate: "$fecha" }
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
          ganancia: { $ifNull: ["$ganancia", 0] }
        }
      },
      {
        $group: {
          _id: "$mes",
          totalMes: { $sum: "$ganancia" }
        }
      }
    ]);

    const mesActualNum = fechaHoy.getMonth() + 1;
    let mesAnteriorNum = fechaHoy.getMonth();
    if (mesAnteriorNum === 0) mesAnteriorNum = 12;

    const datosMesActual = resultados.find(r => r._id === mesActualNum);
    const datosMesAnterior = resultados.find(r => r._id === mesAnteriorNum);

    const totalActual = datosMesActual ? datosMesActual.totalMes : 0;
    const totalAnterior = datosMesAnterior ? datosMesAnterior.totalMes : 0;

    let porcentaje = 0;
    if (totalAnterior > 0) {
      porcentaje = ((totalActual - totalAnterior) / totalAnterior) * 100;
    } else if (totalActual > 0) {
      porcentaje = 100;
    }

    return {
      ingresos: totalActual,
      porcentaje: Number(porcentaje.toFixed(1))
    };
  }


  // ==========================================
  // GRÁFICO: Ingresos Mensuales
  // ==========================================
  async getIngresosMensuales() {
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1;

    const primerDiaAño = new Date(fechaActual.getFullYear(), 0, 1);
    const ultimoDiaAño = new Date(fechaActual.getFullYear(), 11, 31);

    const resultados = await this.ventaGeneralModel.aggregate([
      {
        $addFields: {
          fecha_real: { $toDate: "$fecha" }
        }
      },
      {
        $match: {
          fecha_real: {
            $gte: primerDiaAño,
            $lte: ultimoDiaAño
          }
        }
      },
      {
        $project: {
          mesNumero: { $month: "$fecha_real" },
          ganancia: { $ifNull: ["$ganancia", 0] }
        }
      },
      {
        $group: {
          _id: "$mesNumero",
          totalVentas: { $sum: "$ganancia" }
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

  // ==========================================
  // DESCUBRIMIENTO: Interacciones agrupadas por DÍA DE LA SEMANA
  // Compara semana actual vs semana anterior
  // Devuelve 7 objetos (uno por cada día: Lunes-Domingo)
  // ==========================================
  async getProductoInteraccionesPorDia() {
    const fechaHoy = new Date();

    // Calcular el inicio de la semana actual (Lunes)
    const diaActual = fechaHoy.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
    const diasDesdeLunes = diaActual === 0 ? 6 : diaActual - 1; // Si es domingo, retroceder 6 días al lunes anterior

    const inicioSemanaActual = new Date(fechaHoy);
    inicioSemanaActual.setDate(fechaHoy.getDate() - diasDesdeLunes);
    inicioSemanaActual.setHours(0, 0, 0, 0);

    // Fin de semana actual = hoy (no incluir días futuros)
    const finSemanaActual = new Date(fechaHoy);
    finSemanaActual.setHours(23, 59, 59, 999);

    // Semana anterior: 7 días antes del inicio de semana actual
    const inicioSemanaAnterior = new Date(inicioSemanaActual);
    inicioSemanaAnterior.setDate(inicioSemanaActual.getDate() - 7);

    const finSemanaAnterior = new Date(inicioSemanaActual);
    finSemanaAnterior.setMilliseconds(-1);

    const data = await this.descubrimientoModel.aggregate([
      {
        // 1. Convertir fecha a Date si es string
        $addFields: {
          fecha_date: {
            $cond: {
              if: { $eq: [{ $type: "$fecha" }, "string"] },
              then: { $toDate: "$fecha" },
              else: "$fecha"
            }
          }
        }
      },
      {
        // 2. Filtrar solo las 2 semanas específicas
        $match: {
          fecha_date: {
            $gte: inicioSemanaAnterior,
            $lte: finSemanaActual
          }
        }
      },
      {
        // 3. Agregar campos calculados
        $addFields: {
          fecha_dia: {
            $dateToString: { format: "%Y-%m-%d", date: "$fecha_date" }
          },
          dia_semana: { $dayOfWeek: "$fecha_date" } // 1=Domingo, 2=Lunes, ..., 7=Sábado
        }
      },
      {
        // 4. CLAVE: Agrupar por FECHA EXACTA y tipo primero
        $group: {
          _id: {
            fecha: "$fecha_dia",
            tipo: "$tipo"
          },
          total: { $sum: 1 },
          dia_semana: { $first: "$dia_semana" },
          fecha_date: { $first: "$fecha_date" }
        }
      },
      {
        $sort: { "_id.fecha": 1 }
      }
    ]);

    // Procesar los resultados
    const nombresDias = ["", "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

    // Crear un mapa de fechas
    const mapaFechas = new Map();

    data.forEach(item => {
      const fecha = item._id.fecha;
      const fechaDate = new Date(item.fecha_date);

      if (!mapaFechas.has(fecha)) {
        mapaFechas.set(fecha, {
          fecha,
          dia_semana: item.dia_semana,
          es_semana_actual: fechaDate >= inicioSemanaActual && fechaDate <= finSemanaActual,
          clicks: 0,
          busquedas: 0,
          total: 0
        });
      }

      const registro = mapaFechas.get(fecha);
      if (item._id.tipo === 'CLICK') {
        registro.clicks = item.total;
      } else if (item._id.tipo === 'BUSQUEDA') {
        registro.busquedas = item.total;
      }
      registro.total += item.total;
    });

    // Agrupar por día de la semana
    const resultado = [];
    const ordenDias = [2, 3, 4, 5, 6, 7, 1]; // Lunes a Domingo

    // Determinar hasta qué día mostrar (no mostrar días futuros)
    const diaHoyNumero = fechaHoy.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado

    for (const diaSemana of ordenDias) {
      // Convertir día de semana de MongoDB (1=Dom, 2=Lun, ..., 7=Sab) 
      // a formato JavaScript (0=Dom, 1=Lun, ..., 6=Sab)
      const diaConvertido = diaSemana === 1 ? 0 : diaSemana - 1;

      // Lógica de filtrado:
      if (diaHoyNumero === 0) {
        // HOY ES DOMINGO: mostrar todos los días de la semana (Lunes-Domingo)
        // No hacer nada, incluir este día
      } else {
        // HOY NO ES DOMINGO: filtrar días
        if (diaSemana === 1) {
          continue; // Saltar domingo (aún no ha ocurrido)
        }
        if (diaConvertido > diaHoyNumero) {
          continue; // Saltar días futuros
        }
      }

      const objDia: any = {
        dia_semana: diaSemana,
        nombre_dia: nombresDias[diaSemana],
        semana_actual: { clicks: 0, busquedas: 0, total: 0 },
        semana_anterior: { clicks: 0, busquedas: 0, total: 0 }
      };

      // Buscar la fecha específica de este día en cada semana
      for (const [fecha, datos] of mapaFechas.entries()) {
        if (datos.dia_semana === diaSemana) {
          if (datos.es_semana_actual) {
            objDia.semana_actual.clicks += datos.clicks;
            objDia.semana_actual.busquedas += datos.busquedas;
            objDia.semana_actual.total += datos.total;
          } else {
            objDia.semana_anterior.clicks += datos.clicks;
            objDia.semana_anterior.busquedas += datos.busquedas;
            objDia.semana_anterior.total += datos.total;
          }
        }
      }

      resultado.push(objDia);
    }

    return resultado;
  }

  // ==========================================
  // DESCUBRIMIENTO: Top 5 productos más buscados/clickeados DE LA SEMANA ACTUAL
  // Combina eventos de CLICK y BUSQUEDA para encontrar los productos más populares
  // ==========================================
  async getTop5ProductosDescubrimiento() {
    // Calcular fecha de inicio de la semana actual (Lunes)
    const fechaHoy = new Date();

    // Calcular el inicio de la semana actual (Lunes)
    const diaActual = fechaHoy.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
    const diasDesdeLunes = diaActual === 0 ? 6 : diaActual - 1; // Si es domingo, retroceder 6 días al lunes anterior

    const inicioSemana = new Date(fechaHoy);
    inicioSemana.setDate(fechaHoy.getDate() - diasDesdeLunes);
    inicioSemana.setHours(0, 0, 0, 0);

    const data = await this.descubrimientoModel.aggregate([
      {
        // 1. Convertir fecha a Date si es string
        $addFields: {
          fecha_date: {
            $cond: {
              if: { $eq: [{ $type: "$fecha" }, "string"] },
              then: { $toDate: "$fecha" },
              else: "$fecha"
            }
          }
        }
      },
      {
        // 2. Filtrar solo datos de la semana actual (últimos 7 días)
        $match: {
          fecha_date: { $gte: inicioSemana }
        }
      },
      {
        // 3. Normalizar el nombre del producto
        $addFields: {
          producto_nombre: "$detalle"
        }
      },
      {
        // 4. Agrupar por nombre de producto y contar interacciones
        $group: {
          _id: "$producto_nombre",
          total_interacciones: { $sum: 1 },
          clicks: {
            $sum: {
              $cond: [{ $eq: ["$tipo", "CLICK"] }, 1, 0]
            }
          },
          busquedas: {
            $sum: {
              $cond: [{ $eq: ["$tipo", "BUSQUEDA"] }, 1, 0]
            }
          }
        }
      },
      {
        // 5. Ordenar por total de interacciones descendente
        $sort: { total_interacciones: -1 }
      },
      {
        // 6. Limitar a top 5
        $limit: 5
      }
    ]);

    // Formatear la respuesta
    return data.map(d => ({
      producto: d._id,
      total: d.total_interacciones,
      clicks: d.clicks,
      busquedas: d.busquedas
    }));
  }

  // ==========================================
  // ACTIVIDAD USUARIOS: Conteo de roles (Clientes y Vendedores)
  // Retorna la cantidad total de clientes y vendedores
  // ==========================================
  async getRolesCount() {
    const totalClientes = await this.clienteModel.countDocuments().exec();
    const totalVendedores = await this.vendedorModel.countDocuments().exec();

    return {
      clientes: totalClientes,
      vendedores: totalVendedores
    };
  }

  // ==========================================
  // ACTIVIDAD USUARIOS: Nuevos usuarios por día del mes o semanas del mes
  // Calcula la cantidad de usuarios registrados del mes actual
  // - periodo='dia': agrupa por días del mes actual
  // - periodo='semana': agrupa por semanas del mes actual
  // ==========================================
  async getNuevosUsuarios(periodo: 'dia' | 'semana' = 'dia') {
    const fechaHoy = new Date();
    const year = fechaHoy.getFullYear();
    const month = fechaHoy.getMonth(); // 0-11

    // Inicio y fin del mes actual
    const inicioMes = new Date(year, month, 1, 0, 0, 0, 0);
    const finMes = new Date(year, month + 1, 0, 23, 59, 59, 999);

    if (periodo === 'dia') {
      // Agrupar por día del mes actual
      const data = await this.clienteModel.aggregate([
        {
          $addFields: {
            fecha_creacion: {
              $cond: {
                if: { $eq: [{ $type: "$creado_en" }, "string"] },
                then: { $toDate: "$creado_en" },
                else: "$creado_en"
              }
            }
          }
        },
        {
          $match: {
            fecha_creacion: {
              $gte: inicioMes,
              $lte: finMes
            }
          }
        },
        {
          $group: {
            _id: { $dayOfMonth: "$fecha_creacion" },
            cantidad: { $sum: 1 }
          }
        },
        {
          $sort: { "_id": 1 }
        }
      ]);

      // Obtener el número de días en el mes actual
      const diasEnMes = new Date(year, month + 1, 0).getDate();
      const diaActual = fechaHoy.getDate();

      const resultado = [];
      for (let dia = 1; dia <= diasEnMes; dia++) {
        const datoDia = data.find(d => d._id === dia);
        resultado.push({
          name: dia.toString(),
          cantidad: datoDia ? datoDia.cantidad : 0,
          active: dia === diaActual
        });
      }

      return resultado;

    } else {
      // Agrupar por semanas del mes actual
      const data = await this.clienteModel.aggregate([
        {
          $addFields: {
            fecha_creacion: {
              $cond: {
                if: { $eq: [{ $type: "$creado_en" }, "string"] },
                then: { $toDate: "$creado_en" },
                else: "$creado_en"
              }
            }
          }
        },
        {
          $match: {
            fecha_creacion: {
              $gte: inicioMes,
              $lte: finMes
            }
          }
        },
        {
          $addFields: {
            dia_mes: { $dayOfMonth: "$fecha_creacion" }
          }
        },
        {
          $group: {
            _id: "$dia_mes",
            cantidad: { $sum: 1 }
          }
        }
      ]);

      // Calcular semanas del mes
      const diasEnMes = new Date(year, month + 1, 0).getDate();
      const semanas = [];
      let semanaActual = 1;
      let inicioSemana = 1;

      for (let dia = 1; dia <= diasEnMes; dia++) {
        const fecha = new Date(year, month, dia);
        const diaSemana = fecha.getDay(); // 0=Domingo, 6=Sábado

        // Si es domingo o es el último día del mes, cerrar la semana
        if (diaSemana === 0 || dia === diasEnMes) {
          const finSemana = dia;

          // Sumar usuarios de esta semana
          let totalSemana = 0;
          for (let d = inicioSemana; d <= finSemana; d++) {
            const datoDia = data.find(item => item._id === d);
            if (datoDia) {
              totalSemana += datoDia.cantidad;
            }
          }

          semanas.push({
            semana: semanaActual,
            inicio: inicioSemana,
            fin: finSemana,
            total: totalSemana
          });

          semanaActual++;
          inicioSemana = dia + 1;
        }
      }

      // Determinar en qué semana estamos
      const diaHoy = fechaHoy.getDate();
      let semanaHoy = 1;
      for (const sem of semanas) {
        if (diaHoy >= sem.inicio && diaHoy <= sem.fin) {
          semanaHoy = sem.semana;
          break;
        }
      }

      // Formatear resultado
      const resultado = semanas.map(sem => ({
        name: `S${sem.semana}`,
        cantidad: sem.total,
        active: sem.semana === semanaHoy
      }));

      return resultado;
    }
  }

}