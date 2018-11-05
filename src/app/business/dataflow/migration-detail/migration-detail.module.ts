import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MigrationDetailComponent } from './migration-detail.component';

import { TabViewModule,ButtonModule, DataTableModule, DropMenuModule, DialogModule, FormModule, InputTextModule, InputTextareaModule, ConfirmDialogModule ,ConfirmationService} from './../../../components/common/api';
import { HttpService } from './../../../shared/service/Http.service';
import { MigrationService } from '../migration.service';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    InputTextareaModule,
    TabViewModule,
    ButtonModule,
    DataTableModule,
    DialogModule,
    FormModule,
    ConfirmDialogModule
  ],
  exports: [ MigrationDetailComponent ],
  declarations: [
    MigrationDetailComponent
  ],
  providers: [
    HttpService,
    ConfirmationService,
    MigrationService
  ]
})
export class MigrationDetailModule { }
