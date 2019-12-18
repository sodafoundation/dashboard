import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { I18NService, HttpService, ParamStorService } from '../../../shared/api';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class AzResolver implements Resolve<any> {
  allHosts;
  constructor(
      private http: HttpService,
      private paramStor: ParamStorService
    ) { }

  project_id = this.paramStor.CURRENT_TENANT().split("|")[1];
  azUrl = 'v1beta/{project_id}/availabilityZones';
  
  resolve(): Observable<any> {
    let url = this.azUrl;
    return this.http.get(url);
  }
}