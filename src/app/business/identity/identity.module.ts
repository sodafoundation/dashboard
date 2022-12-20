import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { IdentityComponent } from './identity.component';
import { TenantListModule } from './tenantList.module';
import { UserListModule } from './userList.module';

let routers = [{
  path: '',
  component: IdentityComponent
}]

@NgModule({
  declarations: [
    IdentityComponent
  ],
  imports: [
    RouterModule.forChild(routers),
    SharedModule,
    TenantListModule,
    UserListModule
  ],
  providers: []
})
export class IdentityModule { }
