import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent, HttpEventType, HttpResponse, HttpClientModule, HttpHeaders, HttpErrorResponse } from '@angular/common/http'
import { Observable } from 'rxjs';
import { finalize, tap, map, last } from 'rxjs/operators';
import { I18NService, ParamStorService } from '../../shared/api';


@Injectable()
export class MonitorService {

  url = "/v1beta/";
  options = {
    headers: {
        'X-Auth-Token': localStorage['auth-token']
    } 
  };
  constructor(
    private http: HttpClient,
    private paramStor: ParamStorService
  ) { }
  
  project_id = this.paramStor.CURRENT_TENANT().split("|")[1];

  getMonitorList(): Observable<any> {
    let detailUrl = this.url + this.project_id + "/metrics/urls";
    return this.http.get(detailUrl, this.options);
  }

  uploadConfigFile(file: File, configType){
    const formData = new FormData();
    formData.append('conf_file', file);
    let detailUrl = this.url + this.project_id +  '/metrics/uploadconf?conftype=' + configType;
    const uploadReq = new HttpRequest('POST', detailUrl, formData, {
      reportProgress: true,
      headers: new HttpHeaders().set('X-Auth-Token' , this.options.headers['X-Auth-Token']),
      responseType: 'text'
    });
    return this.http.request(uploadReq);
  }

  downloadConfig(configType){
    let url = this.url + this.project_id + '/metrics/downloadconf?conftype=' + configType;
    let headers = new HttpHeaders({
      'X-Auth-Token' : this.options.headers['X-Auth-Token'],
      'Content-Type':  'application/x-yaml',
    });
    return this.http.get(url, {responseType: 'blob',headers:headers});
  }

}
