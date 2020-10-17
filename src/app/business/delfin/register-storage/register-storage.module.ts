import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { RegisterStorageComponent } from './register-storage.component';

import { HttpService } from './../../../shared/api';
import { ProfileService } from './../../profile/profile.service';
import { AvailabilityZonesService } from './../../resource/resource.service';
import { DelfinService } from '../delfin.service';
import { InputTextModule, InputSwitchModule, CheckboxModule, ButtonModule, DropdownModule, MultiSelectModule, DialogModule, Message, GrowlModule, SpinnerModule, FormModule } from './../../../components/common/api';
import { FieldsetModule } from '../../../components/fieldset/fieldset';

let routers = [{
  path: '',
  component: RegisterStorageComponent
}]

@NgModule({
  imports: [
    RouterModule.forChild(routers),
    ReactiveFormsModule,
    FormsModule,
    FieldsetModule,
    CommonModule,
    InputTextModule,
    InputSwitchModule,
    CheckboxModule,
    ButtonModule,
    DropdownModule,
    MultiSelectModule,
    DialogModule,
    GrowlModule,
    SpinnerModule,
    FormModule
  ],
  declarations: [ RegisterStorageComponent ],
  providers: [
    HttpService,
    ProfileService,
    AvailabilityZonesService,
    DelfinService
  ]
})
export class RegisterStorageModule { }
