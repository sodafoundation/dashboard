import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { ReplicationDetailComponent } from './replication-detail.component';
import { HttpService } from './../../../shared/service/Http.service';


@NgModule({
  imports: [
    RouterModule,
    SharedModule
  ],
  exports: [ ReplicationDetailComponent ],
  declarations: [
    ReplicationDetailComponent
  ],
  providers: [
    HttpService
  ]
})
export class ReplicationDetailModule { }
