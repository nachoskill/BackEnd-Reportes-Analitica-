import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { UserDto } from './dto/user.dto';

/**
 * Cliente para el microservicio de Autenticación y Perfiles
 * Maneja todas las comunicaciones con el servicio de auth
 */
@Injectable()
export class AuthClient {
    private readonly logger = new Logger(AuthClient.name);
    private readonly baseUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.baseUrl = this.configService.get<string>('AUTH_SERVICE_URL') || 'http://localhost:3000';
    }

    /**
     * Obtiene todos los usuarios del sistema
     * @param token - JWT token de autenticación
     */
    async getAllUsers(token: string): Promise<UserDto[]> {
        this.logger.log('Obteniendo todos los usuarios...');

        try {
            const response = await firstValueFrom(
                this.httpService.get<UserDto[]>(`${this.baseUrl}/api/auth/users`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            );

            this.logger.log(`Obtenidos ${response.data.length} usuarios`);
            return response.data;
        } catch (error) {
            this.logger.error(`Error al obtener usuarios: ${error.message}`);
            throw error;
        }
    }

    /**
     * Obtiene usuarios filtrados por rol
     * @param role - Rol a filtrar (ej: 'vendedor', 'admin')
     * @param token - JWT token de autenticación
     */
    async getUsersByRole(role: string, token: string): Promise<UserDto[]> {
        this.logger.log(`Obteniendo usuarios con rol: ${role}`);

        const allUsers = await this.getAllUsers(token);
        const filteredUsers = allUsers.filter(user => user.roles.includes(role));

        this.logger.log(`Encontrados ${filteredUsers.length} usuarios con rol ${role}`);
        return filteredUsers;
    }

    /**
     * Obtiene el perfil del usuario autenticado
     * @param token - JWT token de autenticación
     */
    async getMe(token: string): Promise<UserDto> {
        this.logger.log('Obteniendo perfil del usuario actual...');

        try {
            const response = await firstValueFrom(
                this.httpService.get<UserDto>(`${this.baseUrl}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            );

            this.logger.log(`Perfil obtenido: ${response.data.correo}`);
            return response.data;
        } catch (error) {
            this.logger.error(`Error al obtener perfil: ${error.message}`);
            throw error;
        }
    }

    /**
     * Obtiene un usuario por su ID
     * @param userId - ID del usuario
     * @param token - JWT token de autenticación
     */
    async getUserById(userId: string, token: string): Promise<UserDto> {
        this.logger.log(`Obteniendo usuario con ID: ${userId}`);

        try {
            const response = await firstValueFrom(
                this.httpService.get<UserDto>(`${this.baseUrl}/api/auth/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            );

            return response.data;
        } catch (error) {
            this.logger.error(`Error al obtener usuario ${userId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Verifica si un usuario tiene un permiso específico
     * @param userId - ID del usuario
     * @param permission - Permiso a verificar
     * @param token - JWT token de autenticación
     */
    async userHasPermission(userId: string, permission: string, token: string): Promise<boolean> {
        const user = await this.getUserById(userId, token);
        return user.permisos?.includes(permission) || false;
    }
}
