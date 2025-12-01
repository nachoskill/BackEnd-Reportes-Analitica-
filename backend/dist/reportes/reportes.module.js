"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const reportes_controller_1 = require("./reportes.controller");
const reportes_services_1 = require("./reportes.services");
const productos_schema_1 = require("./schemas/productos.schema");
const vendedores_schema_1 = require("./schemas/vendedores.schema");
const filtros_services_1 = require("./filtros.services");
const auth_client_module_1 = require("../clients/auth-client/auth-client.module");
let ReportesModule = class ReportesModule {
};
exports.ReportesModule = ReportesModule;
exports.ReportesModule = ReportesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: productos_schema_1.Productos.name, schema: productos_schema_1.ProductosSchema },
                { name: vendedores_schema_1.Vendedor.name, schema: vendedores_schema_1.VendedorSchema }
            ]),
            auth_client_module_1.AuthClientModule,
        ],
        controllers: [reportes_controller_1.ReportesController],
        providers: [reportes_services_1.ReportesService, filtros_services_1.FiltrosService],
    })
], ReportesModule);
//# sourceMappingURL=reportes.module.js.map