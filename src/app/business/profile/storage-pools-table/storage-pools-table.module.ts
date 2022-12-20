import { NgModule, APP_INITIALIZER } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';

import { HttpService } from './../../../shared/api';
import { PoolService } from './../pool.service';

import { StoragePoolsTableComponent } from './storage-pools-table.component';

@NgModule({
  declarations: [
    StoragePoolsTableComponent
  ],
  imports: [
    SharedModule
  ],
  providers: [
    HttpService,
    PoolService
  ],
  exports: [
    StoragePoolsTableComponent
  ],
})
export class PoolModule { }
