import { Injectable } from '@angular/core';
import { I18NService, HttpService, ParamStorService } from '../../shared/api';
import { Observable } from 'rxjs';

@Injectable()
export class FileShareService {
    constructor(
        private http: HttpService,
        private paramStor: ParamStorService
    ) { }

    url = 'v1beta/{project_id}/file/shares';

    //get fileShareList
    getFileShare():Observable<any>{
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

@Injectable()
export class SnapshotService {
    constructor(
        private http: HttpService,
        private paramStor: ParamStorService
    ) { }

    url = 'v1beta/{project_id}/file/snapshots';

    //create snapshot
    createSnapshot(param){
        return this.http.post(this.url,param);
    }
    //snapshot list
    getSnapshot(){
        return this.http.get(this.url);
    }
    //update snapshot
    updateSnapshot(snapshotId, param){
        let url = this.url + "/" + snapshotId;
        return this.http.put(url, param);
    }
    //delete snapshot
    deleteSnapshot(snapshotId){
        let url = this.url + "/" + snapshotId;
        return this.http.delete(url);
    }
}

@Injectable()
export class FileShareAclService{
    constructor(
        private http: HttpService,
        private paramStor: ParamStorService
    ) { }

    url = "v1beta/{project_id}/file/acls"

    //create Acl
    createFileShareAcl(param, fileShreId){
        return this.http.post(this.url,param);
    }
    //get Acl
    getFileShareAcl(){
        return this.http.get(this.url);
    }
    //update Acl
    updateFileShareAcl(aclId,param){
        let url = this.url + "/" + aclId;
        return this.http.put(url,param);
    }
    //delete Acl
    deleteFileShareAcl(aclId){
        let url = this.url + "/" + aclId;
        return this.http.delete(url);
    }
}