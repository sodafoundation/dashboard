import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LifeCycleComponent } from './lifeCycle.component';
import { RouterModule } from '@angular/router';
import {DataTableModule, DropMenuModule, DialogModule, FormModule, InputTextModule, InputTextareaModule, 
  DropdownModule ,ConfirmationService,ConfirmDialogModule,CalendarModule,CheckboxModule, InputSwitchModule, 
  TableModule,TabViewModule, ButtonModule,SpinnerModule } from '../../../../components/common/api';


import { HttpService } from '../../../../shared/service/Http.service';
import { BucketService } from '../../buckets.service';

@NgModule({
  declarations: [
    LifeCycleComponent
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
    SpinnerModule
  ],
  exports: [ LifeCycleComponent ],
  providers: [
    HttpService,
    ConfirmationService,
    BucketService
  ]
})
export class LifeCycleModule { }