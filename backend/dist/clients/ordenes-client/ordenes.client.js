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
var OrdenesClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdenesClient = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let OrdenesClient = OrdenesClient_1 = class OrdenesClient {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(OrdenesClient_1.name);
        this.baseUrl = this.configService.get('ORDENES_SERVICE_URL') || 'http://localhost:3002';
    }
    async getCarrito(userId, token) {
        this.logger.log(`Obteniendo carrito del usuario: ${userId}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/carrito/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            }));
            this.logger.log(`Carrito obtenido con ${response.data.items.length} items`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error al obtener carrito: ${error.message}`);
            throw error;
        }
    }
    async addToCarrito(userId, productoId, cantidad, token) {
        this.logger.log(`Agregando producto ${productoId} al carrito de ${userId}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/api/carrito/${userId}/items`, { id_producto: productoId, cantidad }, { headers: { Authorization: `Bearer ${token}` } }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error al agregar al carrito: ${error.message}`);
            throw error;
        }
    }
    async getOrdenes(token) {
        this.logger.log('Obteniendo todas las órdenes...');
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/ordenes`, {
                headers: { Authorization: `Bearer ${token}` },
            }));
            this.logger.log(`Obtenidas ${response.data.length} órdenes`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error al obtener órdenes: ${error.message}`);
            throw error;
        }
    }
    async getOrdenesByUser(userId, token) {
        this.logger.log(`Obteniendo órdenes del usuario: ${userId}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/ordenes/usuario/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error al obtener órdenes del usuario: ${error.message}`);
            throw error;
        }
    }
    async getOrdenById(ordenId, token) {
        this.logger.log(`Obteniendo orden con ID: ${ordenId}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/ordenes/${ordenId}`, {
                headers: { Authorization: `Bearer ${token}` },
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error al obtener orden ${ordenId}: ${error.message}`);
            throw error;
        }
    }
    async createOrden(createOrdenDto, token) {
        this.logger.log(`Creando nueva orden para usuario: ${createOrdenDto.id_usuario}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/api/ordenes`, createOrdenDto, { headers: { Authorization: `Bearer ${token}` } }));
            this.logger.log(`Orden creada con ID: ${response.data.id}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error al crear orden: ${error.message}`);
            throw error;
        }
    }
    async updateEstadoOrden(ordenId, estado, token) {
        this.logger.log(`Actualizando estado de orden ${ordenId} a: ${estado}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.patch(`${this.baseUrl}/api/ordenes/${ordenId}/estado`, { estado }, { headers: { Authorization: `Bearer ${token}` } }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error al actualizar estado de orden: ${error.message}`);
            throw error;
        }
    }
    async getOrdenesByEstado(estado, token) {
        const ordenes = await this.getOrdenes(token);
        return ordenes.filter(orden => orden.estado === estado);
    }
};
exports.OrdenesClient = OrdenesClient;
exports.OrdenesClient = OrdenesClient = OrdenesClient_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], OrdenesClient);
//# sourceMappingURL=ordenes.client.js.map