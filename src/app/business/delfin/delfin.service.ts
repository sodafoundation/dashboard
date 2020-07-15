import { Injectable } from '@angular/core';
import { I18NService, HttpService, ParamStorService, Consts } from '../../shared/api';
import { Observable } from 'rxjs';

@Injectable()
export class DelfinService {
    constructor(
        private http: HttpService,
        private paramStor: ParamStorService
    ) { }
    
    project_id = this.paramStor.CURRENT_TENANT().split("|")[1];
    delfinStoragesUrl = Consts.API.DELFIN.storages;
    delfinStoragePoolsUrl = Consts.API.DELFIN.storagePools;
    delfinVolumesUrl = Consts.API.DELFIN.volumes;
    
    //register storage
    registerStorage(param){
        return this.http.post(this.delfinStoragesUrl,param);
    }
    //get All Storages
    getAllStorages(): Observable<any> {
        return this.http.get(this.delfinStoragesUrl);
    }
    //get storage by id
    getStorageById(id): Observable<any> {
        return this.http.get(this.delfinStoragesUrl + "/" + id);
    }
    //delete storage
    deleteStorage(id): Observable<any> {
      return this.http.delete(this.delfinStoragesUrl + "/" + id);
    }
    //modify storage
    modifyStorage(id,param): Observable<any> {
      return this.http.put(this.delfinStoragesUrl + "/" + id,param);
    }
    //Sync all storages
    syncAllStorages(param){
        return this.http.post(this.delfinStoragesUrl+'/sync', null);
    }
    //Sync storage by id
    syncStorageById(id){
        return this.http.post(this.delfinStoragesUrl + '/' + id + '/sync', null);
    }
    //Get Access info by storage id
    getAccessinfoByStorageId(id){
        return this.http.get(this.delfinStoragesUrl + '/' + id + '/access-info');
    }
    //modify Access info by storage id
    modifyAccessinfoByStorageId(id, param){
        return this.http.put(this.delfinStoragesUrl + '/' + id + '/access-info', param);
    }
}