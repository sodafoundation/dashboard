import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ModifyHostComponent } from './modify-host.component';

import { HttpService } from './../../../shared/api';
import { VolumeService } from './../volume.service';
import { ProfileService } from './../../profile/profile.service';
import { AvailabilityZonesService } from '../../infrastructure/infrastructure.service';
import { HostsService } from '../hosts.service';
import { InputTextModule, CheckboxModule, ButtonModule, DropdownModule, MultiSelectModule, DialogModule, Message, GrowlModule, SpinnerModule, FormModule } from './../../../components/common/api';

let routers = [{
  path: '',
  component: ModifyHostComponent
}]

@NgModule({
  imports: [
    RouterModule.forChild(routers),
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    InputTextModule,
    CheckboxModule,
    ButtonModule,
    DropdownModule,
    MultiSelectModule,
    DialogModule,
    GrowlModule,
    SpinnerModule,
    FormModule
  ],
  declarations: [
    ModifyHostComponent
  ],
  providers: [
    HttpService,
    VolumeService,
    ProfileService,
    AvailabilityZonesService,
    HostsService
  ]
})
export class ModifyHostModule { }
