import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { ReplicationComponent } from './replication.component';
import { HttpService } from './../../shared/service/Http.service';
import { ReplicationDetailModule } from './replication-detail/replication-detail.module';

@NgModule({
  declarations: [ ReplicationComponent ],
  imports: [ 
    RouterModule,
    SharedModule,
    ReplicationDetailModule
  ],
  exports: [ ReplicationComponent ],
  providers: [
    HttpService,
  ]
})
export class ReplicationModule { }
