import { NgModule } from '@angular/core';
import { Routes, RouterModule, NavigationExtras } from '@angular/router';
import { MaskingViewsComponent } from './masking-views.component';
import { MaskingViewsListComponent } from './list/masking-views-list.component';
import { MaskingViewsDetailsComponent } from './details/masking-views-details.component';

const routers: Routes = [{
    path: '',
    component: MaskingViewsListComponent
  },
  {
    path: 'maskingViewDetails/:maskingViewId',
    component: MaskingViewsDetailsComponent
  }
]
  
@NgModule({
    imports: [
      RouterModule.forChild(routers)
    ],
    exports: [
      RouterModule
    ]
  })
  export class MaskingViewsRoutingModule {}