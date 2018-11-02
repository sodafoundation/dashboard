import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BucketsComponent } from './buckets.component';
import { RouterModule } from '@angular/router';
import { TabViewModule, ButtonModule } from '../../components/common/api';
import {DataTableModule, DropMenuModule, DialogModule, FormModule, InputTextModule, InputTextareaModule, 
  DropdownModule ,ConfirmationService,ConfirmDialogModule,CalendarModule,CheckboxModule} from '../../components/common/api';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpService } from './../../shared/service/Http.service';
import { BucketService } from './buckets.service';
import { MigrationService } from './../dataflow/migration.service';

@NgModule({
  declarations: [
    BucketsComponent
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
    CheckboxModule
  ],
  exports: [ BucketsComponent ],
  providers: [
    HttpService,
    ConfirmationService,
    BucketService,
    MigrationService
  ]
})
export class BucketsModule { }