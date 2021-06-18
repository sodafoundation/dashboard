import { NgModule, APP_INITIALIZER } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { ServicesComponent } from './services.component';
import { ServicesRoutingModule } from './services-routing.module';
import { RouterModule } from '@angular/router';
import { InstanceListComponent } from './instance-list/instance-list.component';
import { ServicesListComponent } from './services-list/services-list.component';
import { CreateInstanceComponent } from './create-instance/create-instance.component';
import { CreateClusterComponent } from './create-cluster/create-cluster.component';
import { WorkflowService } from './workflow.service';
import { ProfileService } from '../profile/profile.service';
import { HostsService } from '../block/hosts.service';
import { HttpClientModule } from '@angular/common/http';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';

@NgModule({
  declarations: [
    ServicesComponent,
    InstanceListComponent,
    ServicesListComponent,
    CreateInstanceComponent,
    DynamicFormComponent,
    CreateClusterComponent
  ],
  imports: [
    SharedModule,
    ServicesRoutingModule,
    HttpClientModule,
  ],
  exports: [ServicesRoutingModule],
  providers: [WorkflowService, ProfileService, HostsService]
})
export class ServicesModule { }
