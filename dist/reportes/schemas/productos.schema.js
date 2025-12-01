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
exports.ProductosSchema = exports.Productos = exports.ProductoEmbebidoSchema = exports.ProductoEmbebido = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ProductoEmbebido = class ProductoEmbebido {
};
exports.ProductoEmbebido = ProductoEmbebido;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], ProductoEmbebido.prototype, "id_producto", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ProductoEmbebido.prototype, "nombre", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ProductoEmbebido.prototype, "categoria", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], ProductoEmbebido.prototype, "precio", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], ProductoEmbebido.prototype, "cantidad", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], ProductoEmbebido.prototype, "veces_vendido", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], ProductoEmbebido.prototype, "veces_buscado", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], ProductoEmbebido.prototype, "fecha_creacion", void 0);
exports.ProductoEmbebido = ProductoEmbebido = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ProductoEmbebido);
exports.ProductoEmbebidoSchema = mongoose_1.SchemaFactory.createForClass(ProductoEmbebido);
let Productos = class Productos extends mongoose_2.Document {
};
exports.Productos = Productos;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", Number)
], Productos.prototype, "id_tienda", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.ProductoEmbebidoSchema], default: [] }),
    __metadata("design:type", Array)
], Productos.prototype, "productos", void 0);
exports.Productos = Productos = __decorate([
    (0, mongoose_1.Schema)({ collection: 'productos' })
], Productos);
exports.ProductosSchema = mongoose_1.SchemaFactory.createForClass(Productos);
//# sourceMappingURL=productos.schema.js.map