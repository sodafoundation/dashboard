import { Injectable } from '@angular/core';
import { I18NService, HttpService, ParamStorService } from '../../../shared/api';
import { Observable } from 'rxjs';

@Injectable()
export class CloudBlockServiceService {
    constructor(
        private http: HttpService,
        private paramStor: ParamStorService
    ) { }

    url = 'v1/{project_id}/volumes';

    //get VolumeList
    getAllVolumes():Observable<any>{
        return this.http.get(this.url);
    }

    getVolumeById(VolumeId):Observable<any>{
        return this.http.get(this.url+'/'+VolumeId);
    }

    //get VolumeList by backend
    getVolumesByBackend(backend):Observable<any>{
        let getUrl =  'v1/{project_id}/volumes?backendId=' + backend
        return this.http.get(getUrl);
    }

    //create Volume
    createVolume(param){
        return this.http.post(this.url,param);
    }

    //update Volume
    updateVolume(VolumeId,param){
        let url = this.url + "/" + VolumeId;
        return this.http.put(url,param);
    }

    //VolumeDetail
    getVolumeDetail(VolumeId){
        let url = this.url + "/" + VolumeId;
        return this.http.get(url);
    }

    //delete Volume
    deleteVolume(VolumeId){
        let url = this.url + "/" + VolumeId;
        return this.http.delete(url);
    }
}