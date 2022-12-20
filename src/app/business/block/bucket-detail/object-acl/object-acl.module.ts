import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { ObjectAclComponent } from './object-acl.component';
import { HttpService } from '../../../../shared/service/Http.service';
import { BucketService } from '../../buckets.service';

let routers = [{
  path: '',
  component: ObjectAclComponent
}]
@NgModule({
  declarations: [
    ObjectAclComponent
  ],
  imports: [
    RouterModule.forChild(routers),
    SharedModule
  ],
  exports: [ ObjectAclComponent ],
  providers: [
    HttpService,
    BucketService
  ]
})
export class ObjectAclModule { }
