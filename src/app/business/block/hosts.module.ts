import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HostsComponent } from './hosts.component';
import { HttpService } from './../../shared/service/Http.service';
import { VolumeService} from './volume.service';
import { HostsService } from './hosts.service';
import { AvailabilityZonesService } from './../resource/resource.service';

import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [ HostsComponent ],
  imports: [ 
    RouterModule,
    SharedModule
  ],
  exports: [ HostsComponent ],
  providers: [
    HttpService,
    VolumeService,
    HostsService,
    AvailabilityZonesService
  ]
})
export class HostsModule { }
