// reportes.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportesService } from './reportes.services';
import { FiltroReporteDto } from './schemas/dto/filtro-reporte.dto';
import { PaginacionDto } from './schemas/dto/paginacion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUserId } from './decorators/get-user-id.decorator';
import { Response } from 'express';
import { Res } from '@nestjs/common';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) { }

  // Obtener tiendas del vendedor autenticado
  @UseGuards(JwtAuthGuard)
  @Get('vendedor/tiendas')
  async obtenerTiendasVendedor(@GetUserId() id_usuario: number) {
    console.log('🔑 [JWT] ID Usuario extraído del token:', id_usuario);
    return this.reportesService.obtenerTiendasVendedor(id_usuario);
  }

  // Obtener productos paginados con filtro por tienda
  @UseGuards(JwtAuthGuard)
  @Get('productos')
  async obtenerDatos(
    @GetUserId() id_usuario: number,
    @Query() paginacionDto: PaginacionDto
  ) {
    console.log('🔑 [JWT] ID Usuario extraído del token:', id_usuario);
    console.log('📄 [Paginación] Parámetros recibidos:', paginacionDto);
    return this.reportesService.obtenerDatos(id_usuario, paginacionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('productos/filtrados')
  async obtenerDatosConFiltros(@Query() filtros: FiltroReporteDto) {
    return this.reportesService.obtenerDatosConFiltros(filtros);
  }

  // Obtener reporte pdf de ventas con filtros
  @UseGuards(JwtAuthGuard)
  @Get('productos/pdf')
  async generarReportePDF(@Query() filtros: FiltroReporteDto, @Res() res: Response) {
    return this.reportesService.generarReportePDF(filtros, res);
  }
}