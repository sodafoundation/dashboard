import { Injectable } from '@angular/core';
import { I18NService} from '../../shared/api';
import { Observable } from 'rxjs';
import { Http } from '@angular/http';

@Injectable()
export class akSkService{
    constructor(
    private http: Http,
    ) { }

    url = "/v3/credentials";
    getAkSkList(param,options): Observable<any> {
        return this.http.get(this.url, param);
    }

    createAkSk(param,options){
        return this.http.post(this.url,param);
    }

    deleteAkSk(id,options): Observable<any>{
        let deleteUrl = this.url + '/' + id;
        return this.http.delete(deleteUrl);
    }

    downloadAkSk(id,options): Observable<any>{
        let detailUrl = this.url + '/' + id;
        return this.http.get(detailUrl);
    }
}