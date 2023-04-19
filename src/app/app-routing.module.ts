import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectIntroComponent } from './project-intro/project-intro.component';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import { InstallProjectComponent } from './install-project/install-project.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'projects',
    pathMatch: 'full'
  },
  {
    path: 'projects',
    component: ProjectIntroComponent
  },
  {
    path: 'project-details/:projectName',
    component: ProjectDetailsComponent
  },
  {
    path: 'project-details/install/:projectName',
    component: InstallProjectComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
