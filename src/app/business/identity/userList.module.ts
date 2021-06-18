import { NgModule, APP_INITIALIZER } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { UserListComponent } from './userList.component';
import { UserDetailModule } from './userDetail/userDetail.module';

@NgModule({
  declarations: [UserListComponent],
  imports: [
    SharedModule,
    UserDetailModule
  ],
  exports: [UserListComponent],
  providers: []
})
export class UserListModule { }
