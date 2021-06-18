import { NgModule, APP_INITIALIZER } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { TenantListComponent } from './tenantList.component';
import { TenantDetailModule } from './tenantDetail/tenantDetail.module';

@NgModule({
  declarations: [ TenantListComponent ],
  imports: [ 
    SharedModule,
    TenantDetailModule 
  ],
  exports: [ TenantListComponent ],
  providers: []
})
export class TenantListModule { }
