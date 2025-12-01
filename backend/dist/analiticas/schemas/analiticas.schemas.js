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
exports.EnvioSchema = exports.PagoSchema = exports.CarritoSchema = exports.ProductoSchema = exports.Envio = exports.Pago = exports.Carrito = exports.Producto = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Producto = class Producto {
};
exports.Producto = Producto;
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }),
    __metadata("design:type", Number)
], Producto.prototype, "id_producto", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Producto.prototype, "nombre", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Producto.prototype, "precio", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Producto.prototype, "categoria", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Producto.prototype, "cantidad", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Producto.prototype, "veces_vendido", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Producto.prototype, "veces_buscado", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Producto.prototype, "fecha_creacion", void 0);
exports.Producto = Producto = __decorate([
    (0, mongoose_1.Schema)({ collection: 'productos', _id: false })
], Producto);
let Carrito = class Carrito {
};
exports.Carrito = Carrito;
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }),
    __metadata("design:type", Number)
], Carrito.prototype, "_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], required: true }),
    __metadata("design:type", Array)
], Carrito.prototype, "items", void 0);
exports.Carrito = Carrito = __decorate([
    (0, mongoose_1.Schema)({ collection: 'carritos', _id: false })
], Carrito);
let Pago = class Pago {
};
exports.Pago = Pago;
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, index: true }),
    __metadata("design:type", Number)
], Pago.prototype, "id_carrito", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Pago.prototype, "estado", void 0);
exports.Pago = Pago = __decorate([
    (0, mongoose_1.Schema)({ collection: 'pagos' })
], Pago);
let Envio = class Envio {
};
exports.Envio = Envio;
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Envio.prototype, "id_envio", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Envio.prototype, "id_carrito", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Envio.prototype, "id_usuario", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Envio.prototype, "region", void 0);
exports.Envio = Envio = __decorate([
    (0, mongoose_1.Schema)({ collection: 'envios' })
], Envio);
exports.ProductoSchema = mongoose_1.SchemaFactory.createForClass(Producto);
exports.CarritoSchema = mongoose_1.SchemaFactory.createForClass(Carrito);
exports.PagoSchema = mongoose_1.SchemaFactory.createForClass(Pago);
exports.EnvioSchema = mongoose_1.SchemaFactory.createForClass(Envio);
//# sourceMappingURL=analiticas.schemas.js.map