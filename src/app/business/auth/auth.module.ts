import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { RouterModule } from '@angular/router';

let routers = [{
    path: 'logout',
    component: LogoutComponent
  }]
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routers)
  ],
  declarations: [LogoutComponent]
})
export class AuthModule { }
