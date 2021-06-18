import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';

import { StorageDetailsComponent, SafePipe  } from './storage-details.component';
import { StorageVolumesComponent } from '../volumes/volumes.component';
import { StoragePoolsComponent } from '../storage-pools/storage-pools.component';
import { ControllersComponent } from '../controllers/controllers.component';
import { PortsComponent } from '../ports/ports.component';
import { DisksComponent } from '../disks/disks.component';
import { QtreesComponent } from '../qtrees/qtrees.component';
import { FilesystemsComponent } from '../filesystems/filesystems.component';
import { SharesComponent } from '../shares/shares.component';
import { QuotasComponent } from '../quotas/quotas.component';
import { HttpService } from '../../../shared/api';
import { ProfileService } from '../../profile/profile.service';
import { AvailabilityZonesService } from '../../resource/resource.service';
import { DelfinService } from '../delfin.service';

let routers = [{
  path: '',
  component: StorageDetailsComponent
}]

@NgModule({
  imports: [
    RouterModule.forChild(routers),
    SharedModule,
  ],
  declarations: [ 
    StorageDetailsComponent, 
    StorageVolumesComponent, 
    StoragePoolsComponent, 
    ControllersComponent, 
    PortsComponent, 
    DisksComponent, 
    QtreesComponent, 
    FilesystemsComponent,
    SharesComponent,
    QuotasComponent,
    SafePipe  ],
  providers: [
    HttpService,
    ProfileService,
    AvailabilityZonesService,
    DelfinService
  ]
})
export class StorageDetailsModule { }
