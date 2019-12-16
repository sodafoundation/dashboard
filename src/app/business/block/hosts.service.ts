import { Injectable } from '@angular/core';
import { I18NService, HttpService, ParamStorService } from '../../shared/api';
import { Observable } from 'rxjs';

@Injectable()
export class HostsService {
    constructor(
        private http: HttpService,
        private paramStor: ParamStorService
    ) { }

    project_id = this.paramStor.CURRENT_TENANT().split("|")[1];
    hostsUrl = 'v1beta/{project_id}/host/hosts';
    //create host 
    createHost(param){
        let url = this.hostsUrl;
        return this.http.post(url,param);
    }
    //get host 
    getHosts(): Observable<any> {
        return this.http.get(this.hostsUrl);
    }
    //delete host 
    deleteHost(hostId): Observable<any> {
      let url = this.hostsUrl + "/" + hostId
      return this.http.delete(url);
    }
    //modify host 
    modifyHost(hostId,param): Observable<any> {
      let url = this.hostsUrl + "/" + hostId
      return this.http.put(url,param);
    }
    //get host  by id
    getHostById(hostId): Observable<any> {
      let url = this.hostsUrl + "/" + hostId;
      return this.http.get(url);
    }

}