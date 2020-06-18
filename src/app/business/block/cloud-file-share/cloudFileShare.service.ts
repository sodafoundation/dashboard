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
        return this.http.get(this.url);
    }

    //get fileShareList by backend
    getFileSharesByBackend(backend):Observable<any>{
        let getUrl =  'v1/{project_id}/backends/' + backend + '/file/shares'
        return this.http.get(this.url);
    }

    //create fileShare
    createFileShare(param, backend){
        console.log("Inside create cloud file share", param, backend)
        let createUrl = 'v1/{project_id}/backends/' + backend + '/file/shares'
        return this.http.post(createUrl,param);
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