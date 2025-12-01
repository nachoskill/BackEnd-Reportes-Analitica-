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
exports.VendedorSchema = exports.Vendedor = exports.TiendaEmbebidaSchema = exports.TiendaEmbebida = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let TiendaEmbebida = class TiendaEmbebida {
};
exports.TiendaEmbebida = TiendaEmbebida;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], TiendaEmbebida.prototype, "id_tienda", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TiendaEmbebida.prototype, "nombre_tienda", void 0);
exports.TiendaEmbebida = TiendaEmbebida = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], TiendaEmbebida);
exports.TiendaEmbebidaSchema = mongoose_1.SchemaFactory.createForClass(TiendaEmbebida);
let Vendedor = class Vendedor extends mongoose_2.Document {
};
exports.Vendedor = Vendedor;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Vendedor.prototype, "id_vendedor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.TiendaEmbebidaSchema], default: [] }),
    __metadata("design:type", Array)
], Vendedor.prototype, "tiendas", void 0);
exports.Vendedor = Vendedor = __decorate([
    (0, mongoose_1.Schema)({ collection: 'vendedores' })
], Vendedor);
exports.VendedorSchema = mongoose_1.SchemaFactory.createForClass(Vendedor);
//# sourceMappingURL=vendedores.schema.js.map