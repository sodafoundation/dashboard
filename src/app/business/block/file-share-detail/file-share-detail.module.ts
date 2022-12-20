import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { FileShareDetailComponent } from './file-share-detail.component';
import { HttpService } from '../../../shared/service/Http.service';
import { FileShareService, SnapshotService ,FileShareAclService } from '../fileShare.service';
import { ProfileService } from '../../profile/profile.service';

let routers = [{
    path: '',
    component: FileShareDetailComponent
}]

@NgModule({
  declarations: [
    FileShareDetailComponent
  ],
  imports: [
    RouterModule.forChild(routers),
    SharedModule
  ],
  exports: [ FileShareDetailComponent ],
  providers: [
    HttpService,
    FileShareService,
    SnapshotService,
    ProfileService,
    FileShareAclService
  ]
})
export class FileShareDetailModule { }
