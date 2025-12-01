"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnaliticasModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const analiticas_controller_1 = require("./analiticas.controller");
const analiticas_services_1 = require("./analiticas.services");
const analiticas_schemas_1 = require("./schemas/analiticas.schemas");
let AnaliticasModule = class AnaliticasModule {
};
exports.AnaliticasModule = AnaliticasModule;
exports.AnaliticasModule = AnaliticasModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: analiticas_schemas_1.Pago.name, schema: analiticas_schemas_1.PagoSchema },
                { name: analiticas_schemas_1.Carrito.name, schema: analiticas_schemas_1.CarritoSchema },
                { name: analiticas_schemas_1.Producto.name, schema: analiticas_schemas_1.ProductoSchema },
                { name: analiticas_schemas_1.Envio.name, schema: analiticas_schemas_1.EnvioSchema },
            ]),
        ],
        controllers: [analiticas_controller_1.AnaliticasController],
        providers: [analiticas_services_1.AnaliticasService],
    })
], AnaliticasModule);
//# sourceMappingURL=analiticas.module.js.map