import { NgModule, APP_INITIALIZER } from '@angular/core';
import { AkSkComponent } from './ak-sk.component';
import { RouterModule } from '@angular/router';
import { TabViewModule, ButtonModule, ConfirmDialogModule , DialogModule, DataTableModule } from '../../components/common/api';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { akSkService } from './ak-sk.service';

let routers = [{
  path: '',
  component: AkSkComponent
}]

@NgModule({
  declarations: [
    AkSkComponent,
  ],
  imports: [
    RouterModule.forChild(routers),
    TabViewModule,
    ButtonModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    ConfirmDialogModule,
    DialogModule,
    DataTableModule
  ],
  providers: [akSkService]
})
export class AkSkModule { }