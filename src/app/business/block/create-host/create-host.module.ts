import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { CreateHostComponent } from './create-host.component';

import { HttpService } from './../../../shared/api';
import { VolumeService,ReplicationService } from './../volume.service';
import { ProfileService } from './../../profile/profile.service';
import { AvailabilityZonesService } from '../../infrastructure/infrastructure.service';
import { HostsService } from '../hosts.service';
import { InputTextModule, CheckboxModule, ButtonModule, DropdownModule, MultiSelectModule, DialogModule, Message, GrowlModule, SpinnerModule, FormModule } from './../../../components/common/api';

let routers = [{
  path: '',
  component: CreateHostComponent
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
    CreateHostComponent
  ],
  providers: [
    HttpService,
    VolumeService,
    ProfileService,
    ReplicationService,
    AvailabilityZonesService,
    HostsService
  ]
})
export class CreateHostModule { }
