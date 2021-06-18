import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { ModifyHostComponent } from './modify-host.component';
import { HttpService } from './../../../shared/api';
import { VolumeService } from './../volume.service';
import { ProfileService } from './../../profile/profile.service';
import { AvailabilityZonesService } from './../../resource/resource.service';
import { HostsService } from '../hosts.service';


let routers = [{
  path: '',
  component: ModifyHostComponent
}]

@NgModule({
  imports: [
    RouterModule.forChild(routers),
    SharedModule
  ],
  declarations: [
    ModifyHostComponent
  ],
  providers: [
    HttpService,
    VolumeService,
    ProfileService,
    AvailabilityZonesService,
    HostsService
  ]
})
export class ModifyHostModule { }
