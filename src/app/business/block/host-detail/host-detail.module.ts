import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HostDetailComponent } from './host-detail.component';

import { TabViewModule,ButtonModule, DataTableModule,DropdownModule, DropMenuModule, DialogModule, FormModule, InputTextModule, InputTextareaModule, ConfirmDialogModule ,ConfirmationService,CheckboxModule} from '../../../components/common/api';
import { HttpService } from '../../../shared/service/Http.service';
import { VolumeService} from '../volume.service';
import { ProfileService } from '../../profile/profile.service';
import { HostsService } from '../hosts.service';
import {GrowlModule} from '../../../components/growl/growl';

let routers = [{
  path: '',
  component: HostDetailComponent
}]

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    InputTextareaModule,
    RouterModule.forChild(routers),
    TabViewModule,
    ButtonModule,
    DataTableModule,
    DialogModule,
    FormModule,
    ConfirmDialogModule,
    DropdownModule,
    DropMenuModule,
    CheckboxModule,
    GrowlModule
  ],
  declarations: [
    HostDetailComponent,
  ],
  providers: [
    HttpService,
    VolumeService,
    HostsService,
    ConfirmationService,
    ProfileService,
  ]
})
export class HostDetailModule { }
