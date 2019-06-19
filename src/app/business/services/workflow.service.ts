import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent, HttpEventType, HttpResponse, HttpHeaders, HttpErrorResponse } from '@angular/common/http'
import { Observable } from 'rxjs';
import { finalize, tap, map, last } from 'rxjs/operators';
import { I18NService, HttpService, ParamStorService } from '../../shared/api';

@Injectable()
export class WorkflowService {

  
  options = {
      headers: {
          'X-Auth-Token': localStorage['auth-token']
      } 
  };
  user_id = this.paramStor.CURRENT_TENANT().split("|")[0];
  project_id = this.paramStor.CURRENT_TENANT().split("|")[1];
  /* FIXME The endpoint  changes are to fix  Issue #106 in opensds/opensds-dashboard. 
  This is a temporary fix for the API not being reachable. The Orchestration API endpoint will be changed and this fix will be removed. */
  url = "/orch/{project_id}/orchestration/";
  

  constructor(
    private http: HttpService,
    private paramStor: ParamStorService) { 
  }

  public getServices(): Observable<any> {
    let detailUrl = this.url + 'services'
    return this.http.get(detailUrl);
  }

  public getServiceById(id): Observable<any> {
    let detailUrl = this.url + 'services/' + id;
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
    param['headers'] = {
          'X-Auth-Token': localStorage['auth-token']
      };
    return this.http.post(detailUrl, param);
  }

}
