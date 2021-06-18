import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { MigrationDetailComponent } from './migration-detail.component';
import { HttpService } from './../../../shared/service/Http.service';
import { MigrationService } from '../migration.service';


@NgModule({
  imports: [
    RouterModule,
    SharedModule
  ],
  exports: [ MigrationDetailComponent ],
  declarations: [
    MigrationDetailComponent
  ],
  providers: [
    HttpService,
    MigrationService
  ]
})
export class MigrationDetailModule { }
