export interface UserDto {
    id: string;
    nombre: string;
    apellido: string;
    correo: string;
    telefono?: string | null;
    rut: string;
    roles: string[];
    permisos: string[];
    activo: boolean;
    foto?: string | null;
    creado_en: Date;
    actualizado_en: Date;
}