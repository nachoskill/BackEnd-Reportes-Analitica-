import { Module } from '@nestjs/common';
import { EnviosClient } from './envios.client';
import { HttpModule } from '../http/http.module';

@Module({
    imports: [HttpModule],
    providers: [EnviosClient],
    exports: [EnviosClient],
})
export class EnviosClientModule { }
