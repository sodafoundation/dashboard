import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ObjectAclComponent } from './object-acl.component';
import { RouterModule } from '@angular/router';
import {DataTableModule, DropMenuModule, DialogModule, FormModule, InputTextModule, InputTextareaModule, 
  DropdownModule ,ConfirmationService,ConfirmDialogModule,CalendarModule,CheckboxModule, InputSwitchModule, 
  TableModule,TabViewModule,ButtonModule,SpinnerModule } from '../../../../components/common/api';


import { HttpService } from '../../../../shared/service/Http.service';
import { BucketService } from '../../buckets.service';

let routers = [{
  path: '',
  component: ObjectAclComponent
}]
@NgModule({
  declarations: [
    ObjectAclComponent
  ],
  imports: [
    TabViewModule,
    ButtonModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    RouterModule.forChild(routers),
    InputTextModule,
    InputTextareaModule,
    DataTableModule,
    DropdownModule,
    DropMenuModule,
    DialogModule,
    FormModule,
    ConfirmDialogModule,
    CalendarModule,
    CheckboxModule,
    InputSwitchModule,
    TableModule,
    SpinnerModule
  ],
  exports: [ ObjectAclComponent ],
  providers: [
    HttpService,
    ConfirmationService,
    BucketService
  ]
})
export class ObjectAclModule { }