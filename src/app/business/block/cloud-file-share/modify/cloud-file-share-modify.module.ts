import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { CloudFileShareModifyComponent } from './cloud-file-share-modify.component';

import { RouterModule } from '@angular/router';
import {DataTableModule, DropMenuModule, DialogModule, FormModule, InputTextModule, InputTextareaModule, 
  DropdownModule ,ConfirmationService,ConfirmDialogModule,CalendarModule,CheckboxModule, InputSwitchModule, 
  TableModule,TabViewModule, ButtonModule, SpinnerModule, GrowlModule } from '../../../../components/common/api';
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
    RouterModule,
    CalendarModule,
    CheckboxModule,
    InputSwitchModule,
    TableModule,
    SpinnerModule,
    GrowlModule
  ],
  exports: [ CloudFileShareModifyComponent ],
  providers: [
    HttpService,
    ConfirmationService,
    ProfileService,
    CloudFileShareService
  ]
})
export class CloudFileShareModifyModule { }