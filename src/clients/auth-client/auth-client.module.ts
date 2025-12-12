import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthClient } from './auth.client';
import { HttpModule } from '../http/http.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtMicroserviceGuard } from './guards/jwt-microservice.guard';
import { AuthTokenManager } from './auth-token-manager.service';
import { AuthConnectionManager } from './auth-connection-manager.service';
import { UserSyncService } from './user-sync.service';
import { Vendedor, VendedorSchema } from '../../reportes/schemas/vendedores.schema';
import { Cliente, ClienteSchema } from './schemas/clientes.schemas';

@Module({
    imports: [
        HttpModule,
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '24h' },
            }),
        }),
        MongooseModule.forFeature([
            { name: Vendedor.name, schema: VendedorSchema },
            { name: Cliente.name, schema: ClienteSchema },
        ]),
    ],
    providers: [AuthClient, JwtStrategy, JwtMicroserviceGuard, AuthConnectionManager, AuthTokenManager, UserSyncService],
    exports: [AuthClient, JwtMicroserviceGuard, AuthConnectionManager, AuthTokenManager, UserSyncService],
})
export class AuthClientModule { }
