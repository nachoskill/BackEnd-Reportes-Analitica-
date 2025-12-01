import { Module } from '@nestjs/common';
import { InventarioClient } from './inventario.client';
import { HttpModule } from '../http/http.module';

@Module({
    imports: [HttpModule],
    providers: [InventarioClient],
    exports: [InventarioClient],
})
export class InventarioClientModule { }
