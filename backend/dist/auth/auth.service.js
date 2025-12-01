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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async validateUser(email, password) {
        const user = await this.usersService.findByEmail(email);
        if (user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user.toObject();
            return result;
        }
        return null;
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const userId = user.id || user._id?.toString();
        const payload = {
            email: user.email,
            sub: userId,
            id_usuario: user.id_usuario,
            role: user.role
        };
        return {
            user: {
                id: userId,
                email: user.email,
                name: user.name,
                lastName: user.lastName,
                role: user.role,
            },
            access_token: this.jwtService.sign(payload),
        };
    }
    async register(registerDto) {
        const createUserDto = {
            name: registerDto.name,
            lastName: registerDto.lastName,
            email: registerDto.email,
            password: registerDto.password,
        };
        const newUser = await this.usersService.create(createUserDto);
        const user = newUser.toObject ? newUser.toObject() : newUser;
        const userId = user.id || user._id?.toString();
        const payload = {
            email: user.email,
            sub: userId,
            id_usuario: user.id_usuario,
            role: user.role,
        };
        return {
            user: {
                id: userId,
                email: user.email,
                name: user.name,
                lastName: user.lastName,
                role: user.role,
            },
            access_token: this.jwtService.sign(payload),
        };
    }
    async me(userId) {
        return this.usersService.findOne(userId);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map