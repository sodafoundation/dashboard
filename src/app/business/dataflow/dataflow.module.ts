import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { DataflowComponent } from './dataflow.component';
import { MigrationModule } from './migration.module';
import { ReplicationModule } from './replication.module';
import { MigrationService } from './migration.service';

let routers = [{
  path: '',
  component: DataflowComponent
}]

@NgModule({
  declarations: [
    DataflowComponent
  ],
  imports: [
    RouterModule.forChild(routers),
    SharedModule,
    MigrationModule,
    ReplicationModule
  ],
  providers: [MigrationService]
})
export class DataflowModule { }
