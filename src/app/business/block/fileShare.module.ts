import { NgModule, APP_INITIALIZER } from '@angular/core';

import { FileShareComponent } from './fileShare.component';
import { HttpService } from './../../shared/service/Http.service';
import { FileShareService, SnapshotService, FileShareAclService } from './fileShare.service';
import { ProfileService } from './../profile/profile.service';
import { RouterModule } from '@angular/router';
import { CloudFileShareModule } from './cloud-file-share/cloudFileShare.module';
import { SharedModule } from '../..//shared/shared.module';

@NgModule({
  declarations: [ FileShareComponent],
  imports: [
    RouterModule,
    SharedModule,
    CloudFileShareModule
  ],
  exports: [ FileShareComponent],
  providers: [
    HttpService,
    FileShareService,
    SnapshotService,
    ProfileService,
    FileShareAclService
  ]
})
export class FileShareModule { }
