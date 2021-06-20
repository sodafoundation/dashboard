import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HttpService } from '../../../shared/service/Http.service';
import { DelfinService } from '../delfin.service';
import { AvailabilityZonesService } from '../../resource/resource.service';
import { ConfirmationService,ConfirmDialogModule} from '../../../components/common/api';

import { StoragesComponent } from '../storages/storages.component';
import { MaskingViewsComponent } from './masking-views.component';
import { MaskingViewsListComponent } from './list/masking-views-list.component';
import { MaskingViewsDetailsComponent } from './details/masking-views-details.component';
import { MaskingViewsRoutingModule } from './masking-views-routing.module';
import { SharedModule } from '../../../shared/shared.module';



@NgModule({
  declarations: [ 
    MaskingViewsComponent,
    MaskingViewsListComponent,
    MaskingViewsDetailsComponent
  ],
  imports: [ 
    MaskingViewsRoutingModule,
    SharedModule,
    ConfirmDialogModule,
    ],
  exports: [ MaskingViewsComponent ],
  providers: [
    HttpService,
    DelfinService,
    ConfirmationService,
    AvailabilityZonesService
  ]
})
export class MaskingViewsModule { }
