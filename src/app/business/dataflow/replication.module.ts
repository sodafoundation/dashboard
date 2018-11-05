import { NgModule, APP_INITIALIZER } from '@angular/core';
import { ReplicationComponent } from './replication.component';
import { ButtonModule, DataTableModule, InputTextModule, DialogModule,FormModule,MultiSelectModule ,DropdownModule,InputTextareaModule} from '../../components/common/api';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpService } from './../../shared/service/Http.service';
import { ConfirmationService,ConfirmDialogModule} from '../../components/common/api';
import { RouterModule } from '@angular/router';
import { ReplicationDetailModule } from './replication-detail/replication-detail.module';

@NgModule({
  declarations: [ ReplicationComponent ],
  imports: [ 
    ButtonModule, 
    DataTableModule, 
    InputTextModule,
    DialogModule,
    FormModule,
    MultiSelectModule,
    DropdownModule,
    ReactiveFormsModule,
    FormsModule,
    ConfirmDialogModule,
    InputTextareaModule,
    RouterModule,
    ReplicationDetailModule
  ],
  exports: [ ReplicationComponent ],
  providers: [
    HttpService,
    ConfirmationService
  ]
})
export class ReplicationModule { }
