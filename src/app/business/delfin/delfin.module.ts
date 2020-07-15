import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule, DataTableModule, InputTextModule, DropMenuModule, DialogModule,FormModule,MultiSelectModule, GrowlModule ,DropdownModule,InputTextareaModule} from '../../components/common/api';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpService } from './../../shared/service/Http.service';
import { DelfinComponent } from './delfin.component';
import { DelfinService } from './delfin.service';
import { AvailabilityZonesService } from './../resource/resource.service';
import { ConfirmationService,ConfirmDialogModule} from '../../components/common/api';
import { TooltipModule } from '../../components/tooltip/tooltip';
import { StoragesComponent } from './storages/storages.component';
import { TableModule } from '../../components/table/table';

let routers = [{
    path: '',
    component: DelfinComponent
  }]

@NgModule({
  declarations: [ DelfinComponent, StoragesComponent ],
  imports: [ 
    RouterModule.forChild(routers),
    CommonModule, 
    ButtonModule, 
    TableModule,
    DataTableModule, 
    InputTextModule, 
    DropMenuModule, 
    DialogModule,
    FormModule,
    MultiSelectModule, 
    GrowlModule,
    DropdownModule,
    ReactiveFormsModule,
    FormsModule,
    ConfirmDialogModule,
    InputTextareaModule,
    TooltipModule
    ],
  exports: [ ],
  providers: [
    HttpService,
    DelfinService,
    ConfirmationService,
    AvailabilityZonesService
  ]
})
export class DelfinModule { }
