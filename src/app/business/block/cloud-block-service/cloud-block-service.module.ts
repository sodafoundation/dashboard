import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ButtonModule, DataTableModule, DropMenuModule, DialogModule, FormModule, InputTextModule, InputTextareaModule, InputSwitchModule, DropdownModule , ConfirmationService,ConfirmDialogModule, MultiSelectModule, GrowlModule } from '../../../components/common/api';
import { TooltipModule } from '../../../components/tooltip/tooltip';
import { HttpService } from '../../../shared/service/Http.service';

import { CloudBlockServiceComponent } from './cloud-block-service.component';
import { CloudBlockServiceService} from './cloud-block-service.service';




@NgModule({
  declarations: [ CloudBlockServiceComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    InputSwitchModule,
    DataTableModule,
    DropdownModule,
    DropMenuModule,
    DialogModule,
    FormModule,
    ConfirmDialogModule,
    RouterModule,
    MultiSelectModule,
    GrowlModule,
    TooltipModule
  ],
  exports: [ CloudBlockServiceComponent],
  providers: [
    HttpService,
    CloudBlockServiceService,
    ConfirmationService,
  ]
})
export class CloudBlockServiceModule { }
