import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ServicePlanService } from './service-plan.service';
import { ServicePlanComponent } from './service-plan.component';

let routers = [{
  path: '',
  component: ServicePlanComponent
}]

@NgModule({
  declarations: [
    ServicePlanComponent,
  ],
  imports: [
    RouterModule.forChild(routers),
    SharedModule
  ],
  providers: [ServicePlanService]
})
export class ServicePlanModule { }