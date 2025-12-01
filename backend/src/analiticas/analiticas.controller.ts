import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnaliticasService } from './analiticas.services';
import { JwtMicroserviceGuard } from '../clients/auth-client/guards/jwt-microservice.guard';

@Controller('analiticas')
export class AnaliticasController {
  constructor(private readonly analiticasService: AnaliticasService) { }

  // ESTADO DE LOS CARRITOS DE COMPRA
  @UseGuards(JwtMicroserviceGuard)
  @Get('estadisticas/estado_carrito')
  async getEstadoCarritos() {
    return this.analiticasService.getEstadoCarritos();
  }
  // TENDENCIA DE PRODUCTOS DENTRO DE LOS CARRITOS 
  @UseGuards(JwtMicroserviceGuard)
  @Get('estadisticas/productos_tendencia')
  async getTendenciaProductos() {
    return this.analiticasService.getTendenciaProductos();
  }

  //Tendencia Semestral (Venta Productos)  (Listo)
  @UseGuards(JwtMicroserviceGuard)
  @Get('venta_productos')
  async getIngresosMensuales() {
    return this.analiticasService.getIngresosMensuales();
  }

  // Envios Por Region (Listo)
  @UseGuards(JwtMicroserviceGuard)
  @Get('tendencia/regiones')
  async getEnviosRegional() {
    return this.analiticasService.getEnviosRegional();
  }

  // 4. KPI: Ingresos Totales (Listo)
  @UseGuards(JwtMicroserviceGuard)
  @Get('estadisticas/ingresos')
  async getKpiIngresos() {
    return this.analiticasService.getKpiIngresos();
  }

  // 5. KPI: Mejor Región (Listo)
  @UseGuards(JwtMicroserviceGuard)
  @Get('estadisticas/Mejor_Region')
  async getKpiMejorRegion() {
    return this.analiticasService.getKpiMejorRegion();
  }
}