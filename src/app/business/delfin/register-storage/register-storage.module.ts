import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';

import { RegisterStorageComponent } from './register-storage.component';

import { HttpService } from './../../../shared/api';
import { ProfileService } from './../../profile/profile.service';
import { AvailabilityZonesService } from './../../resource/resource.service';
import { DelfinService } from '../delfin.service';

let routers = [{
  path: '',
  component: RegisterStorageComponent
}]

@NgModule({
  imports: [
    RouterModule.forChild(routers),
    SharedModule
  ],
  declarations: [ RegisterStorageComponent ],
  providers: [
    HttpService,
    ProfileService,
    AvailabilityZonesService,
    DelfinService
  ]
})
export class RegisterStorageModule { }
