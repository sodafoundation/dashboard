import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MigrationListComponent } from './migration.component';
import { ButtonModule, DataTableModule, DropMenuModule, DialogModule, FormModule, InputTextModule, InputTextareaModule, DropdownModule
   ,ConfirmationService,ConfirmDialogModule,CheckboxModule,CalendarModule, GrowlModule} from '../../components/common/api';

import { HttpService } from './../../shared/service/Http.service';
import { RouterModule } from '@angular/router';
import { MigrationDetailModule } from './migration-detail/migration-detail.module';
import { MigrationService } from './migration.service';
import { BucketService } from './../block/buckets.service';

@NgModule({
  declarations: [ MigrationListComponent ],
  imports: [
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
    MigrationDetailModule,
    CheckboxModule,
    CalendarModule,
    GrowlModule
  ],
  exports: [ MigrationListComponent ],
  providers: [
    HttpService,
    ConfirmationService,
    MigrationService,
    BucketService
  ]
})
export class MigrationModule { }
