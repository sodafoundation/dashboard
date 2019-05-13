import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from "@angular/common";
import { ServicesComponent } from './services.component';
import { ServicesRoutingModule } from './services-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TabViewModule, ButtonModule, SplitButtonModule, 
  ConfirmDialogModule , DialogModule, PanelModule, 
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
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    ServicesComponent,
    InstanceListComponent,
    ServicesListComponent,
    CreateInstanceComponent
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
    TooltipModule,
    DataTableModule,
    OverlayPanelModule,
    HttpClientModule],
  exports: [ServicesRoutingModule],
  providers: [WorkflowService]
})
export class ServicesModule { }