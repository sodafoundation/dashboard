import { Component, OnInit } from '@angular/core';
import { HttpService } from '../services/http.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-install-project',
  templateUrl: './install-project.component.html',
  styleUrls: ['./install-project.component.scss']
})
export class InstallProjectComponent implements OnInit {
  projects: any;
  col: string = '2';
  row: string = '1';
  gridColumns = 2;

  constructor(
    private api: HttpService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  projectName: any;
  projectDetails: any;

  ngOnInit(): void {
    this.projectName = this.route.snapshot.paramMap.get('projectName');
    this.getProjectDetails();
  }

  getProjectDetails(){
    this.api.getProjectDetails(this.projectName.toLowerCase()).subscribe(resp => {
      this.projectDetails = resp;
      this.checkSystemRequirements();
    });
  }


  checkSystemRequirements(){
    this.api.checkSystemRequirements(this.projectDetails.systemRequirements).subscribe(resp =>{
      console.log(resp);
    });
  }

  returnBack(){
    this.router.navigateByUrl('projects');
  }


}
