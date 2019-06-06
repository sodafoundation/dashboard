import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent, HttpEventType, HttpResponse, HttpHeaders, HttpErrorResponse } from '@angular/common/http'
import { Observable } from 'rxjs';
import { finalize, tap, map, last } from 'rxjs/operators';
import { I18NService, ParamStorService } from '../../shared/api';

@Injectable()
export class WorkflowService {

  
  options = {
      headers: {
          'X-Auth-Token': localStorage['auth-token']
      } 
  };
  user_id = this.paramStor.CURRENT_TENANT().split("|")[0];
  project_id = this.paramStor.CURRENT_TENANT().split("|")[1];
  url = "/v1beta/" + this.project_id + "/orchestration/";
  

  constructor(private http: HttpClient,
    private paramStor: ParamStorService) { 
    console.log("Paramstor", this.paramStor.CURRENT_USER());
    console.log("Paramstor", this.paramStor.CURRENT_TENANT());
  }

  public getServices(): Observable<any> {
    let detailUrl = this.url + 'services'
    return this.http.get(detailUrl);
  }

  public getInstances(): Observable<any> {
    let detailUrl = this.url + 'instances';
    return this.http.get(detailUrl);
  }

  public getInstancesById(id): Observable<any> {
    let detailUrl = this.url + 'instances/?service_def=' + id;
    return this.http.get(detailUrl);
  }

  public getInstanceDetails(id): Observable<any> {
    let detailUrl = this.url + 'instances/' + id;
    return this.http.get(detailUrl);
  }

  public deleteInstance(id): Observable<any> {
    let detailUrl = this.url + 'instances/' + id;
    return this.http.delete(detailUrl);
  }

  public getTasks(id): Observable<any> {
    let detailUrl = this.url + 'tasks/' + id;
    return this.http.get(detailUrl);
  }

  public createInstance(param) {
    let detailUrl = this.url + 'instances';
    console.log("Final Param to post", param);
    return this.http.post(detailUrl, param);
  }

}
