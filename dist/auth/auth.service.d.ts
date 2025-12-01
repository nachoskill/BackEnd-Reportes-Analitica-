import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<any>;
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
    me(userId: string): Promise<import("../users/schemas/user.schema").User>;
}
