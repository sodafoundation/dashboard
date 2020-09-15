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
    registerStorage(params){
        return this.http.post(this.delfinStoragesUrl,params);
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
    modifyStorage(id,params): Observable<any> {
      return this.http.put(this.delfinStoragesUrl + "/" + id, params);
    }
    //Sync all storages
    syncAllStorages(param?){
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
    modifyAccessinfoByStorageId(id, params){
        return this.http.put(this.delfinStoragesUrl + '/' + id + '/access-info', params);
    }

    //get all Volumes
    getAllVolumes(): Observable<any> {
        return this.http.get(this.delfinVolumesUrl);
    }

    //get Volume Details
    getVolumeDetails(id): Observable<any> {
        return this.http.get(this.delfinVolumesUrl+'/'+id);
    }

    //get all Storage pools
    getAllStoragePools(): Observable<any> {
        return this.http.get(this.delfinStoragePoolsUrl);
    }

    //get Storage Pool details
    getStoragePoolDetails(id): Observable<any> {
        return this.http.get(this.delfinStoragePoolsUrl+'/'+id);
    }

    //get all alert sources
    getAllAlertSources(id): Observable<any>{
        return this.http.get(this.delfinStoragesUrl + '/' + id + '/alert-source')
    }

    //Modify alert source
    registerAlertSource(id, params): Observable<any>{
        return this.http.put(this.delfinStoragesUrl + '/' + id + '/alert-source', params)
    }

    //delete alert source
    deleteAlertSource(id): Observable<any>{
        return this.http.delete(this.delfinStoragesUrl + '/' + id + '/alert-source')
    }

    //delete alerts
    deleteAlerts(id, seqNum): Observable<any>{
        return this.http.delete(this.delfinStoragesUrl + '/' + id + '/alerts/' + seqNum);
    }
}

