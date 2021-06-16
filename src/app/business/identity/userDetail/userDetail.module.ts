import { NgModule, APP_INITIALIZER } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { userDetailComponent } from './userDetail.component';


@NgModule({
  declarations: [ userDetailComponent ],
  imports: [ 
    SharedModule
  ],
  exports: [ userDetailComponent ],
  providers: []
})
export class UserDetailModule { }
