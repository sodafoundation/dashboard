import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { HttpService } from '../../../shared/service/Http.service';
import { DelfinService } from '../delfin.service';
import { AvailabilityZonesService } from '../../resource/resource.service';
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
    SharedModule
    ],
  exports: [ PerformanceMonitorComponent ],
  providers: [
    HttpService,
    DelfinService,
    AvailabilityZonesService
  ]
})
export class PerformanceMonitorModule { }
