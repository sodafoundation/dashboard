import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { CloudFileShareModifyComponent } from './cloud-file-share-modify.component';

import { HttpService } from '../../../../shared/service/Http.service';
import { ProfileService } from '../../../profile/profile.service';
import { CloudFileShareService } from '../cloud-file-share.service';

let routers = [{
    path: '',
    component: CloudFileShareModifyComponent
  }]

@NgModule({
  declarations: [
    CloudFileShareModifyComponent
  ],
  imports: [
    RouterModule.forChild(routers),
    SharedModule
  ],
  exports: [ CloudFileShareModifyComponent ],
  providers: [
    HttpService,
    ProfileService,
    CloudFileShareService
  ]
})
export class CloudFileShareModifyModule { }
