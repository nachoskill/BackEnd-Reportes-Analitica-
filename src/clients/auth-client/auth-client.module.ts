import { Module } from '@nestjs/common';
import { AuthClient } from './auth.client';
import { HttpModule } from '../http/http.module';

@Module({
    imports: [HttpModule],
    providers: [AuthClient],
    exports: [AuthClient],
})
export class AuthClientModule { }
