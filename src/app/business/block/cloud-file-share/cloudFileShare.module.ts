import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ButtonModule, DataTableModule, DropMenuModule, DialogModule, FormModule, InputTextModule, InputTextareaModule, DropdownModule , ConfirmationService,ConfirmDialogModule, MultiSelectModule, GrowlModule } from '../../../components/common/api';
import { HttpService } from '../../../shared/service/Http.service';

import { CloudFileShareComponent } from './cloud-file-share.component';
import { CloudFileShareService} from './cloud-file-share.service';




@NgModule({
  declarations: [ CloudFileShareComponent],
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
    MultiSelectModule,
    GrowlModule
  ],
  exports: [ CloudFileShareComponent],
  providers: [
    HttpService,
    CloudFileShareService,
    ConfirmationService,
  ]
})
export class CloudFileShareModule { }
