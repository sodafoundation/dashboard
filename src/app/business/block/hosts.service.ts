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
    //create volume group
    createHost(param){
        let url = this.hostsUrl;
        return this.http.post(url,param);
    }
    //get volume group
    getHosts(): Observable<any> {
        return this.http.get(this.hostsUrl);
    }
    //delete volume group
    deleteHost(hostId): Observable<any> {
      let url = this.hostsUrl + "/" + hostId
      return this.http.delete(url);
    }
    //modify volume group
    modifyHost(hostId,param): Observable<any> {
      let url = this.hostsUrl + "/" + hostId
      return this.http.put(url,param);
    }
    //get volume group by id
    getHostById(hostId): Observable<any> {
      let url = this.hostsUrl + "/" + hostId;
      return this.http.get(url);
    }

}