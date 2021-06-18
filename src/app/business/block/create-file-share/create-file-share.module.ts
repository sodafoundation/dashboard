import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { CreateFileShareComponent } from './create-file-share.component';
import { HttpService } from '../../../shared/service/Http.service';
import { AvailabilityZonesService } from './../../resource/resource.service';
import { ProfileService } from './../../profile/profile.service';
import { FileShareService } from '../fileShare.service';

let routers = [{
    path: '',
    component: CreateFileShareComponent
  }]

@NgModule({
  declarations: [
    CreateFileShareComponent
  ],
  imports: [
    RouterModule.forChild(routers),
    SharedModule
  ],
  exports: [ CreateFileShareComponent ],
  providers: [
    HttpService,
    AvailabilityZonesService,
    ProfileService,
    FileShareService
  ]
})
export class CreateFileShareModule { }
