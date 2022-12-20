import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { HttpService } from './../../../shared/service/Http.service';
import { VolumeService,VolumeGroupService} from './../volume.service';
import { ProfileService } from './../../profile/profile.service';
import { VolumeGroupDetailComponent } from './volume-group-detail.component';

let routers = [{
  path: '',
  component: VolumeGroupDetailComponent
}]
@NgModule({
  imports: [
    RouterModule.forChild(routers),
    SharedModule
  ],
  declarations: [VolumeGroupDetailComponent],
  providers: [
    HttpService,
    VolumeService,
    ProfileService,
    VolumeGroupService
  ]
})
export class VolumeGroupDetailModule { }
