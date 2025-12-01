import { Controller, Post, Get, Body, UseGuards, Request, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AuthClient } from '../clients/auth-client/auth.client';
import { JwtMicroserviceGuard } from '../clients/auth-client/guards/jwt-microservice.guard';

// DTOs para las peticiones del frontend
class LoginDto {
    email: string;
    password: string;
    recaptchaToken?: string;
}

@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);

    constructor(private readonly authClient: AuthClient) { }

    /**
     * Login - Proxy hacia el microservicio de auth
     * POST /api/auth/login
     * Recibe credenciales del frontend y las envía al microservicio de auth
     */
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        try {
            // DEBUG: Ver qué está llegando del frontend
            this.logger.log(`📥 Datos recibidos del frontend: ${JSON.stringify(loginDto)}`);

            // El frontend envía { email, password }
            const { email, password, recaptchaToken } = loginDto;

            this.logger.log(`📧 Email extraído: ${email}`);
            this.logger.log(`🔑 Password extraído: ${password ? '***' : 'undefined'}`);

            if (!email || !password) {
                throw new HttpException(
                    { message: 'Email y contraseña son requeridos' },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Llamar al microservicio de auth con las credenciales del usuario
            const response = await this.authClient.loginWithCredentials(email, password, recaptchaToken);

            return response;
        } catch (error) {
            // Propagar el error del microservicio de auth
            throw new HttpException(
                error.response?.data || { message: 'Error al iniciar sesión' },
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
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
}
