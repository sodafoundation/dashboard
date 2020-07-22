import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule, DataTableModule, ChartModule, CardModule, TabViewModule, InputTextModule, DropMenuModule, DialogModule,FormModule,MultiSelectModule, GrowlModule ,DropdownModule,InputTextareaModule} from '../../components/common/api';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpService } from './../../shared/service/Http.service';
import { DelfinComponent } from './delfin.component';
import { DelfinService } from './delfin.service';
import { AvailabilityZonesService } from './../resource/resource.service';
import { ConfirmationService,ConfirmDialogModule} from '../../components/common/api';
import { TooltipModule } from '../../components/tooltip/tooltip';
import { StoragesComponent } from './storages/storages.component';
import { TableModule } from '../../components/table/table';
import { DataViewModule } from '../../components/dataview/dataview';
import { StorageVolumesComponent } from './volumes/volumes.component';
import { StoragePoolsComponent } from './storage-pools/storage-pools.component';
const routers: Routes = [{
    path: '',
    component: DelfinComponent
  }
]

@NgModule({
  declarations: [ DelfinComponent, StoragesComponent ],
  imports: [ 
    RouterModule.forChild(routers),
    CommonModule, 
    ButtonModule, 
    TableModule,
    ChartModule,
    DataViewModule,
    DataTableModule, 
    CardModule,
    TabViewModule,
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
  exports: [ DelfinComponent ],
  providers: [
    HttpService,
    DelfinService,
    ConfirmationService,
    AvailabilityZonesService
  ]
})
export class DelfinModule { }
