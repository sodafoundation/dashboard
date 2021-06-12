import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { HttpService } from './../../shared/service/Http.service';
import { DelfinComponent } from './delfin.component';
import { DelfinService } from './delfin.service';
import { AvailabilityZonesService } from './../resource/resource.service';
import { ConfirmationService,ConfirmDialogModule} from '../../components/common/api';
import { StoragesComponent } from './storages/storages.component';
import { StorageVolumesComponent } from './volumes/volumes.component';
import { StoragePoolsComponent } from './storage-pools/storage-pools.component';

import { SharedModule } from '../../shared/shared.module';



const routers: Routes = [{
    path: '',
    component: DelfinComponent
  }
]

@NgModule({
  declarations: [ DelfinComponent, StoragesComponent ],
  imports: [ 
    RouterModule.forChild(routers),
    SharedModule
    ],
  exports: [ DelfinComponent ],
  providers: [
    HttpService,
    DelfinService,
    ConfirmationService,
    AvailabilityZonesService
  ]
})
export class DelfinModule { }
