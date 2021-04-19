import { CommonModule } from '@angular/common';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { ProfileComponent } from './profile.component';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ProfileCardComponent } from './profileCard/profile-card.component';
import { ButtonModule,CardModule,ChartModule,MessageModule,OverlayPanelModule,DialogModule ,ConfirmationService,ConfirmDialogModule, FormModule, DropMenuModule, GrowlModule} from '../../components/common/api';
import { TooltipModule } from '../../components/tooltip/tooltip';
import { ProfileService } from './profile.service';
import { PoolService } from './pool.service';
import { HttpService } from '../../shared/api';
import { SuspensionFrameComponent } from './profileCard/suspension-frame/suspension-frame.component';

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
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    CommonModule,
    CardModule,
    ChartModule,
    MessageModule,
    OverlayPanelModule,
    DialogModule,
    ConfirmDialogModule,
    FormModule,
    DropMenuModule,
    GrowlModule,
    TooltipModule
  ],
  providers: [
    HttpService,
    ProfileService,
    ConfirmationService,
    PoolService
  ]
})
export class ProfileModule { }