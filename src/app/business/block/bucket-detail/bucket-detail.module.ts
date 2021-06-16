import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { BucketDetailComponent } from './bucket-detail.component';
import { LifeCycleModule } from './lifeCycle/lifeCycle.module';
import { AclModule } from './acl/acl.module';
import { HttpService } from './../../../shared/service/Http.service';
import { BucketService } from '../buckets.service';
import { HttpClientModule } from '@angular/common/http';

let routers = [{
  path: '',
  component: BucketDetailComponent
}]

@NgModule({
  imports: [
    RouterModule.forChild(routers),
    SharedModule,
    LifeCycleModule,
    HttpClientModule,
    AclModule
  ],
  declarations: [
    BucketDetailComponent
  ],
  providers: [
    HttpService,
    BucketService  
  ]
})
export class BucketDetailModule { }
