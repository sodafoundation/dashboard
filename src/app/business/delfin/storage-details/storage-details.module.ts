import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { StorageDetailsComponent } from './storage-details.component';
import { StorageVolumesComponent } from '../volumes/volumes.component';
import { StoragePoolsComponent } from '../storage-pools/storage-pools.component';
import { HttpService } from '../../../shared/api';
import { ProfileService } from '../../profile/profile.service';
import { AvailabilityZonesService } from '../../resource/resource.service';
import { DelfinService } from '../delfin.service';
import { TabViewModule, PanelModule, DataTableModule, ChartModule, OverlayPanelModule, CardModule, InputTextModule, CheckboxModule, ButtonModule, SplitButtonModule, DropdownModule, MultiSelectModule, DialogModule, Message, GrowlModule, SpinnerModule, FormModule } from '../../../components/common/api';
import { TooltipModule } from '../../../components/tooltip/tooltip';
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
    CheckboxModule,
    ButtonModule,
    SplitButtonModule,
    DropdownModule,
    MultiSelectModule,
    DialogModule,
    GrowlModule,
    SpinnerModule,
    FormModule,
    TooltipModule
  ],
  declarations: [ StorageDetailsComponent, StorageVolumesComponent, StoragePoolsComponent ],
  providers: [
    HttpService,
    ProfileService,
    AvailabilityZonesService,
    DelfinService
  ]
})
export class StorageDetailsModule { }
