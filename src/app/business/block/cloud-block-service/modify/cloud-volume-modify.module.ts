import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { CloudVolumeModifyComponent } from './cloud-volume-modify.component';
import { HttpService } from '../../../../shared/service/Http.service';
import { AvailabilityZonesService } from '../../../resource/resource.service';
import { ProfileService } from '../../../profile/profile.service';
import { FileShareService } from '../../fileShare.service';
import { CloudBlockServiceService } from '../cloud-block-service.service';

let routers = [{
    path: '',
    component: CloudVolumeModifyComponent
  }]

@NgModule({
  declarations: [
    CloudVolumeModifyComponent
  ],
  imports: [
    RouterModule.forChild(routers),
    SharedModule
  ],
  exports: [ CloudVolumeModifyComponent ],
  providers: [
    HttpService,
    AvailabilityZonesService,
    ProfileService,
    FileShareService,
    CloudBlockServiceService
  ]
})
export class CloudVolumeModifyModule { }
