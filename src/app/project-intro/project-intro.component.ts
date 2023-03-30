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

  /*
    * getData() needs to be rewritten after the NodeJS Express server is implemented 
    * Making a call to check the project installation will create a CORS issue 
    * Every project installation status can be checked on the server 
  */

  getData() {
    this.api.getData().subscribe(data => {
      this.projects = data;
      this.projects.forEach((project: any) => {
        let url = 'http://localhost:' + project.installedPort;
        this.api.checkProjectInstallation(url).subscribe((resp: any) => {
          const projectStatus = resp;
          projectStatus.forEach((status: any) => {
            if(project.name === status.project){
              project['installed'] = status.installed;
            }
          });
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
    // To be implemented once the NodeJS serveris implemented
    console.log(project);
  }

}
