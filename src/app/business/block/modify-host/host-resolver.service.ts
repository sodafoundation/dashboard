import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { I18NService, HttpService, ParamStorService } from '../../../shared/api';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class HostsResolver implements Resolve<any> {
  allHosts;
  constructor(
      private http: HttpService,
      private paramStor: ParamStorService
    ) { }

  project_id = this.paramStor.CURRENT_TENANT().split("|")[1];
  hostsUrl = 'v1beta/{project_id}/host/hosts';
  
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    let id: any = route.params['hostId'];
    let url = this.hostsUrl + "/" + id;
    return this.http.get(url);
  }
}