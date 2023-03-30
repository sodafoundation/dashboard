import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})

export class HttpService {

  constructor(
    private http: HttpClient
  ) { }

  getData() {
    return this.http.get('assets/projectList.json');
  }

  getBaseData(){
    return this.http.get('assets/siteBasics.json');
  }

  getProjectDetails(projectName: any){
    return this.http.get('assets/'+projectName+'/'+projectName+'Details.json');
  }

  /*
    * The below API should be pointing to an API on the NodeJS server 
    * This is a mock API implementation to implement the UI functonality 
  */
  checkProjectInstallation(url: any){
    return this.http.get('assets/projectInstallStatus.json');
  }

}
