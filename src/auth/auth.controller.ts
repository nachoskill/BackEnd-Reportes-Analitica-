import { Controller, Post, Get, Body, UseGuards, Request, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AuthClient } from '../clients/auth-client/auth.client';
import { JwtMicroserviceGuard } from '../clients/auth-client/guards/jwt-microservice.guard';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { LoginResponseDto } from '../clients/auth-client/dto/login-response.dto';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// DTOs para las peticiones del frontend
class LoginDto {
    @IsEmail({}, { message: 'El email debe ser válido' })
    @IsNotEmpty({ message: 'El email es requerido' })
    email: string;

    @IsString({ message: 'La contraseña debe ser un string' })
    @IsNotEmpty({ message: 'La contraseña es requerida' })
    password: string;

    @IsOptional()
    @IsString()
    recaptchaToken?: string;
}

@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);
    private readonly baseUrl: string;

    constructor(
        private readonly authClient: AuthClient,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.baseUrl = this.configService.get<string>('AUTH_SERVICE_URL') || 'http://localhost:3000/api';
    }

    /**
     * Me - Obtener perfil del usuario autenticado
     * GET /api/auth/me
     * Requiere token JWT en el header Authorization
     */
    @Get('me')
    @UseGuards(JwtMicroserviceGuard)
    async me(@Request() req) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                throw new HttpException('No se proporcionó token', HttpStatus.UNAUTHORIZED);
            }

            // Llamar al microservicio de auth para obtener el perfil
            const user = await this.authClient.getMe(token);

            return user;
        } catch (error) {
            throw new HttpException(
                error.response?.data || { message: 'Error al obtener perfil' },
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Login - Login para usuarios del frontend
     * POST /api/auth/login
     * Recibe credenciales del usuario (email, password) y las envía al microservicio
     */
    @Post('login')
    async serviceLogin(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
        this.logger.log('🔐 Iniciando login desde frontend...');

        // // DEBUG: Ver qué está llegando en el body
        // console.log('📦 Body completo recibido:', JSON.stringify(loginDto, null, 2));
        // console.log('📦 Tipo de loginDto:', typeof loginDto);
        // console.log('📦 Keys de loginDto:', Object.keys(loginDto));

        const { email, password, recaptchaToken } = loginDto;

        // this.logger.log(`📧 Email: ${email}`);
        // this.logger.log(`📧 Password: ${password}`);

        if (!email || !password) {
            throw new HttpException(
                { message: 'Email y contraseña son requeridos' },
                HttpStatus.BAD_REQUEST
            );
        }

        try {
            // El microservicio espera 'correo' y 'contrasena', no 'email' y 'password'
            const payload = {
                correo: email,
                contrasena: password,
                recaptchaToken: recaptchaToken || 'dummy-token',
            };

            // console.log('📤 Payload enviado al microservicio:', JSON.stringify(payload, null, 2));
            // console.log('🌐 URL del microservicio:', `${this.baseUrl}/auth/login`);

            const response = await firstValueFrom(
                this.httpService.post<LoginResponseDto>(`${this.baseUrl}/auth/login`, payload)
            );

            this.logger.log('✅ Login exitoso en el microservicio de autenticación');

            // Imprimir el data completo para debugging
            // console.log('📦 Data recibida del microservicio:', JSON.stringify(response.data, null, 2));
            // console.log('🔑 Access Token:', response.data.access_token);
            // console.log('👤 Usuario:', response.data.user);

            return response.data;
        } catch (error) {
            this.logger.error(`❌ Error al hacer login: ${error.message}`);

            // Logging detallado del error
            if (error.response) {
                console.log('❌ ERROR COMPLETO:');
                console.log('Status:', error.response.status);
                console.log('Status Text:', error.response.statusText);
                console.log('Data:', JSON.stringify(error.response.data, null, 2));
                console.log('Headers:', error.response.headers);

                this.logger.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
            } else {
                console.log('❌ Error sin response:', error);
            }

            throw new HttpException(
                error.response?.data || { message: 'Error al iniciar sesión' },
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
