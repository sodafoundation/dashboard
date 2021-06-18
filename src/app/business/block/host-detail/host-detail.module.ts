import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { HostDetailComponent } from './host-detail.component';
import { HttpService } from '../../../shared/service/Http.service';
import { VolumeService} from '../volume.service';
import { ProfileService } from '../../profile/profile.service';
import { HostsService } from '../hosts.service';


let routers = [{
  path: '',
  component: HostDetailComponent
}]

@NgModule({
  imports: [
    RouterModule.forChild(routers),
    SharedModule
  ],
  declarations: [
    HostDetailComponent,
  ],
  providers: [
    HttpService,
    VolumeService,
    HostsService,
    ProfileService,
  ]
})
export class HostDetailModule { }
