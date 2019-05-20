import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MonitorListComponent } from './monitor-list/monitor-list.component';
import { ConfigComponent } from './config/config.component';
import { MonitorComponent } from './monitor.component';


const routers: Routes = [
  {
    path: '',
    component: MonitorListComponent
    },
    {
        path: 'config',
        component: ConfigComponent,
    },
];

@NgModule({
  imports: [RouterModule.forChild(routers)],
  exports: [RouterModule]
})
export class MonitorRoutingModule { }
