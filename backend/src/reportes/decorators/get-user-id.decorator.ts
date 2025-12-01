import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUserId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): number => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        // El JWT guard ya habrá validado y adjuntado el usuario al request
        // Prioridad: id_usuario (numérico) > userId (ObjectId) > sub (fallback)
        console.log('🔍 [DEBUG] Usuario completo del request:', user);
        return user?.id_usuario || user?.userId || user?.sub;
    },
);
