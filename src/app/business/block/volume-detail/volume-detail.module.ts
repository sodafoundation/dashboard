import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VolumeDetailComponent } from './volume-detail.component';
import { DeferModule } from '../../../components/defer/defer';
import { TabViewModule,ButtonModule, DataTableModule,DropdownModule, DropMenuModule, DialogModule, FormModule, GrowlModule, InputTextModule, InputTextareaModule, ConfirmDialogModule ,ConfirmationService,CheckboxModule} from './../../../components/common/api';
import { TooltipModule } from '../../../components/tooltip/tooltip';
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
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    InputTextareaModule,
    RouterModule.forChild(routers),
    TabViewModule,
    ButtonModule,
    DataTableModule,
    DialogModule,
    FormModule,
    GrowlModule,
    ConfirmDialogModule,
    DropdownModule,
    CheckboxModule,
    TooltipModule,
    DropMenuModule,
    DeferModule
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
    ConfirmationService,
    ProfileService,
    ReplicationService,
    HostsService,
    AttachService
  ]
})
export class VolumeDetailModule { }
