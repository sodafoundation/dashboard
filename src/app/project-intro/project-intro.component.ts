import { Component, OnInit } from '@angular/core';
import { HttpService } from '../services/http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-intro',
  templateUrl: './project-intro.component.html',
  styleUrls: ['./project-intro.component.scss']
})
export class ProjectIntroComponent implements OnInit {
  projects: any;
  col: string = '2';
  row: string = '1';
  gridColumns = 3;

  constructor(
    private api: HttpService,
    private route: Router
  ) { }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.api.getData().subscribe(data => {
      this.projects = data;
      this.projects.forEach((project: any) => {
        let url = {
          dashboardUrl: 'http://localhost:' + project.installedPort
        }
        this.api.checkProjectInstallation(url).subscribe((resp: any) => {
          const projectStatus = resp;
          if(projectStatus.status === 200 && projectStatus.dashboard === 'installed'){
            project['installed'] = true;
          } else {
            project['installed'] = false;
          }
        });
      });
    });
  }

  toggleGridColumns() {
    this.gridColumns = this.gridColumns === 3 ? 4 : 3;
  }

  navigateTo(project: any){
    this.route.navigateByUrl('/project-details/' + project);
  }

  navigateToDashboard(project: any){
    window.open('http://localhost:' + project.installedPort);
  }

  installProject(project: any){
    this.route.navigateByUrl('/project-details/install/' + project.name);
  }

}
