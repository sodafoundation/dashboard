import { Injectable } from '@angular/core';
import { I18NService, HttpService, ParamStorService } from '../../../shared/api';
import { Observable } from 'rxjs';

@Injectable()
export class CloudFileShareService {
    constructor(
        private http: HttpService,
        private paramStor: ParamStorService
    ) { }

    url = 'v1/{project_id}/file/shares';

    //get fileShareList
    getAllFileShares():Observable<any>{
        //return this.http.get('../../../../assets/data/cloud-file-share-data.json');
        return this.http.get(this.url);
    }

    getFileShareById(fileShareId):Observable<any>{
        return this.http.get(this.url+'/'+fileShareId);
    }

    //get fileShareList by backend
    getFileSharesByBackend(backend):Observable<any>{
        let getUrl =  'v1/{project_id}/file/shares/?backendId=' + backend + '/sync'
        return this.http.get(this.url);
    }

    //create fileShare
    createFileShare(param){
        return this.http.post(this.url,param);
    }

    //update fileShare
    updateFileShare(fileShareId,param){
        let url = this.url + "/" + fileShareId;
        return this.http.put(url,param);
    }

    //fileShareDetail
    getFileShareDetail(fileShareId){
        let url = this.url + "/" + fileShareId;
        return this.http.get(url);
    }

    //delete fileShare
    deleteFileShare(fileShareId){
        let url = this.url + "/" + fileShareId;
        return this.http.delete(url);
    }
}