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
      console.log(this.projects);
    });
  }

  navigateTo(project: any){
    this.route.navigateByUrl('/project-details/' + project);
  }

}
