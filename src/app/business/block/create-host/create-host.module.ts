import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { CreateHostComponent } from './create-host.component';
import { HttpService } from './../../../shared/api';
import { VolumeService,ReplicationService } from './../volume.service';
import { ProfileService } from './../../profile/profile.service';
import { AvailabilityZonesService } from './../../resource/resource.service';
import { HostsService } from '../hosts.service';


let routers = [{
  path: '',
  component: CreateHostComponent
}]

@NgModule({
  imports: [
    RouterModule.forChild(routers),
    SharedModule
  ],
  declarations: [
    CreateHostComponent
  ],
  providers: [
    HttpService,
    VolumeService,
    ProfileService,
    ReplicationService,
    AvailabilityZonesService,
    HostsService
  ]
})
export class CreateHostModule { }
