import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfrastructureComponent } from './infrastructure.component';
import { RouterModule } from '@angular/router';
import { TabViewModule, ButtonModule, DataTableModule, InputTextModule } from '../../components/common/api';
import { HttpService } from '../../shared/service/Http.service';
import { AvailabilityZonesService } from './infrastructure.service';

let routers = [{
  path: '',
  component: InfrastructureComponent
}]

@NgModule({
  declarations: [
    InfrastructureComponent
  ],
  imports: [
    RouterModule.forChild(routers),
    CommonModule,
    TabViewModule,
    ButtonModule,
    DataTableModule,
    InputTextModule,
  ],
  providers: [HttpService,AvailabilityZonesService]
})
export class InfrastructureModule { }