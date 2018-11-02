import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { ImgItemComponent } from './imgItem.component/imgItem.component';
import { ProfileService } from 'app/business/profile/profile.service';
import { HttpService } from 'app/shared/service/Http.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { RouterModule } from '@angular/router';
import { ButtonModule, ChartModule,CardModule } from '../../components/common/api';
import { DataTableModule, DropMenuModule,HomeDialogModule, DialogModule, FormModule, InputTextModule, InputTextareaModule,
   DropdownModule ,ConfirmationService,ConfirmDialogModule} from '../../components/common/api';

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
    DialogModule
  ],
  providers: [HttpService, ProfileService,ConfirmationService]
})
export class HomeModule { }