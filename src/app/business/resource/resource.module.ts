import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourceComponent } from './resource.component';
import { RouterModule } from '@angular/router';
import { TabViewModule, ButtonModule, DataTableModule, InputTextModule } from './../../components/common/api';

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
    CommonModule,
    TabViewModule,
    ButtonModule,
    DataTableModule,
    InputTextModule
  ],
  providers: []
})
export class ResourceModule { }