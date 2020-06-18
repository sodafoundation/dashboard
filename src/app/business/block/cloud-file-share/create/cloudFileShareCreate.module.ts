import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { CloudFileShareCreateComponent } from './cloudFileShareCreate.component';

import { RouterModule } from '@angular/router';
import {DataTableModule, DropMenuModule, DialogModule, FormModule, InputTextModule, InputTextareaModule, 
  DropdownModule ,ConfirmationService,ConfirmDialogModule,CalendarModule,CheckboxModule, InputSwitchModule, 
  TableModule,TabViewModule, ButtonModule, SpinnerModule } from '../../../../components/common/api';
import { HttpService } from '../../../../shared/service/Http.service';
import { AvailabilityZonesService } from '../../../resource/resource.service';
import { ProfileService } from '../../../profile/profile.service';
import { FileShareService } from '../../fileShare.service';
import { CloudFileShareService } from '../cloudFileShare.service';

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
    SpinnerModule
  ],
  exports: [ CloudFileShareCreateComponent ],
  providers: [
    HttpService,
    ConfirmationService,
    AvailabilityZonesService,
    ProfileService,
    FileShareService,
    CloudFileShareService
  ]
})
export class CloudFileShareCreateModule { }