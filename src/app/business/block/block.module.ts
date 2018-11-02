import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BlockComponent } from './block.component';
import { RouterModule } from '@angular/router';
import { TabViewModule, ButtonModule } from '../../components/common/api';
import { VolumeListModule } from './volumeList.module';
import { VolumeGroupModule } from './volumeGroup.module';
import { BucketsModule } from './buckets.module';
import { CreateVolumeGroupComponent } from './create-volume-group/create-volume-group.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

let routers = [{
  path: '',
  component: BlockComponent
}]

@NgModule({
  declarations: [
    BlockComponent,
    CreateVolumeGroupComponent
  ],
  imports: [
    RouterModule.forChild(routers),
    VolumeListModule,
    VolumeGroupModule,
    TabViewModule,
    ButtonModule,
    BucketsModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule
  ],
  providers: []
})
export class BlockModule { }