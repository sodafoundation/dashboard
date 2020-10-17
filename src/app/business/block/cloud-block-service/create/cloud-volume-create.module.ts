import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { CloudVolumeCreateComponent } from './cloud-volume-create.component';

import { RouterModule } from '@angular/router';
import {DataTableModule, DropMenuModule, DialogModule, FormModule, InputTextModule, InputTextareaModule, 
  DropdownModule ,ConfirmationService,ConfirmDialogModule,CalendarModule,CheckboxModule, InputSwitchModule, 
  TableModule,TabViewModule, ButtonModule, SpinnerModule, GrowlModule } from '../../../../components/common/api';
import { HttpService } from '../../../../shared/service/Http.service';
import { AvailabilityZonesService } from '../../../resource/resource.service';
import { ProfileService } from '../../../profile/profile.service';
import { FileShareService } from '../../fileShare.service';
import { CloudBlockServiceService } from '../cloud-block-service.service';

let routers = [{
    path: '',
    component: CloudVolumeCreateComponent
  }]

@NgModule({
  declarations: [
    CloudVolumeCreateComponent
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
  exports: [ CloudVolumeCreateComponent ],
  providers: [
    HttpService,
    ConfirmationService,
    AvailabilityZonesService,
    ProfileService,
    FileShareService,
    CloudBlockServiceService
  ]
})
export class CloudVolumeCreateModule { }