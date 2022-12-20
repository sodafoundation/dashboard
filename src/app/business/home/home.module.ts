import { NgModule, APP_INITIALIZER } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { HomeComponent } from './home.component';
import { ImgItemComponent } from './imgItem.component/imgItem.component';
import { ProfileService } from 'app/business/profile/profile.service';
import { HttpService } from 'app/shared/service/Http.service';

import { BucketService } from '../block/buckets.service';
import { RouterModule } from '@angular/router';


   import { JoyrideModule } from 'ngx-joyride';
let routers = [{
  path: '',
  component: HomeComponent
}]

@NgModule({
  declarations: [
    HomeComponent,
    ImgItemComponent,
  ],
  imports: [
    RouterModule.forChild(routers), 
    SharedModule,
    JoyrideModule.forChild()
  ],
  providers: [HttpService, ProfileService,BucketService]
})
export class HomeModule { }
