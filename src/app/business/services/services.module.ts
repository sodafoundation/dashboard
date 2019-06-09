import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from "@angular/common";
import { ServicesComponent } from './services.component';
import { ServicesRoutingModule } from './services-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TabViewModule, ButtonModule, SplitButtonModule, 
  ConfirmDialogModule , DialogModule, PanelModule, MessageModule,
  DataTableModule, OverlayPanelModule, InputTextModule,
  InputTextareaModule, CheckboxModule, FormModule,
  DropdownModule, RadioButtonModule,
  SelectButtonModule,} from '../../components/common/api';
import {CardModule} from '../../components/card/card';
import {GrowlModule} from '../../components/growl/growl';
import {TooltipModule} from '../../components/tooltip/tooltip';
import { RouterModule } from '@angular/router';
import { InstanceListComponent } from './instance-list/instance-list.component';
import { ServicesListComponent } from './services-list/services-list.component';
import { CreateInstanceComponent } from './create-instance/create-instance.component';
import { WorkflowService } from './workflow.service';
import { ProfileService } from '../profile/profile.service';
import { HttpClientModule } from '@angular/common/http';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';

@NgModule({
  declarations: [
    ServicesComponent,
    InstanceListComponent,
    ServicesListComponent,
    CreateInstanceComponent,
    DynamicFormComponent
  ],
  imports: [CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    InputTextareaModule,
    CheckboxModule,
    FormModule,
    DropdownModule,
    RadioButtonModule,
    SelectButtonModule,
    ServicesRoutingModule,
    TabViewModule,
    ButtonModule,
    SplitButtonModule,
    ConfirmDialogModule,
    DialogModule,
    CardModule,
    GrowlModule,
    PanelModule,
    MessageModule,
    TooltipModule,
    DataTableModule,
    OverlayPanelModule,
    HttpClientModule],
  exports: [ServicesRoutingModule],
  providers: [WorkflowService, ProfileService]
})
export class ServicesModule { }