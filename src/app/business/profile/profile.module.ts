import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProfileCardComponent } from './profileCard/profile-card.component';
import { ProfileComponent } from './profile.component';
import { ProfileService } from './profile.service';
import { PoolService } from './pool.service';
import { HttpService } from '../../shared/api';
import { SuspensionFrameComponent } from './profileCard/suspension-frame/suspension-frame.component';
import { SharedModule } from '../../shared/shared.module';
let routers = [{
  path: '',
  component: ProfileComponent
}]

@NgModule({
  declarations: [
    ProfileComponent,
    ProfileCardComponent,
    SuspensionFrameComponent
  ],
  imports: [
    RouterModule.forChild(routers),
    SharedModule
  ],
  providers: [
    HttpService,
    ProfileService,
    PoolService
  ]
})
export class ProfileModule { }
