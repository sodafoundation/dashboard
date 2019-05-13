import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent, HttpEventType, HttpResponse, HttpHeaders, HttpErrorResponse } from '@angular/common/http'
import { Observable } from 'rxjs';
import { finalize, tap, map, last } from 'rxjs/operators';
import { I18NService, ParamStorService } from '../../shared/api';

@Injectable()
export class WorkflowService {

  url = "v1beta/orchestration/";
  options = {
      headers: {
          'X-Auth-Token': localStorage['auth-token']
      } 
  };
  user_id = this.paramStor.CURRENT_TENANT().split("|")[0];
  project_id = this.paramStor.CURRENT_TENANT().split("|")[1];

  constructor(private http: HttpClient,
    private paramStor: ParamStorService) { 
    this.getServices().subscribe(data => {
      console.log(data);
    });
  }

  public getServices(): Observable<any> {
    let detailUrl = this.url + 'services'
    return this.http.get(detailUrl);
  }

  public getInstances(): Observable<any> {
    let detailUrl = this.url + 'instances'
    return this.http.get(detailUrl);
  }

  public createInstance(param) {
    let detailUrl = this.url + 'instances';
    param['userId'] = this.user_id;
    param['tenantId'] = this.project_id;
    console.log("Final Param to post", param);
    return this.http.post(detailUrl, param);
  }

}
