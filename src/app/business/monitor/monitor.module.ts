import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule, SplitButtonModule, PanelModule, MessageModule, DataTableModule, } from '../../components/common/api';
import {FileUploadModule} from '../../components/fileupload/fileupload';
import {CardModule} from '../../components/card/card';
import {GrowlModule} from '../../components/growl/growl';
import {TooltipModule} from '../../components/tooltip/tooltip';
import {ProgressBarModule} from '../../components/progressbar/progressbar';
import { HttpClientModule } from '@angular/common/http';
import { MonitorRoutingModule } from './monitor-routing.module';
import { MonitorListComponent } from './monitor-list/monitor-list.component';
import { ConfigComponent } from './config/config.component';
import { MonitorComponent } from './monitor.component';
import { MonitorService } from './monitor.service';
import { ConfigService } from './config/config.service';

@NgModule({
  imports: [
    CommonModule,
    ButtonModule,
    SplitButtonModule,
    PanelModule,
    MessageModule,
    DataTableModule,
    FileUploadModule,
    CardModule,
    GrowlModule,
    TooltipModule,
    ProgressBarModule,
    HttpClientModule,
    MonitorRoutingModule
  ],
  declarations: [MonitorListComponent, ConfigComponent, MonitorComponent],
  exports: [MonitorRoutingModule],
  providers: [MonitorService, ConfigService]
})
export class MonitorModule { }
