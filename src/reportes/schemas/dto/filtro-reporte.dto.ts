import { IsOptional, IsIn, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class FiltroReporteDto {
  // === NUEVO CAMPO ===
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_tienda?: number; // Filtrar por ID de tienda específico (Optimiza la carga)

  @IsOptional()
  @IsString()
  nombre?: string; // Filtrar por nombre del producto

  @IsOptional()
  @IsString()
  categoria?: string; // Filtrar por categoría

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrecio?: number; // Precio mínimo

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrecio?: number; // Precio máximo

  // --- FECHAS ELIMINADAS ---

  @IsOptional()
  @IsIn(['precio', 'nombre', 'categoria', 'stock', 'veces_vendido'])
  ordenarPor?: string; // Campo para ordenar el reporte (por defecto: precio)

  @IsOptional()
  @IsIn(['asc', 'desc'])
  orden?: 'asc' | 'desc'; // Dirección del orden (por defecto: descendente)
}