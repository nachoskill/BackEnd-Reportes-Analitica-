import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ReportesModule } from './reportes/reportes.module';
import { AnaliticasModule } from './analiticas/analiticas.module';
//import { report } from 'process';

@Module({
  imports: [
    // Carga y valida las variables de entorno
    ConfigModule.forRoot({
      isGlobal: true, // Disponible en toda la aplicación
    }),

    // Conexión a MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),

    // Módulos de la aplicación
    AuthModule,
    UsersModule,
    ReportesModule,
    AnaliticasModule,
  ],
})
export class AppModule { }