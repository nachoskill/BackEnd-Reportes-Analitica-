import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { EnvioDto, CreateEnvioDto, TrackingInfoDto } from './dto/envio.dto';
export declare class EnviosClient {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    constructor(httpService: HttpService, configService: ConfigService);
    getEnvios(token: string): Promise<EnvioDto[]>;
    getEnvioById(envioId: string, token: string): Promise<EnvioDto>;
    getEnviosByOrden(ordenId: string, token: string): Promise<EnvioDto[]>;
    getEnviosByUser(userId: string, token: string): Promise<EnvioDto[]>;
    createEnvio(createEnvioDto: CreateEnvioDto, token: string): Promise<EnvioDto>;
    updateEstadoEnvio(envioId: string, estado: 'pendiente' | 'en_transito' | 'entregado' | 'cancelado', token: string): Promise<EnvioDto>;
    trackEnvio(numeroSeguimiento: string, token: string): Promise<TrackingInfoDto>;
    getEnviosByEstado(estado: 'pendiente' | 'en_transito' | 'entregado' | 'cancelado', token: string): Promise<EnvioDto[]>;
    getEnviosEnTransito(token: string): Promise<EnvioDto[]>;
    getEnviosPendientes(token: string): Promise<EnvioDto[]>;
}
