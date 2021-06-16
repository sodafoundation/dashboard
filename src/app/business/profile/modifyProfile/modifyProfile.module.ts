import { Component, NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { modifyProfileComponent } from './modifyProfile.component';
import { HttpService } from './../../../shared/api';
import { ProfileService } from './../profile.service';
import { PoolService } from './../pool.service';
import { PoolModule } from './../storage-pools-table/storage-pools-table.module';
import { SharedModule } from '../../../shared/shared.module';
let routers = [{
  path: '',
  component: modifyProfileComponent
}]

@NgModule({
  declarations: [
    modifyProfileComponent
  ],
  imports: [
    RouterModule.forChild(routers),
    SharedModule,
    PoolModule
  ],
  providers: [
    HttpService,
    ProfileService,
    PoolService
  ]
})
export class ModifyProfileModule { }
