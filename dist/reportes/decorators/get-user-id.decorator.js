"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserId = void 0;
const common_1 = require("@nestjs/common");
exports.GetUserId = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    console.log('🔍 [DEBUG] Usuario completo del request:', user);
    return user?.id_usuario || user?.userId || user?.sub;
});
//# sourceMappingURL=get-user-id.decorator.js.map