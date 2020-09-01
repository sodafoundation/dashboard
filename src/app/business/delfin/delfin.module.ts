import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule, DataTableModule, PanelModule, OverlayPanelModule,  ChartModule, CardModule, TabViewModule, InputTextModule, DropMenuModule, DialogModule,FormModule,MultiSelectModule, GrowlModule ,DropdownModule,InputTextareaModule} from '../../components/common/api';
import { ScrollPanelModule } from '../../components/scrollpanel/scrollpanel';
import { DataScrollerModule } from '../../components/datascroller/datascroller';
import { TreeModule } from '../../components/tree/tree';
import { ProgressBarModule } from '../../components/progressbar/progressbar';
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
import { FieldsetModule } from '../../components/fieldset/fieldset'

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
    FieldsetModule,
    DataViewModule,
    DataTableModule,
    PanelModule, 
    OverlayPanelModule,
    ScrollPanelModule,
    DataScrollerModule,
    TreeModule,
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
    TooltipModule,
    ProgressBarModule
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
