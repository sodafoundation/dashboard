import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HelpComponent } from './help.component';
import { TabViewModule, ButtonModule, DataTableModule, InputTextModule, CardModule, BreadcrumbModule } from './../../components/common/api';
import {AccordionModule} from '../../components/accordion/accordion';
import { HttpService } from './../../shared/service/Http.service';
import { HelpHomeComponent } from './home/home-section.component';
import { HelpResourceComponent } from './resource/resource-section.component';
import { HelpDataflowComponent } from './dataflow/dataflow-section.component';
import { HelpMonitorComponent } from './monitor/monitor-section.component';
import { HelpProfileComponent } from './profile/profile-section.component';
import { HelpServicesComponent } from './services/services-section.component';
import { HelpInfrastructureComponent } from './infrastructure/infrastructure-section.component';
import { HelpIdentityComponent } from './identity/identity-section.component';
import { HelpFaqComponent } from './faq/faq-section.component';
import { HelpAkSkComponent } from './ak-sk/aksk-section.component';

let routers = [
{
  path: '',
  component: HelpComponent
}]

@NgModule({
  declarations: [
    HelpComponent,
    HelpHomeComponent,
    HelpProfileComponent,
    HelpResourceComponent,
    HelpDataflowComponent,
    HelpMonitorComponent,
    HelpServicesComponent,
    HelpInfrastructureComponent,
    HelpIdentityComponent,
    HelpFaqComponent,
    HelpAkSkComponent
  ],
  imports: [
    RouterModule.forChild(routers),
    CommonModule,
    TabViewModule,
    ButtonModule,
    DataTableModule,
    InputTextModule,
    AccordionModule,
    CardModule,
    BreadcrumbModule
  ],
  providers: [HttpService,]
})
export class HelpModule { }