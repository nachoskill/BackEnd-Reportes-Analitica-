import { Controller, Get, UseGuards, Query } from '@nestjs/common';
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

  // ==========================================
  // DESCUBRIMIENTO: Interacciones por día
  // ==========================================
  @UseGuards(JwtMicroserviceGuard)
  @Get('descubrimiento/interacciones-por-dia')
  async getProductoInteraccionesPorDia() {
    return this.analiticasService.getProductoInteraccionesPorDia();
  }

  // ==========================================
  // DESCUBRIMIENTO: Top 5 productos más buscados/clickeados
  // ==========================================
  @UseGuards(JwtMicroserviceGuard)
  @Get('descubrimiento/top-productos')
  async getTop5ProductosDescubrimiento() {
    return this.analiticasService.getTop5ProductosDescubrimiento();
  }

  // ==========================================
  // ACTIVIDAD USUARIOS: Nuevos usuarios por día o semanas del mes
  // ==========================================
  @UseGuards(JwtMicroserviceGuard)
  @Get('actividad-usuarios/nuevos-usuarios')
  async getNuevosUsuarios(@Query('periodo') periodo?: 'dia' | 'semana') {
    return this.analiticasService.getNuevosUsuarios(periodo || 'dia');
  }

  // ==========================================
  // ACTIVIDAD USUARIOS: Conteo de roles (Clientes y Vendedores)
  // ==========================================
  @UseGuards(JwtMicroserviceGuard)
  @Get('actividad-usuarios/roles-count')
  async getRolesCount() {
    return this.analiticasService.getRolesCount();
  }
}