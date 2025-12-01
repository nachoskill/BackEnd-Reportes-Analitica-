"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FiltrosService = void 0;
const common_1 = require("@nestjs/common");
let FiltrosService = class FiltrosService {
    construirQuery(filtros, prefijo = '') {
        const query = {};
        const getKey = (campo) => prefijo ? `${prefijo}.${campo}` : campo;
        if (filtros.nombre) {
            query[getKey('nombre')] = { $regex: new RegExp(filtros.nombre, 'i') };
        }
        if (filtros.categoria) {
            const categorias = filtros.categoria.split(',').map(cat => cat.trim());
            const regexCategorias = categorias.map(c => new RegExp(c, 'i'));
            query[getKey('categoria')] = { $in: regexCategorias };
        }
        if (filtros.minPrecio !== undefined || filtros.maxPrecio !== undefined) {
            const keyPrecio = getKey('precio');
            query[keyPrecio] = {};
            if (filtros.minPrecio !== undefined)
                query[keyPrecio].$gte = filtros.minPrecio;
            if (filtros.maxPrecio !== undefined)
                query[keyPrecio].$lte = filtros.maxPrecio;
        }
        const sort = {};
        const campoOrden = filtros.ordenarPor || 'precio';
        sort[getKey(campoOrden)] = filtros.orden === 'desc' ? -1 : 1;
        return { query, sort };
    }
};
exports.FiltrosService = FiltrosService;
exports.FiltrosService = FiltrosService = __decorate([
    (0, common_1.Injectable)()
], FiltrosService);
//# sourceMappingURL=filtros.services.js.map