import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { VolumeDetailComponent } from './volume-detail.component';
import { HttpService } from './../../../shared/service/Http.service';
import { VolumeService,SnapshotService ,ReplicationService} from './../volume.service';
import { SnapshotListComponent } from './snapshot-list/snapshot-list.component';
import { AttachmentListComponent } from './attachment-list/attachment-list.component';
import { ReplicationListComponent } from './replication-list/replication-list.component';
import { ProfileService } from './../../profile/profile.service';
import { HostsService } from '../hosts.service';
import { AttachService } from '../attach.service';

let routers = [{
  path: '',
  component: VolumeDetailComponent
}]

@NgModule({
  imports: [
    RouterModule.forChild(routers),
    SharedModule
  ],
  declarations: [
    VolumeDetailComponent,
    SnapshotListComponent,
    AttachmentListComponent,
    ReplicationListComponent
  ],
  providers: [
    HttpService,
    VolumeService,
    SnapshotService,
    ProfileService,
    ReplicationService,
    HostsService,
    AttachService
  ]
})
export class VolumeDetailModule { }
