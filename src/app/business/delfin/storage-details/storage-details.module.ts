import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { StorageDetailsComponent, SafePipe  } from './storage-details.component';
import { StorageVolumesComponent } from '../volumes/volumes.component';
import { StoragePoolsComponent } from '../storage-pools/storage-pools.component';
import { ControllersComponent } from '../controllers/controllers.component';
import { PortsComponent } from '../ports/ports.component';
import { DisksComponent } from '../disks/disks.component';
import { QtreesComponent } from '../qtrees/qtrees.component';
import { FilesystemsComponent } from '../filesystems/filesystems.component';
import { SharesComponent } from '../shares/shares.component';
import { QuotasComponent } from '../quotas/quotas.component';
import { HttpService } from '../../../shared/api';
import { ProfileService } from '../../profile/profile.service';
import { AvailabilityZonesService } from '../../resource/resource.service';
import { DelfinService } from '../delfin.service';
import { TabViewModule, PanelModule, DataTableModule, ChartModule, InputSwitchModule, OverlayPanelModule, CardModule, InputTextModule, CheckboxModule, ButtonModule, SplitButtonModule, DropdownModule, MultiSelectModule, DialogModule, Message, GrowlModule, SpinnerModule, FormModule } from '../../../components/common/api';
import { TooltipModule } from '../../../components/tooltip/tooltip';
import { ProgressBarModule } from '../../../components/progressbar/progressbar';
let routers = [{
  path: '',
  component: StorageDetailsComponent
}]

@NgModule({
  imports: [
    RouterModule.forChild(routers),
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    TabViewModule,
    PanelModule,
    DataTableModule,
    ChartModule,
    OverlayPanelModule,
    CardModule,
    InputTextModule,
    InputSwitchModule,
    CheckboxModule,
    ButtonModule,
    SplitButtonModule,
    DropdownModule,
    MultiSelectModule,
    DialogModule,
    GrowlModule,
    SpinnerModule,
    FormModule,
    TooltipModule,
    ProgressBarModule
  ],
  declarations: [ 
    StorageDetailsComponent, 
    StorageVolumesComponent, 
    StoragePoolsComponent, 
    ControllersComponent, 
    PortsComponent, 
    DisksComponent, 
    QtreesComponent, 
    FilesystemsComponent,
    SharesComponent,
    QuotasComponent,
    SafePipe  ],
  providers: [
    HttpService,
    ProfileService,
    AvailabilityZonesService,
    DelfinService
  ]
})
export class StorageDetailsModule { }
