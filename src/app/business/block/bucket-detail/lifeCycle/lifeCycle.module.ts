import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { LifeCycleComponent } from './lifeCycle.component';
import { HttpService } from '../../../../shared/service/Http.service';
import { BucketService } from '../../buckets.service';

@NgModule({
  declarations: [
    LifeCycleComponent
  ],
  imports: [
    RouterModule,
    SharedModule
  ],
  exports: [ LifeCycleComponent ],
  providers: [
    HttpService,
    BucketService
  ]
})
export class LifeCycleModule { }
