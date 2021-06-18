import { NgModule, APP_INITIALIZER } from '@angular/core';
import { ResourceComponent } from './resource.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { HttpService } from './../../shared/service/Http.service';
import { AvailabilityZonesService } from './resource.service';

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
    SharedModule
  ],
  providers: [HttpService,AvailabilityZonesService]
})
export class ResourceModule { }
