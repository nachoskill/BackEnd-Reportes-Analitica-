"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventarioClientModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const inventario_client_1 = require("./inventario.client");
const inventario_sync_services_1 = require("./inventario-sync.services");
const inventario_sync_scheduler_1 = require("./inventario-sync.scheduler");
const http_module_1 = require("../http/http.module");
const auth_client_module_1 = require("../auth-client/auth-client.module");
const vendedores_schema_1 = require("../../reportes/schemas/vendedores.schema");
const productos_schema_1 = require("../../reportes/schemas/productos.schema");
let InventarioClientModule = class InventarioClientModule {
};
exports.InventarioClientModule = InventarioClientModule;
exports.InventarioClientModule = InventarioClientModule = __decorate([
    (0, common_1.Module)({
        imports: [
            http_module_1.HttpModule,
            auth_client_module_1.AuthClientModule,
            mongoose_1.MongooseModule.forFeature([
                { name: vendedores_schema_1.Vendedor.name, schema: vendedores_schema_1.VendedorSchema },
                { name: productos_schema_1.Productos.name, schema: productos_schema_1.ProductosSchema },
            ]),
        ],
        providers: [inventario_client_1.InventarioClient, inventario_sync_services_1.SyncService, inventario_sync_scheduler_1.InventarioSyncScheduler],
        exports: [inventario_client_1.InventarioClient, inventario_sync_services_1.SyncService],
    })
], InventarioClientModule);
//# sourceMappingURL=inventario-client.module.js.map