/**
 * DTO para la respuesta del login desde el microservicio de autenticación
 */
export class LoginResponseDto {
    /**
     * Token JWT de acceso
     */
    access_token: string;

    /**
     * Tipo de token (generalmente "Bearer")
     */
    token_type?: string;

    /**
     * Tiempo de expiración del token en segundos
     */
    expires_in?: number;

    /**
     * Información del usuario autenticado (opcional)
     */
    user?: {
        id: string;
        correo: string;
        nombre?: string;
        roles?: string[];
    };
}
