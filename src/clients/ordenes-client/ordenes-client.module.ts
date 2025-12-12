import { Module } from '@nestjs/common';
import { OrdenesClient } from './ordenes.client';
import { OrdenesSyncScheduler } from './ordenes-sync.scheduler';
import { OrdenesConnectionManager } from './ordenes-connection-manager.service';
import { HttpModule } from '../http/http.module';
import { AuthClientModule } from '../auth-client/auth-client.module';

@Module({
    imports: [
        HttpModule,
        AuthClientModule, // Para obtener el token admin
    ],
    providers: [OrdenesClient, OrdenesConnectionManager, OrdenesSyncScheduler],
    exports: [OrdenesClient, OrdenesConnectionManager],
})
export class OrdenesClientModule { }
