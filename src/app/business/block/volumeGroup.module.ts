import { NgModule, APP_INITIALIZER } from '@angular/core';
import { VolumeGroupComponent } from './volumeGroup.component';
import { HttpService } from './../../shared/service/Http.service';
import { VolumeService ,VolumeGroupService} from './volume.service';
import { AvailabilityZonesService } from './../resource/resource.service';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [ VolumeGroupComponent ],
  imports: [ 
    RouterModule,
    SharedModule
  ],
  exports: [ VolumeGroupComponent ],
  providers: [
    HttpService,
    VolumeService,
    VolumeGroupService,
    AvailabilityZonesService
  ]
})
export class VolumeGroupModule { }
