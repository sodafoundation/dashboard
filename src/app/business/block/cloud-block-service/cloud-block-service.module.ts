import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { HttpService } from '../../../shared/service/Http.service';
import { CloudBlockServiceComponent } from './cloud-block-service.component';
import { CloudBlockServiceService} from './cloud-block-service.service';




@NgModule({
  declarations: [ CloudBlockServiceComponent],
  imports: [
    RouterModule,
    SharedModule
  ],
  exports: [ CloudBlockServiceComponent],
  providers: [
    HttpService,
    CloudBlockServiceService
  ]
})
export class CloudBlockServiceModule { }
