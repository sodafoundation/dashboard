import { NgModule, APP_INITIALIZER } from '@angular/core';
import { ResourceComponent } from './resource.component';
import { RouterModule } from '@angular/router';
import { TabViewModule, ButtonModule } from '../../components/common/api';


import { RegionModule } from './region/region.module';

import { ZoneModule } from './zone/zone.module';

import { StorageModule } from './storage/storage.module';

let routers = [{
  path: '',
  component: ResourceComponent
}]

@NgModule({
  declarations: [
    ResourceComponent
  ],
  imports: [
    RouterModule.forChild(routers),
    TabViewModule,
    ButtonModule,
    RegionModule,
    ZoneModule,
    StorageModule
  ],
  providers: []
})
export class ResourceModule { }