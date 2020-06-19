import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AclComponent } from './acl.component';
import { RouterModule } from '@angular/router';
import {DataTableModule, DropMenuModule, DialogModule, FormModule, InputTextModule, InputTextareaModule, 
  DropdownModule ,ConfirmationService,ConfirmDialogModule,CalendarModule,CheckboxModule, InputSwitchModule, 
  TableModule,TabViewModule,ButtonModule,SpinnerModule, GrowlModule } from '../../../../components/common/api';


import { HttpService } from '../../../../shared/service/Http.service';
import { BucketService } from '../../buckets.service';


@NgModule({
  declarations: [
    AclComponent
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
    RouterModule,
    CalendarModule,
    CheckboxModule,
    InputSwitchModule,
    TableModule,
    SpinnerModule,
    GrowlModule
  ],
  exports: [ AclComponent ],
  providers: [
    HttpService,
    ConfirmationService,
    BucketService
  ]
})
export class AclModule { }