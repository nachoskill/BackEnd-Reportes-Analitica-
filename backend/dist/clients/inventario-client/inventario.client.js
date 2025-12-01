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
var InventarioClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventarioClient = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let InventarioClient = InventarioClient_1 = class InventarioClient {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(InventarioClient_1.name);
        this.baseUrl = this.configService.get('INVENTARIO_SERVICE_URL') || 'http://localhost:3001';
    }
    async getProductos(token) {
        this.logger.log('Obteniendo todos los productos...');
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/productos`, {
                headers: { Authorization: `Bearer ${token}` },
            }));
            this.logger.log(`Obtenidos ${response.data.length} productos`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error al obtener productos: ${error.message}`);
            throw error;
        }
    }
    async getProductoById(productoId, token) {
        this.logger.log(`Obteniendo producto con ID: ${productoId}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/productos/${productoId}`, {
                headers: { Authorization: `Bearer ${token}` },
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error al obtener producto ${productoId}: ${error.message}`);
            throw error;
        }
    }
    async getProductosByCategoria(categoria, token) {
        this.logger.log(`Obteniendo productos de categoría: ${categoria}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/productos/categoria/${categoria}`, {
                headers: { Authorization: `Bearer ${token}` },
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error al obtener productos de categoría ${categoria}: ${error.message}`);
            throw error;
        }
    }
    async updateStock(updateStockDto, token) {
        this.logger.log(`Actualizando stock del producto: ${updateStockDto.id_producto}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.patch(`${this.baseUrl}/api/productos/${updateStockDto.id_producto}/stock`, updateStockDto, { headers: { Authorization: `Bearer ${token}` } }));
            this.logger.log(`Stock actualizado: ${response.data.stock_anterior} → ${response.data.stock_nuevo}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error al actualizar stock: ${error.message}`);
            throw error;
        }
    }
    async verificarStock(productoId, cantidad, token) {
        const producto = await this.getProductoById(productoId, token);
        return producto.stock >= cantidad;
    }
    async getProductosStockBajo(umbral, token) {
        const productos = await this.getProductos(token);
        return productos.filter(p => p.stock < umbral && p.activo);
    }
};
exports.InventarioClient = InventarioClient;
exports.InventarioClient = InventarioClient = InventarioClient_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], InventarioClient);
//# sourceMappingURL=inventario.client.js.map