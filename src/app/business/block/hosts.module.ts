import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HostsComponent } from './hosts.component';
import { ButtonModule, DataTableModule, InputTextModule, DropMenuModule, DialogModule,FormModule,MultiSelectModule ,DropdownModule,InputTextareaModule} from '../../components/common/api';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpService } from './../../shared/service/Http.service';
import { VolumeService} from './volume.service';
import { HostsService } from './hosts.service';
import { AvailabilityZonesService } from './../resource/resource.service';
import { ConfirmationService,ConfirmDialogModule} from '../../components/common/api';
import { TooltipModule } from '../../components/tooltip/tooltip';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [ HostsComponent ],
  imports: [ CommonModule, ButtonModule, DataTableModule, InputTextModule, DropMenuModule, DialogModule,FormModule,MultiSelectModule,DropdownModule,ReactiveFormsModule,FormsModule,ConfirmDialogModule,InputTextareaModule, TooltipModule,RouterModule],
  exports: [ HostsComponent ],
  providers: [
    HttpService,
    VolumeService,
    HostsService,
    ConfirmationService,
    AvailabilityZonesService
  ]
})
export class HostsModule { }
