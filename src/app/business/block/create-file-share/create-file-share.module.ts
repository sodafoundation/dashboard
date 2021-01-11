import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { CreateFileShareComponent } from './create-file-share.component';

import { RouterModule } from '@angular/router';
import {DataTableModule, DropMenuModule, DialogModule, FormModule, InputTextModule, InputTextareaModule, 
  DropdownModule ,ConfirmationService,ConfirmDialogModule,CalendarModule,CheckboxModule, InputSwitchModule, 
  TableModule,TabViewModule, ButtonModule, SpinnerModule } from '../../../components/common/api';
import { HttpService } from '../../../shared/service/Http.service';
import { AvailabilityZonesService } from '../../infrastructure/infrastructure.service';
import { ProfileService } from './../../profile/profile.service';
import { FileShareService } from '../fileShare.service';

let routers = [{
    path: '',
    component: CreateFileShareComponent
  }]

@NgModule({
  declarations: [
    CreateFileShareComponent
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
  exports: [ CreateFileShareComponent ],
  providers: [
    HttpService,
    ConfirmationService,
    AvailabilityZonesService,
    ProfileService,
    FileShareService
  ]
})
export class CreateFileShareModule { }