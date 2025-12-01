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
var AuthClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthClient = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let AuthClient = AuthClient_1 = class AuthClient {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(AuthClient_1.name);
        this.baseUrl = this.configService.get('AUTH_SERVICE_URL') || 'http://localhost:3000';
    }
    async getAllUsers(token) {
        this.logger.log('Obteniendo todos los usuarios...');
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/auth/users`, {
                headers: { Authorization: `Bearer ${token}` },
            }));
            this.logger.log(`Obtenidos ${response.data.length} usuarios`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error al obtener usuarios: ${error.message}`);
            throw error;
        }
    }
    async getUsersByRole(role, token) {
        this.logger.log(`Obteniendo usuarios con rol: ${role}`);
        const allUsers = await this.getAllUsers(token);
        const filteredUsers = allUsers.filter(user => user.roles.includes(role));
        this.logger.log(`Encontrados ${filteredUsers.length} usuarios con rol ${role}`);
        return filteredUsers;
    }
    async getMe(token) {
        this.logger.log('Obteniendo perfil del usuario actual...');
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            }));
            this.logger.log(`Perfil obtenido: ${response.data.correo}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error al obtener perfil: ${error.message}`);
            throw error;
        }
    }
    async getUserById(userId, token) {
        this.logger.log(`Obteniendo usuario con ID: ${userId}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/auth/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error al obtener usuario ${userId}: ${error.message}`);
            throw error;
        }
    }
    async userHasPermission(userId, permission, token) {
        const user = await this.getUserById(userId, token);
        return user.permisos?.includes(permission) || false;
    }
};
exports.AuthClient = AuthClient;
exports.AuthClient = AuthClient = AuthClient_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], AuthClient);
//# sourceMappingURL=auth.client.js.map