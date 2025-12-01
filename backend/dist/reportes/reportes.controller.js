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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportesController = void 0;
const common_1 = require("@nestjs/common");
const reportes_services_1 = require("./reportes.services");
const filtro_reporte_dto_1 = require("./schemas/dto/filtro-reporte.dto");
const paginacion_dto_1 = require("./schemas/dto/paginacion.dto");
const jwt_microservice_guard_1 = require("../clients/auth-client/guards/jwt-microservice.guard");
const get_user_id_decorator_1 = require("./decorators/get-user-id.decorator");
const common_2 = require("@nestjs/common");
let ReportesController = class ReportesController {
    constructor(reportesService) {
        this.reportesService = reportesService;
    }
    async obtenerTiendasVendedor(id_usuario) {
        console.log('🔑 [JWT] ID Usuario extraído del token:', id_usuario);
        return this.reportesService.obtenerTiendasVendedor(id_usuario);
    }
    async obtenerDatos(id_usuario, paginacionDto) {
        console.log('🔑 [JWT] ID Usuario extraído del token:', id_usuario);
        console.log('📄 [Paginación] Parámetros recibidos:', paginacionDto);
        return this.reportesService.obtenerDatos(id_usuario, paginacionDto);
    }
    async obtenerDatosConFiltros(filtros) {
        return this.reportesService.obtenerDatosConFiltros(filtros);
    }
    async generarReportePDF(filtros, res) {
        return this.reportesService.generarReportePDF(filtros, res);
    }
};
exports.ReportesController = ReportesController;
__decorate([
    (0, common_1.UseGuards)(jwt_microservice_guard_1.JwtMicroserviceGuard),
    (0, common_1.Get)('vendedor/tiendas'),
    __param(0, (0, get_user_id_decorator_1.GetUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReportesController.prototype, "obtenerTiendasVendedor", null);
__decorate([
    (0, common_1.UseGuards)(jwt_microservice_guard_1.JwtMicroserviceGuard),
    (0, common_1.Get)('productos'),
    __param(0, (0, get_user_id_decorator_1.GetUserId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, paginacion_dto_1.PaginacionDto]),
    __metadata("design:returntype", Promise)
], ReportesController.prototype, "obtenerDatos", null);
__decorate([
    (0, common_1.UseGuards)(jwt_microservice_guard_1.JwtMicroserviceGuard),
    (0, common_1.Get)('productos/filtrados'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filtro_reporte_dto_1.FiltroReporteDto]),
    __metadata("design:returntype", Promise)
], ReportesController.prototype, "obtenerDatosConFiltros", null);
__decorate([
    (0, common_1.UseGuards)(jwt_microservice_guard_1.JwtMicroserviceGuard),
    (0, common_1.Get)('productos/pdf'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_2.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filtro_reporte_dto_1.FiltroReporteDto, Object]),
    __metadata("design:returntype", Promise)
], ReportesController.prototype, "generarReportePDF", null);
exports.ReportesController = ReportesController = __decorate([
    (0, common_1.Controller)('reportes'),
    __metadata("design:paramtypes", [reportes_services_1.ReportesService])
], ReportesController);
//# sourceMappingURL=reportes.controller.js.map