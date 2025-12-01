"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthClientModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const auth_client_1 = require("./auth.client");
const http_module_1 = require("../http/http.module");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const jwt_microservice_guard_1 = require("./guards/jwt-microservice.guard");
const auth_token_manager_service_1 = require("./auth-token-manager.service");
const user_sync_service_1 = require("./user-sync.service");
const vendedores_schema_1 = require("../../reportes/schemas/vendedores.schema");
const clientes_schemas_1 = require("./schemas/clientes.schemas");
let AuthClientModule = class AuthClientModule {
};
exports.AuthClientModule = AuthClientModule;
exports.AuthClientModule = AuthClientModule = __decorate([
    (0, common_1.Module)({
        imports: [
            http_module_1.HttpModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: { expiresIn: '24h' },
                }),
            }),
            mongoose_1.MongooseModule.forFeature([
                { name: vendedores_schema_1.Vendedor.name, schema: vendedores_schema_1.VendedorSchema },
                { name: clientes_schemas_1.Cliente.name, schema: clientes_schemas_1.ClienteSchema },
            ]),
        ],
        providers: [auth_client_1.AuthClient, jwt_strategy_1.JwtStrategy, jwt_microservice_guard_1.JwtMicroserviceGuard, auth_token_manager_service_1.AuthTokenManager, user_sync_service_1.UserSyncService],
        exports: [auth_client_1.AuthClient, jwt_microservice_guard_1.JwtMicroserviceGuard, auth_token_manager_service_1.AuthTokenManager, user_sync_service_1.UserSyncService],
    })
], AuthClientModule);
//# sourceMappingURL=auth-client.module.js.map