import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent, HttpEventType, HttpResponse, HttpClientModule, HttpHeaders, HttpErrorResponse } from '@angular/common/http'
import { Observable } from 'rxjs';
import { finalize, tap, map, last } from 'rxjs/operators';
import { I18NService, ParamStorService } from '../../shared/api';


@Injectable()
export class MonitorService {

  url = "/v1beta/{project_id}/metricurls";
  constructor(
    private http: HttpClient,
    private paramStor: ParamStorService
  ) { }
  
  project_id = this.paramStor.CURRENT_TENANT().split("|")[1];
  getMonitorList(): Observable<any> {
    return this.http.get(this.url);
  }

}
