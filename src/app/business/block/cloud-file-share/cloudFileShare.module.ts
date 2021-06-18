import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { HttpService } from '../../../shared/service/Http.service';
import { CloudFileShareComponent } from './cloud-file-share.component';
import { CloudFileShareService} from './cloud-file-share.service';




@NgModule({
  declarations: [ CloudFileShareComponent],
  imports: [
    RouterModule,
    SharedModule
  ],
  exports: [ CloudFileShareComponent],
  providers: [
    HttpService,
    CloudFileShareService
  ]
})
export class CloudFileShareModule { }
