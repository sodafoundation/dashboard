import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VolumeListComponent } from './volumeList.component';
import { HttpService } from './../../shared/service/Http.service';
import { VolumeService, SnapshotService, ReplicationService} from './volume.service';
import { ProfileService } from './../profile/profile.service';
import { AttachService } from './attach.service';

import { CloudBlockServiceModule } from './cloud-block-service/cloud-block-service.module';
import { SharedModule } from '../../shared/shared.module'

@NgModule({
  declarations: [ VolumeListComponent ],
  imports: [
    RouterModule,
    SharedModule,
    CloudBlockServiceModule
  ],
  exports: [ VolumeListComponent ],
  providers: [
    HttpService,
    VolumeService,
    SnapshotService,
    ProfileService,
    AttachService,
    ReplicationService,
  ]
})
export class VolumeListModule { }
