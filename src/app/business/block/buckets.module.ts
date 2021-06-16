import { NgModule, APP_INITIALIZER } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { BucketsComponent } from './buckets.component';
import { RouterModule } from '@angular/router';
import { HttpService } from './../../shared/service/Http.service';
import { BucketService } from './buckets.service';
import { MigrationService } from './../dataflow/migration.service';

@NgModule({
  declarations: [
    BucketsComponent
  ],
  imports: [
    RouterModule,
    SharedModule
  ],
  exports: [ BucketsComponent ],
  providers: [
    HttpService,
    BucketService,
    MigrationService
  ]
})
export class BucketsModule { }
