import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { CloudFileShareCreateComponent } from './cloud-file-share-create.component';

import { RouterModule } from '@angular/router';
import {
    DataTableModule, DropMenuModule, DialogModule, FormModule, InputTextModule, InputTextareaModule,
    DropdownModule, MultiSelectModule, ConfirmationService, ConfirmDialogModule, CalendarModule, CheckboxModule, InputSwitchModule,
    TableModule, TabViewModule, ButtonModule, SpinnerModule, GrowlModule, RadioButtonModule
} from '../../../../components/common/api';
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
    MultiSelectModule,
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
    GrowlModule,
    RadioButtonModule
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
