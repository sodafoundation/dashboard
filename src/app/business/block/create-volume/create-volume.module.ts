import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { CreateVolumeComponent } from './create-volume.component';
import { ReplicationGroupComponent } from './replication-group/replication-group.component';
import { HttpService } from './../../../shared/api';
import { VolumeService,ReplicationService } from './../volume.service';
import { ProfileService } from './../../profile/profile.service';
import { AvailabilityZonesService } from './../../resource/resource.service';


let routers = [{
  path: '',
  component: CreateVolumeComponent
}]

@NgModule({
  imports: [
    RouterModule.forChild(routers),
    SharedModule
  ],
  declarations: [
    CreateVolumeComponent,
    ReplicationGroupComponent
  ],
  providers: [
    HttpService,
    VolumeService,
    ProfileService,
    ReplicationService,
    AvailabilityZonesService
  ]
})
export class CreateVolumeModule { }
