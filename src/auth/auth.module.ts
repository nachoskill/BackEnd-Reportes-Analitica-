import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthClientModule } from '../clients/auth-client/auth-client.module';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
        AuthClientModule,
        HttpModule,
    ],
    controllers: [AuthController],
})
export class AuthModule { }
