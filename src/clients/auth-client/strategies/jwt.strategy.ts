import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }

    async validate(payload: any) {
        // El payload viene del token JWT generado por auth-microservice
        // Estructura: { correo, sub, roles, permisos }
        return {
            userId: payload.sub,
            correo: payload.correo,
            roles: payload.roles,
            permisos: payload.permisos,
            sub: payload.sub, // Para compatibilidad con @GetUserId decorator
        };
    }
}
