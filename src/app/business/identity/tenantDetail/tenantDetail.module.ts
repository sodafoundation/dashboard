import { NgModule, APP_INITIALIZER } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { TenantDetailComponent } from './tenantDetail.component';


@NgModule({
  declarations: [ TenantDetailComponent ],
  imports: [ SharedModule ],
  exports: [ TenantDetailComponent ],
  providers: []
})
export class TenantDetailModule { }
