import { NgModule, APP_INITIALIZER } from '@angular/core';
import { AkSkComponent } from './ak-sk.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
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
    SharedModule
  ],
  providers: [akSkService]
})
export class AkSkModule { }
