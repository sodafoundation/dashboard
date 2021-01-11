import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule, DataTableModule, PanelModule, OverlayPanelModule,  ChartModule, CardModule, TabViewModule, InputTextModule, InputSwitchModule, DropMenuModule, DialogModule,FormModule,MultiSelectModule, GrowlModule ,DropdownModule,InputTextareaModule} from '../../../components/common/api';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpService } from '../../../shared/service/Http.service';
import { DelfinService } from '../delfin.service';
import { AvailabilityZonesService } from '../../infrastructure/infrastructure.service';
import { ConfirmationService,ConfirmDialogModule} from '../../../components/common/api';
import { TooltipModule } from '../../../components/tooltip/tooltip';
import { StoragesComponent } from '../storages/storages.component';
import { PerformanceMonitorComponent, SafePipe } from './performance-monitor.component';
const routers: Routes = [{
    path: '',
    component: PerformanceMonitorComponent
  }
]

@NgModule({
  declarations: [ PerformanceMonitorComponent, SafePipe],
  imports: [ 
    RouterModule.forChild(routers),
    CommonModule, 
    ButtonModule, 
    ChartModule,
    DataTableModule,
    PanelModule, 
    OverlayPanelModule,
    CardModule,
    TabViewModule,
    InputTextModule, 
    InputSwitchModule,
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
    ],
  exports: [ PerformanceMonitorComponent ],
  providers: [
    HttpService,
    DelfinService,
    ConfirmationService,
    AvailabilityZonesService
  ]
})
export class PerformanceMonitorModule { }
