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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnaliticasController = void 0;
const common_1 = require("@nestjs/common");
const analiticas_services_1 = require("./analiticas.services");
let AnaliticasController = class AnaliticasController {
    constructor(analiticasService) {
        this.analiticasService = analiticasService;
    }
    async getEstadoCarritos() {
        return this.analiticasService.getEstadoCarritos();
    }
    async getTendenciaProductos() {
        return this.analiticasService.getTendenciaProductos();
    }
    async getIngresosMensuales() {
        return this.analiticasService.getIngresosMensuales();
    }
    async getEnviosRegional() {
        return this.analiticasService.getEnviosRegional();
    }
    async getKpiIngresos() {
        return this.analiticasService.getKpiIngresos();
    }
    async getKpiMejorRegion() {
        return this.analiticasService.getKpiMejorRegion();
    }
};
exports.AnaliticasController = AnaliticasController;
__decorate([
    (0, common_1.Get)('estadisticas/estado_carrito'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnaliticasController.prototype, "getEstadoCarritos", null);
__decorate([
    (0, common_1.Get)('estadisticas/productos_tendencia'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnaliticasController.prototype, "getTendenciaProductos", null);
__decorate([
    (0, common_1.Get)('venta_productos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnaliticasController.prototype, "getIngresosMensuales", null);
__decorate([
    (0, common_1.Get)('tendencia/regiones'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnaliticasController.prototype, "getEnviosRegional", null);
__decorate([
    (0, common_1.Get)('estadisticas/ingresos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnaliticasController.prototype, "getKpiIngresos", null);
__decorate([
    (0, common_1.Get)('estadisticas/Mejor_Region'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnaliticasController.prototype, "getKpiMejorRegion", null);
exports.AnaliticasController = AnaliticasController = __decorate([
    (0, common_1.Controller)('analiticas'),
    __metadata("design:paramtypes", [analiticas_services_1.AnaliticasService])
], AnaliticasController);
//# sourceMappingURL=analiticas.controller.js.map