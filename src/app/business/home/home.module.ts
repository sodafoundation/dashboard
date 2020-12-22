import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { ImgItemComponent } from './imgItem.component/imgItem.component';
import { ProfileService } from 'app/business/profile/profile.service';
import { HttpService } from 'app/shared/service/Http.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BucketService } from '../block/buckets.service';
import { RouterModule } from '@angular/router';
import { ButtonModule, ChartModule,CardModule } from '../../components/common/api';
import { DataTableModule, DropMenuModule,HomeDialogModule, DialogModule, FormModule, InputTextModule, InputTextareaModule,
   DropdownModule ,ConfirmationService,ConfirmDialogModule, GrowlModule} from '../../components/common/api';
   import { SidebarModule } from '../../components/sidebar/sidebar';
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
    RouterModule.forChild(routers), ButtonModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    ChartModule,
    CardModule,
    HomeDialogModule,
    FormModule,
    InputTextModule, 
    InputTextareaModule, 
    DropdownModule,
    DataTableModule,
    ConfirmDialogModule,
    GrowlModule,
    DialogModule,
    SidebarModule,
    JoyrideModule.forChild()
  ],
  providers: [HttpService, ProfileService,ConfirmationService,BucketService]
})
export class HomeModule { }