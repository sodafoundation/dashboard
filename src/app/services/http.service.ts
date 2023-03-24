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

}
