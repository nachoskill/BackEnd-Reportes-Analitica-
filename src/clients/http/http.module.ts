import { Module, Global } from '@nestjs/common';
import { HttpModule as NestHttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * Módulo HTTP global para todas las integraciones con microservicios
 * Configura Axios con timeout, headers y otras opciones comunes
 */
@Global()
@Module({
    imports: [
        NestHttpModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                timeout: configService.get<number>('HTTP_TIMEOUT') || 10000,
                maxRedirects: 5,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            }),
            inject: [ConfigService],
        }),
    ],
    exports: [NestHttpModule],
})
export class HttpModule { }
