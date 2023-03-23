import { Component, OnInit } from '@angular/core';
import { HttpService } from '../services/http.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss']
})
export class ProjectDetailsComponent implements OnInit {

  constructor(
    private api: HttpService,
    private route: ActivatedRoute,
    private router: Router
  ) { }
  
  projectName: any;
  projectDetails: any;

  ngOnInit(): void {
    this.projectName = this.route.snapshot.paramMap.get('projectName')?.toLowerCase();
    this.getProjectDetails();
  }

  getProjectDetails(){
    this.api.getProjectDetails(this.projectName).subscribe(resp => {
      console.log(resp);
      this.projectDetails = resp;
    });
  }

  returnBack(){
    this.router.navigateByUrl('projects');
  }

}
