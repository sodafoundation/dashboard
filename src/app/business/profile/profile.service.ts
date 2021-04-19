import { Injectable } from '@angular/core';
import { HttpService } from './../../shared/service/Http.service';
import { Observable } from 'rxjs';

@Injectable()
export class ProfileService {
    url = 'v1beta/{project_id}/profiles'
    constructor(private http: HttpService) { }
    
    createProfile(param) {
        return this.http.post(this.url, param);
    }

   
    deleteProfile(id): Observable<any> {
        let deleteUrl = this.url + '/' + id
        return this.http.delete(deleteUrl);
    }

    
    getProfiles(): Observable<any> {
        return this.http.get(this.url);
    }

    
    getProfileById(id) {
        let getUrl = this.url + '/' + id
        return this.http.get(getUrl);
    }

    
    modifyProfile(id, param) {
        let modifyUrl = this.url + '/' + id
        this.http.put(modifyUrl, param).subscribe((res) => {
            console.log(res.json().data);
        });
    }
}
