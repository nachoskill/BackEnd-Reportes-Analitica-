import { Module } from '@nestjs/common';
import { OrdenesClient } from './ordenes.client';
import { HttpModule } from '../http/http.module';

@Module({
    imports: [HttpModule],
    providers: [OrdenesClient],
    exports: [OrdenesClient],
})
export class OrdenesClientModule { }
