import { Injectable } from '@angular/core';
import { I18NService} from '../../shared/api';
import { Observable } from 'rxjs';
import { Http } from '@angular/http';

@Injectable()
export class ServicePlanService{
    constructor(
    private http: Http,
    ) { }

    url = "/v1/{project_id}/tiers";
    getTierList(param?,options?): Observable<any> {
        return this.http.get(this.url);
    }
    
    getTierDetails(id,options?): Observable<any> {
        let detailsUrl = this.url + '/' + id;
        return this.http.get(detailsUrl);
    }

    createTier(tenantId, param,options?){
        let createUrl = "/v1/" + tenantId + "/tiers"
        return this.http.post(createUrl , param);
    }

    deleteTier(id,options?): Observable<any>{
        let deleteUrl = this.url + '/' + id;
        return this.http.delete(deleteUrl);
    }

    updateTier(id, param, options?): Observable<any>{
        let detailUrl = this.url + '/' + id;
        return this.http.put(detailUrl, param);
    }
}