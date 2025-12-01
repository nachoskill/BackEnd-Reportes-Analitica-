import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        user: {
            id: any;
            email: any;
            name: any;
            lastName: any;
            role: any;
        };
        access_token: string;
    }>;
    register(registerDto: RegisterDto): Promise<{
        user: {
            id: any;
            email: any;
            name: any;
            lastName: any;
            role: any;
        };
        access_token: string;
    }>;
    getProfile(req: any): Promise<import("../users/schemas/user.schema").User>;
}
