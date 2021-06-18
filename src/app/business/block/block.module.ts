import { NgModule, APP_INITIALIZER } from '@angular/core';

import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { VolumeListModule } from './volumeList.module';
import { VolumeGroupModule } from './volumeGroup.module';
import { BucketsModule } from './buckets.module';
import { FileShareModule } from './fileShare.module';
import { CloudBlockServiceModule } from './cloud-block-service/cloud-block-service.module';
import { CloudFileShareModule } from './cloud-file-share/cloudFileShare.module';
import { HostsModule } from './hosts.module';
import { BlockComponent } from './block.component';

let routers = [{
  path: '',
  component: BlockComponent
}]

@NgModule({
  declarations: [
    BlockComponent
  ],
  imports: [
    RouterModule.forChild(routers),
    SharedModule,
    VolumeListModule,
    VolumeGroupModule,
    BucketsModule,
    FileShareModule,
    CloudBlockServiceModule,
    CloudFileShareModule,
    HostsModule
  ],
  providers: []
})
export class BlockModule { }
