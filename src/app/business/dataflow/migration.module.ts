import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { MigrationListComponent } from './migration.component';
import { HttpService } from './../../shared/service/Http.service';

import { MigrationDetailModule } from './migration-detail/migration-detail.module';
import { MigrationService } from './migration.service';
import { BucketService } from './../block/buckets.service';

@NgModule({
  declarations: [ MigrationListComponent ],
  imports: [
    RouterModule,
    SharedModule,
    MigrationDetailModule,
  ],
  exports: [ MigrationListComponent ],
  providers: [
    HttpService,
    MigrationService,
    BucketService
  ]
})
export class MigrationModule { }
