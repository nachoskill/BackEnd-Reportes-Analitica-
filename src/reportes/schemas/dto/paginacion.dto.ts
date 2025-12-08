import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginacionDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    id_tienda?: number;

    @IsOptional()
    ordenarPor?: string; // Campo para ordenar (precio, nombre, stock, veces_vendido)

    @IsOptional()
    orden?: 'asc' | 'desc'; // Dirección del orden
}
