import { NgModule } from '@angular/core';
import { Routes, RouterModule, NavigationExtras } from '@angular/router';
import {CreateInstanceComponent} from './create-instance/create-instance.component';
import { InstanceListComponent } from './instance-list/instance-list.component';
import { ServicesListComponent } from './services-list/services-list.component';
import { ServicesComponent } from './services.component';

const routers: Routes = [
    {
        path: '',
        component: ServicesListComponent
    },
    {
        path: 'createInstance',
        component: CreateInstanceComponent,
    },
    {
        path: 'instanceList',
        component: InstanceListComponent,
    },
    ];
  
@NgModule({
    imports: [
      RouterModule.forChild(routers)
    ],
    exports: [
      RouterModule
    ]
  })
  export class ServicesRoutingModule {}