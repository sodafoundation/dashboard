import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent, HttpEventType, HttpResponse, HttpClientModule, HttpHeaders, HttpErrorResponse } from '@angular/common/http'
import { Observable } from 'rxjs';
import { finalize, tap, map, last } from 'rxjs/operators';

@Injectable()
export class ConfigService {

  url = "v1beta/";
  options = {
      headers: {
          'X-Auth-Token': localStorage['auth-token']
      } 
  };
  constructor(private http: HttpClient) { }

  downloadConfig(configType){
    let url = "v1beta/downloadconf?conftype=" + configType;
    let headers = new HttpHeaders({
      'X-Auth-Token' : this.options.headers['X-Auth-Token'],
      'Content-Type':  'application/x-yaml',
    });
    return this.http.get(url, {responseType: 'blob',headers:headers});
  }

}
