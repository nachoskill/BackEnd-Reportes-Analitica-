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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_client_1 = require("../clients/auth-client/auth.client");
const jwt_microservice_guard_1 = require("../clients/auth-client/guards/jwt-microservice.guard");
class LoginDto {
}
let AuthController = AuthController_1 = class AuthController {
    constructor(authClient) {
        this.authClient = authClient;
        this.logger = new common_1.Logger(AuthController_1.name);
    }
    async login(loginDto) {
        try {
            this.logger.log(`📥 Datos recibidos del frontend: ${JSON.stringify(loginDto)}`);
            const { email, password, recaptchaToken } = loginDto;
            this.logger.log(`📧 Email extraído: ${email}`);
            this.logger.log(`🔑 Password extraído: ${password ? '***' : 'undefined'}`);
            if (!email || !password) {
                throw new common_1.HttpException({ message: 'Email y contraseña son requeridos' }, common_1.HttpStatus.BAD_REQUEST);
            }
            const response = await this.authClient.loginWithCredentials(email, password, recaptchaToken);
            return response;
        }
        catch (error) {
            throw new common_1.HttpException(error.response?.data || { message: 'Error al iniciar sesión' }, error.response?.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async me(req) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                throw new common_1.HttpException('No se proporcionó token', common_1.HttpStatus.UNAUTHORIZED);
            }
            const user = await this.authClient.getMe(token);
            return user;
        }
        catch (error) {
            throw new common_1.HttpException(error.response?.data || { message: 'Error al obtener perfil' }, error.response?.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_microservice_guard_1.JwtMicroserviceGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_client_1.AuthClient])
], AuthController);
//# sourceMappingURL=auth.controller.js.map