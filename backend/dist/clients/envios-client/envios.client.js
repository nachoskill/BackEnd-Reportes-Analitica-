"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EnviosClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnviosClient = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let EnviosClient = EnviosClient_1 = class EnviosClient {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(EnviosClient_1.name);
        this.baseUrl = this.configService.get('ENVIOS_SERVICE_URL') || 'http://localhost:3003';
    }
    async getEnvios(token) {
        this.logger.log('Obteniendo todos los envíos...');
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/envios`, {
                headers: { Authorization: `Bearer ${token}` },
            }));
            this.logger.log(`Obtenidos ${response.data.length} envíos`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error al obtener envíos: ${error.message}`);
            throw error;
        }
    }
    async getEnvioById(envioId, token) {
        this.logger.log(`Obteniendo envío con ID: ${envioId}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/envios/${envioId}`, {
                headers: { Authorization: `Bearer ${token}` },
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error al obtener envío ${envioId}: ${error.message}`);
            throw error;
        }
    }
    async getEnviosByOrden(ordenId, token) {
        this.logger.log(`Obteniendo envíos de la orden: ${ordenId}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/envios/orden/${ordenId}`, {
                headers: { Authorization: `Bearer ${token}` },
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error al obtener envíos de la orden: ${error.message}`);
            throw error;
        }
    }
    async getEnviosByUser(userId, token) {
        this.logger.log(`Obteniendo envíos del usuario: ${userId}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/envios/usuario/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error al obtener envíos del usuario: ${error.message}`);
            throw error;
        }
    }
    async createEnvio(createEnvioDto, token) {
        this.logger.log(`Creando nuevo envío para orden: ${createEnvioDto.id_orden}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/api/envios`, createEnvioDto, { headers: { Authorization: `Bearer ${token}` } }));
            this.logger.log(`Envío creado con ID: ${response.data.id}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error al crear envío: ${error.message}`);
            throw error;
        }
    }
    async updateEstadoEnvio(envioId, estado, token) {
        this.logger.log(`Actualizando estado de envío ${envioId} a: ${estado}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.patch(`${this.baseUrl}/api/envios/${envioId}/estado`, { estado }, { headers: { Authorization: `Bearer ${token}` } }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error al actualizar estado de envío: ${error.message}`);
            throw error;
        }
    }
    async trackEnvio(numeroSeguimiento, token) {
        this.logger.log(`Rastreando envío: ${numeroSeguimiento}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/envios/tracking/${numeroSeguimiento}`, { headers: { Authorization: `Bearer ${token}` } }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error al rastrear envío: ${error.message}`);
            throw error;
        }
    }
    async getEnviosByEstado(estado, token) {
        const envios = await this.getEnvios(token);
        return envios.filter(envio => envio.estado === estado);
    }
    async getEnviosEnTransito(token) {
        return this.getEnviosByEstado('en_transito', token);
    }
    async getEnviosPendientes(token) {
        return this.getEnviosByEstado('pendiente', token);
    }
};
exports.EnviosClient = EnviosClient;
exports.EnviosClient = EnviosClient = EnviosClient_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], EnviosClient);
//# sourceMappingURL=envios.client.js.map