import { AuthClient } from '../clients/auth-client/auth.client';
declare class LoginDto {
    email: string;
    password: string;
    recaptchaToken?: string;
}
export declare class AuthController {
    private readonly authClient;
    private readonly logger;
    constructor(authClient: AuthClient);
    login(loginDto: LoginDto): Promise<import("../clients/auth-client/dto/login-response.dto").LoginResponseDto>;
    me(req: any): Promise<import("../clients/auth-client/dto/user.dto").UserDto>;
}
export {};
