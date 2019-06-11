import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { FileShareDetailComponent } from './file-share-detail.component';

import { RouterModule } from '@angular/router';
import { TabViewModule, ButtonModule, DataTableModule, DropMenuModule, DialogModule, FormModule, InputTextModule, InputTextareaModule, DropdownModule , ConfirmationService,ConfirmDialogModule, MultiSelectModule } from '../../../components/common/api';
import { HttpService } from '../../../shared/service/Http.service';
import { FileShareService, SnapshotService ,FileShareAclService } from '../fileShare.service';
import { ProfileService } from '../../profile/profile.service';

let routers = [{
    path: '',
    component: FileShareDetailComponent
}]

@NgModule({
  declarations: [
    FileShareDetailComponent
  ],
  imports: [
    TabViewModule,
    ButtonModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    DataTableModule,
    DropdownModule,
    DropMenuModule,
    DialogModule,
    FormModule,
    ConfirmDialogModule,
    RouterModule.forChild(routers),
    // CalendarModule,
    // CheckboxModule,
    // InputSwitchModule,
    // TableModule,
    MultiSelectModule
  ],
  exports: [ FileShareDetailComponent ],
  providers: [
    HttpService,
    ConfirmationService,
    FileShareService,
    SnapshotService,
    ProfileService,
    FileShareAclService
  ]
})
export class FileShareDetailModule { }