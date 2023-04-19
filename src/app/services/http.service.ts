import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})

export class HttpService {

  constructor(
    private http: HttpClient
  ) { }

  serverPort = window.sessionStorage.getItem('serverPort');

  getData() {
    return this.http.get('assets/projectList.json');
  }

  getBaseData(){
    return this.http.get('assets/siteBasics.json');
  }

  getProjectDetails(projectName: any){
    return this.http.get('assets/'+projectName+'/'+projectName+'Details.json');
  }

  checkProjectInstallation(url: any){
    return this.http.post('http://localhost:'+ this.serverPort +'/api/checkDashboardStatus', url);
  }

  checkSystemRequirements(systemRequirements: any){
    return this.http.post('http://localhost:'+ this.serverPort +'/api/checkSystemRequirements', systemRequirements);
  }

}
