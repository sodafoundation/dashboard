import { Component, NgModule, APP_INITIALIZER } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { CreateProfileComponent } from './createProfile.component';
import { RouterModule } from '@angular/router';
import { HttpService } from './../../../shared/api';
import { ProfileService } from './../profile.service';
import { PoolService } from './../pool.service';
import { PoolModule } from './../storage-pools-table/storage-pools-table.module';

let routers = [{
  path: '',
  component: CreateProfileComponent
}]

@NgModule({
  declarations: [
    CreateProfileComponent
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
export class CreateProfileModule { }
