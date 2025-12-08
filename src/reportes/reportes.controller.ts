// reportes.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportesService } from './reportes.services';
import { FiltroReporteDto } from './schemas/dto/filtro-reporte.dto';
import { PaginacionDto } from './schemas/dto/paginacion.dto';
import { JwtMicroserviceGuard } from '../clients/auth-client/guards/jwt-microservice.guard';
import { GetUserId } from './decorators/get-user-id.decorator';
import { Response } from 'express';
import { Res } from '@nestjs/common';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) { }

  // Obtener tiendas del vendedor autenticado
  @UseGuards(JwtMicroserviceGuard)
  @Get('vendedor/tiendas')
  async obtenerTiendasVendedor(@GetUserId() id_usuario: number) {
    //console.log('🔑 [JWT] ID Usuario extraído del token:', id_usuario);
    return this.reportesService.obtenerTiendasVendedor(id_usuario);
  }

  // Obtener productos paginados con filtro por tienda
  @UseGuards(JwtMicroserviceGuard)
  @Get('productos')
  async obtenerDatos(
    @GetUserId() id_usuario: number,
    @Query() paginacionDto: PaginacionDto
  ) {
    //console.log('🔑 [JWT] ID Usuario extraído del token:', id_usuario);
    console.log('📄 [Paginación] Parámetros recibidos:', paginacionDto);

    // CORRECCIÓN: Asegurar que page y limit sean números
    const paramsValidado = {
      ...paginacionDto,
      page: paginacionDto.page ? Number(paginacionDto.page) : 1,
      limit: paginacionDto.limit ? Number(paginacionDto.limit) : 20,
      id_tienda: paginacionDto.id_tienda ? Number(paginacionDto.id_tienda) : undefined
    };

    // Pasamos el objeto validado con números reales
    return this.reportesService.obtenerDatos(id_usuario, paramsValidado);
  }

  @UseGuards(JwtMicroserviceGuard)
  @Get('productos/filtrados')
  async obtenerDatosConFiltros(
    @GetUserId() id_usuario: number,
    @Query() filtros: FiltroReporteDto,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.reportesService.obtenerProductosFiltrados(
      id_usuario,
      filtros,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20
    );
  }

  // Obtener reporte pdf de ventas con filtros
  @UseGuards(JwtMicroserviceGuard)
  @Get('productos/pdf')
  async generarReportePDF(
    @GetUserId() id_usuario: number,
    @Query() filtros: FiltroReporteDto,
    @Res() res: Response
  ) {
    return this.reportesService.generarReportePDF(id_usuario, filtros, res);
  }
}