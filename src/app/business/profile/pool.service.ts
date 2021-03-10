import { Injectable } from '@angular/core';
import { HttpService } from './../../shared/service/Http.service';
import { Observable } from 'rxjs';

@Injectable()
export class PoolService{
    url = 'v1beta/{project_id}/pools';
    constructor(private http: HttpService) { }
    
    getPools(): Observable<any> {
        return this.http.get(this.url);
    }
}
