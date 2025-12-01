export interface UserDto {
    id: string;
    nombre: string;
    apellido: string;
    correo: string;
    rut: string;
    roles: string[];
    permisos: string[];
    foto?: string;
    telefono?: string;
    activo: boolean;
}

export interface AuthMeResponse extends UserDto { }

export interface LoginResponse {
    access_token: string;
    user: UserDto;
}
