import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { VolumeListComponent } from './volumeList.component';
import { ButtonModule, DataTableModule, DropMenuModule, DialogModule, FormModule, InputTextModule, InputTextareaModule, GrowlModule, DropdownModule , ConfirmationService, ConfirmDialogModule, TabViewModule} from '../../components/common/api';

import { HttpService } from './../../shared/service/Http.service';
import {VolumeService, SnapshotService, ReplicationService} from './volume.service';
import { ProfileService } from './../profile/profile.service';
import { AttachService } from './attach.service';
import { RouterModule } from '@angular/router';
import { CloudBlockServiceModule } from './cloud-block-service/cloud-block-service.module';

@NgModule({
  declarations: [ VolumeListComponent ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    GrowlModule,
    DataTableModule,
    DropdownModule,
    DropMenuModule,
    DialogModule,
    FormModule,
    ConfirmDialogModule,
    RouterModule,
    TabViewModule,
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
    ConfirmationService
  ]
})
export class VolumeListModule { }
