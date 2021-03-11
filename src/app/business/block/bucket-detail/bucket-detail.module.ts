import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BucketDetailComponent } from './bucket-detail.component';
import { LifeCycleModule } from './lifeCycle/lifeCycle.module';
import { AclModule } from './acl/acl.module';
import { TabViewModule,ButtonModule, DataTableModule, DropMenuModule, DialogModule, FormModule, InputTextModule, InputSwitchModule, InputTextareaModule, 
  ConfirmDialogModule ,ConfirmationService,CheckboxModule,DropdownModule, SplitButtonModule, GrowlModule} from './../../../components/common/api';
import { HttpService } from './../../../shared/service/Http.service';
import { BucketService } from '../buckets.service';
import { HttpClientModule } from '@angular/common/http';

let routers = [{
  path: '',
  component: BucketDetailComponent
}]

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    InputSwitchModule,
    InputTextareaModule,
    RouterModule.forChild(routers),
    TabViewModule,
    ButtonModule,
    DataTableModule,
    DialogModule,
    FormModule,
    ConfirmDialogModule,
    CheckboxModule,
    DropdownModule,
    LifeCycleModule,
    HttpClientModule,
    SplitButtonModule,
    GrowlModule,
    AclModule
  ],
  declarations: [
    BucketDetailComponent
  ],
  providers: [
    HttpService,
    ConfirmationService,
    BucketService  
  ]
})
export class BucketDetailModule { }
