import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { CloudFileShareCreateComponent } from './cloud-file-share-create.component';
import { HttpService } from '../../../../shared/service/Http.service';
import { AvailabilityZonesService } from '../../../resource/resource.service';
import { ProfileService } from '../../../profile/profile.service';
import { FileShareService } from '../../fileShare.service';
import { CloudFileShareService } from '../cloud-file-share.service';

let routers = [{
    path: '',
    component: CloudFileShareCreateComponent
  }]

@NgModule({
  declarations: [
    CloudFileShareCreateComponent
  ],
  imports: [
    RouterModule.forChild(routers),
    SharedModule
  ],
  exports: [ CloudFileShareCreateComponent ],
  providers: [
    HttpService,
    AvailabilityZonesService,
    ProfileService,
    FileShareService,
    CloudFileShareService
  ]
})
export class CloudFileShareCreateModule { }
