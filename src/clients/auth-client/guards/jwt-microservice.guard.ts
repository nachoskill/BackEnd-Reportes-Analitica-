import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtMicroserviceGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        // Llama a la estrategia JWT de Passport para validar el token
        return super.canActivate(context);
    }
}
