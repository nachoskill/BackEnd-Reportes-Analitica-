import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
export declare class JwtConfig {
    private configService;
    constructor(configService: ConfigService);
    getJwtConfig(): JwtModuleOptions;
}
