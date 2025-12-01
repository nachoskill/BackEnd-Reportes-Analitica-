import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { UserDto } from './dto/user.dto';
export declare class AuthClient {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    constructor(httpService: HttpService, configService: ConfigService);
    getAllUsers(token: string): Promise<UserDto[]>;
    getUsersByRole(role: string, token: string): Promise<UserDto[]>;
    getMe(token: string): Promise<UserDto>;
    getUserById(userId: string, token: string): Promise<UserDto>;
    userHasPermission(userId: string, permission: string, token: string): Promise<boolean>;
}
