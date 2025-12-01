import { Controller, Get } from '@nestjs/common';
import { AnaliticasService } from './analiticas.services';

@Controller('analiticas')
export class AnaliticasController {
  constructor(private readonly analiticasService: AnaliticasService) {}
  
  // ESTADO DE LOS CARRITOS DE COMPRA
  @Get('estadisticas/estado_carrito')
    async getEstadoCarritos() {
      return this.analiticasService.getEstadoCarritos();
  }
  // TENDENCIA DE PRODUCTOS DENTRO DE LOS CARRITOS 
  @Get('estadisticas/productos_tendencia')
  async getTendenciaProductos() {
    return this.analiticasService.getTendenciaProductos();
  }

  //Tendencia Semestral (Venta Productos)  (Listo)
  @Get('venta_productos')
  async getIngresosMensuales() {
    return this.analiticasService.getIngresosMensuales();
  }

  // Envios Por Region (Listo)
  @Get('tendencia/regiones')
  async getEnviosRegional() {
    return this.analiticasService.getEnviosRegional();
  }

  // 4. KPI: Ingresos Totales (Listo)
  @Get('estadisticas/ingresos')
  async getKpiIngresos() {
    return this.analiticasService.getKpiIngresos();
  }

  // 5. KPI: Mejor Región (Listo)
  @Get('estadisticas/Mejor_Region')
  async getKpiMejorRegion() {
    return this.analiticasService.getKpiMejorRegion();
  }
}