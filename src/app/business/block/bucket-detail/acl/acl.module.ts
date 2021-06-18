import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { AclComponent } from './acl.component';
import { HttpService } from '../../../../shared/service/Http.service';
import { BucketService } from '../../buckets.service';


@NgModule({
  declarations: [
    AclComponent
  ],
  imports: [
    RouterModule,
    SharedModule
  ],
  exports: [ AclComponent ],
  providers: [
    HttpService,
    BucketService
  ]
})
export class AclModule { }
