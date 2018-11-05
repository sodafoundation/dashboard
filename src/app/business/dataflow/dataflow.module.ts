import { NgModule, APP_INITIALIZER } from '@angular/core';
import { DataflowComponent } from './dataflow.component';
import { RouterModule } from '@angular/router';
import { TabViewModule, ButtonModule } from '../../components/common/api';
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
    MigrationModule,
    TabViewModule,
    ButtonModule,
    ReplicationModule
  ],
  providers: [MigrationService]
})
export class DataflowModule { }