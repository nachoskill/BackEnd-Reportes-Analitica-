import { Controller, Post, Get } from '@nestjs/common';
import { SeedingService } from './seeding.service';

@Controller('seed')
export class SeedingController {
    constructor(private readonly seedingService: SeedingService) { }

    /**
     * POST /seed/run
     * Ejecuta el seeding de todas las colecciones vacías
     */
    @Post('run')
    async runSeeding() {
        const results = await this.seedingService.seedAll();
        return {
            message: 'Seeding completado',
            results,
            totalInserted: Object.values(results).reduce((sum, count) => sum + count, 0)
        };
    }


    /**
     * GET /seed/status
     * Muestra el estado de las colecciones
     */
    @Get('status')
    async getStatus() {
        return {
            message: 'Endpoint de seeding disponible',
            endpoints: {
                run: 'POST /seed/run - Ejecuta el seeding',
                'update-ids': 'POST /seed/update-ids - Actualiza examples.json con IDs reales del admin',
                status: 'GET /seed/status - Muestra este mensaje'
            }
        };
    }
}
