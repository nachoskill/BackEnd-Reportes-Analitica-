# Cliente de Autenticación - Método Login

## 📝 Descripción

Se ha agregado el método `login()` al cliente de autenticación (`AuthClient`) que permite autenticarse con el microservicio de autenticación usando credenciales almacenadas en variables de entorno.

## 🔧 Configuración

### Variables de Entorno (.env)

Debes configurar las siguientes variables en tu archivo `.env`:

```bash
# Credenciales para autenticación con el microservicio de Auth
AUTH_SERVICE_EMAIL=admin@example.com
AUTH_SERVICE_PASSWORD=tu_contraseña_aqui
AUTH_SERVICE_RECAPTCHA_TOKEN=dummy-recaptcha-token
```

**Importante**: 
- Reemplaza `tu_contraseña_aqui` con la contraseña real del usuario admin
- El `recaptchaToken` es opcional. Si no se proporciona, se usa `'dummy-token'` por defecto

## 🚀 Uso del Método

### Ejemplo Básico

```typescript
import { AuthClient } from './clients/auth-client/auth.client';

@Injectable()
export class MiServicio {
  constructor(private readonly authClient: AuthClient) {}

  async autenticarseConMicroservicio() {
    try {
      // Realizar login (usa credenciales del .env automáticamente)
      const loginResponse = await this.authClient.login();
      
      // Obtener el token de acceso
      const token = loginResponse.access_token;
      
      console.log('Token obtenido:', token);
      
      // Ahora puedes usar este token para hacer otras peticiones
      const usuarios = await this.authClient.getAllUsers(token);
      
      return { token, usuarios };
    } catch (error) {
      console.error('Error al autenticarse:', error);
      throw error;
    }
  }
}
```

### Respuesta del Login

El método `login()` retorna un objeto `LoginResponseDto` con la siguiente estructura:

```typescript
{
  access_token: string;        // Token JWT de acceso
  token_type?: string;         // Tipo de token (ej: "Bearer")
  expires_in?: number;         // Tiempo de expiración en segundos
  user?: {                     // Información del usuario (opcional)
    id: string;
    correo: string;
    nombre?: string;
    roles?: string[];
  }
}
```

## 📋 Endpoint

**POST** `/auth/login`

### Request Body

```json
{
  "correo": "admin@example.com",
  "contrasena": "tu_contraseña",
  "recaptchaToken": "dummy-recaptcha-token"
}
```

### Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "123",
    "correo": "admin@example.com",
    "nombre": "Admin",
    "roles": ["admin"]
  }
}
```

## 🔐 Seguridad

### Buenas Prácticas

1. **Nunca commitear credenciales reales**: Asegúrate de que `.env` esté en tu `.gitignore`
2. **Usar variables de entorno**: Las credenciales deben estar en `.env`, no hardcodeadas
3. **Rotar credenciales**: Cambia las contraseñas periódicamente
4. **Usar secretos en producción**: En producción, usa un gestor de secretos (AWS Secrets Manager, Azure Key Vault, etc.)

### Ejemplo de .gitignore

```gitignore
# Environment variables
.env
.env.local
.env.production
```

## 🐛 Manejo de Errores

El método `login()` puede lanzar errores en los siguientes casos:

### 1. Credenciales no configuradas

```typescript
Error: Credenciales de autenticación no configuradas en .env (AUTH_SERVICE_EMAIL, AUTH_SERVICE_PASSWORD)
```

**Solución**: Verifica que `AUTH_SERVICE_EMAIL` y `AUTH_SERVICE_PASSWORD` estén en tu `.env`

### 2. Credenciales incorrectas

```typescript
Error: Error al hacer login: Request failed with status code 401
```

**Solución**: Verifica que el correo y contraseña sean correctos

### 3. Servicio no disponible

```typescript
Error: Error al hacer login: connect ECONNREFUSED
```

**Solución**: Verifica que el microservicio de autenticación esté corriendo y la URL sea correcta

## 📊 Logs

El método genera logs informativos:

```
[AuthClient] Iniciando login en el microservicio de autenticación...
[AuthClient] Login exitoso en el microservicio de autenticación
```

En caso de error:

```
[AuthClient] Error al hacer login: Request failed with status code 401
[AuthClient] Status: 401, Data: {"message":"Credenciales inválidas"}
```

## 🔄 Flujo Completo de Autenticación

```typescript
@Injectable()
export class IntegrationService {
  private authToken: string;

  constructor(private readonly authClient: AuthClient) {}

  async inicializarConexion() {
    // 1. Autenticarse con el microservicio
    const loginResponse = await this.authClient.login();
    this.authToken = loginResponse.access_token;
    
    // 2. Usar el token para obtener datos
    const usuarios = await this.authClient.getAllUsers(this.authToken);
    
    // 3. Procesar los datos
    console.log(`Usuarios obtenidos: ${usuarios.length}`);
    
    return usuarios;
  }

  async obtenerDatosProtegidos() {
    // Usar el token guardado para hacer peticiones
    if (!this.authToken) {
      await this.inicializarConexion();
    }
    
    return await this.authClient.getAllUsers(this.authToken);
  }
}
```

## 📝 Notas Adicionales

- El token obtenido debe ser usado en el header `Authorization: Bearer <token>` para las siguientes peticiones
- El token tiene un tiempo de expiración configurado en el microservicio de autenticación
- Considera implementar un mecanismo de refresh token si el microservicio lo soporta
- Para desarrollo local, puedes usar `AUTH_SERVICE_URL=http://localhost:3000/api`

## 🔗 Archivos Relacionados

- **Cliente**: `src/clients/auth-client/auth.client.ts`
- **DTO Response**: `src/clients/auth-client/dto/login-response.dto.ts`
- **DTO User**: `src/clients/auth-client/dto/user.dto.ts`
- **Módulo**: `src/clients/auth-client/auth-client.module.ts`
- **Configuración**: `.env`
