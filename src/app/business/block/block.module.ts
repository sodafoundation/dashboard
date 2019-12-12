import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BlockComponent } from './block.component';
import { RouterModule } from '@angular/router';
import { TabViewModule, ButtonModule } from '../../components/common/api';
import { VolumeListModule } from './volumeList.module';
import { VolumeGroupModule } from './volumeGroup.module';
import { BucketsModule } from './buckets.module';
import { FileShareModule } from './fileShare.module';
import { HostsModule } from './hosts.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
    VolumeListModule,
    VolumeGroupModule,
    TabViewModule,
    ButtonModule,
    BucketsModule,
    FileShareModule,
    HostsModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule
  ],
  providers: []
})
export class BlockModule { }
