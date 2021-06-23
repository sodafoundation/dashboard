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
    delfinControllersUrl = Consts.API.DELFIN.controllers;
    delfinQtreesUrl = Consts.API.DELFIN.qtrees;
    delfinFilesystemsUrl = Consts.API.DELFIN.filesystems;
    delfinSharesUrl = Consts.API.DELFIN.shares;
    delfinQuotasUrl = Consts.API.DELFIN.quotas;
    delfinPortsUrl = Consts.API.DELFIN.ports;
    delfinDisksUrl = Consts.API.DELFIN.disks;
    delfinAlertsUrl = Consts.API.DELFIN.alerts;
    
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
    getAllVolumes(storageId?, nativeVolumeId?, nativeStoragePoolId?, name?, status?, limit?, offset?, sort?): Observable<any> {
        let query = "";
        if(storageId){
            query += "?storage_id=" + storageId;
        }
        if(nativeVolumeId){
            query += "?native_volume_id=" + nativeVolumeId;
        }
        if(nativeStoragePoolId){
            query += "?native_storage_pool_id=" + nativeStoragePoolId;
        }
        if(name){
            query += "?name=" + name;
        }
        if(status){
            query += "?status=" + status;
        }
        if(limit){
            query += "?limit=" + limit;
        }
        if(offset){
            query += "?offset=" + offset;
        }
        if(sort){
            query += "?sort=" + sort;
        }
        let url =this.delfinVolumesUrl + query;
        return this.http.get(url);
    }

    //get Volume Details
    getVolumeDetails(id): Observable<any> {
        return this.http.get(this.delfinVolumesUrl+'/'+id);
    }

    //get all Storage pools
    getAllStoragePools(storageId?, storagePoolId?, nativeStoragePoolId?, name?, status?, limit?, offset?, sort?): Observable<any> {
        let query = "";
        if(storageId){
            query += "?storage_id=" + storageId;
        }
        if(storagePoolId){
            query += "?id=" + storagePoolId;
        }
        if(nativeStoragePoolId){
            query += "?native_storage_pool_id=" + nativeStoragePoolId;
        }
        if(name){
            query += "?name=" + name;
        }
        if(status){
            query += "?status=" + status;
        }
        if(limit){
            query += "?limit=" + limit;
        }
        if(offset){
            query += "?offset=" + offset;
        }
        if(sort){
            query += "?sort=" + sort;
        }
        let url =this.delfinStoragePoolsUrl + query;
        return this.http.get(url);
    }

    //get Storage Pool details
    getStoragePoolDetails(id): Observable<any> {
        return this.http.get(this.delfinStoragePoolsUrl+'/'+id);
    }

//get all Controllers
    getAllControllers(storageId?, controllerId?, nativeControllerId?, name?, status?, limit?, offset?, sort?): Observable<any> {
        let query = "";
        if(storageId){
            query += "?storage_id=" + storageId;
        }
        if(controllerId){
            query += "?id=" + controllerId;
        }
        if(nativeControllerId){
            query += "?native_controller_id=" + nativeControllerId;
        }
        if(name){
            query += "?name=" + name;
        }
        if(status){
            query += "?status=" + status;
        }
        if(limit){
            query += "?limit=" + limit;
        }
        if(offset){
            query += "?offset=" + offset;
        }
        if(sort){
            query += "?sort=" + sort;
        }
        let url =this.delfinControllersUrl + query;
        return this.http.get(url);
    }

    //get Controller details
    getControllerDetails(id): Observable<any> {
        return this.http.get(this.delfinControllersUrl+'/'+id);
    }

    //get all Ports
    getAllPorts(storageId?, portId?, nativePortId?, name?, status?, limit?, offset?, sort?): Observable<any> {
        let query = "";
        if(storageId){
            query += "?storage_id=" + storageId;
        }
        if(portId){
            query += "?id=" + portId;
        }
        if(nativePortId){
            query += "?native_port_id=" + nativePortId;
        }
        if(name){
            query += "?name=" + name;
        }
        if(status){
            query += "?status=" + status;
        }
        if(limit){
            query += "?limit=" + limit;
        }
        if(offset){
            query += "?offset=" + offset;
        }
        if(sort){
            query += "?sort=" + sort;
        }
        let url =this.delfinPortsUrl + query;
        return this.http.get(url);
    }

    //get Port details
    getPortDetails(id): Observable<any> {
        return this.http.get(this.delfinPortsUrl +'/'+id);
    }

    //get all Disks
    getAllDisks(storageId?, diskId?, nativeDiskId?, name?, status?, limit?, offset?, sort?): Observable<any> {
        let query = "";
        if(storageId){
            query += "?storage_id=" + storageId;
        }
        if(diskId){
            query += "?id=" + diskId;
        }
        if(nativeDiskId){
            query += "?native_port_id=" + nativeDiskId;
        }
        if(name){
            query += "?name=" + name;
        }
        if(status){
            query += "?status=" + status;
        }
        if(limit){
            query += "?limit=" + limit;
        }
        if(offset){
            query += "?offset=" + offset;
        }
        if(sort){
            query += "?sort=" + sort;
        }
        let url =this.delfinDisksUrl + query;
        return this.http.get(url);
    }

    //get Disk details
    getDiskDetails(id): Observable<any> {
        return this.http.get(this.delfinDisksUrl +'/'+id);
    }

    //get all Qtrees
    getAllQtrees(storageId?, qtreeId?, nativeFilesystemId?, id?, name?, status?, limit?, offset?, sort?): Observable<any> {
        let query = "";
        if(storageId){
            query += "?storage_id=" + storageId;
        }
        if(qtreeId){
            query += "?native_qtree_id=" + qtreeId;
        }
        if(nativeFilesystemId){
            query += "?native_filesystem_id=" + nativeFilesystemId;
        }
        if(name){
            query += "?name=" + name;
        }
        if(id){
            query += "?id=" + id;
        }
        if(status){
            query += "?status=" + status;
        }
        if(limit){
            query += "?limit=" + limit;
        }
        if(offset){
            query += "?offset=" + offset;
        }
        if(sort){
            query += "?sort=" + sort;
        }
        let url =this.delfinQtreesUrl + query;
        return this.http.get(url);
    }

    //get Qtree details
    getQtreeDetails(id): Observable<any> {
        return this.http.get(this.delfinQtreesUrl+'/'+id);
    }

    //get all Filesystems
    getAllFilesystems(storageId?, nativeFilesystemId?, nativePoolId?, securityMode?, id?, name?, status?, limit?, offset?, sort?): Observable<any> {
        let query = "";
        if(storageId){
            query += "?storage_id=" + storageId;
        }
        if(nativeFilesystemId){
            query += "?native_filesystem_id=" + nativeFilesystemId;
        }
        if(nativePoolId){
            query += "?native_pool_id=" + nativePoolId;
        }
        if(securityMode){
            query += "?security_mode=" + securityMode;
        }
        if(id){
            query += "?id=" + id;
        }
        if(name){
            query += "?name=" + name;
        }
        if(status){
            query += "?status=" + status;
        }
        if(limit){
            query += "?limit=" + limit;
        }
        if(offset){
            query += "?offset=" + offset;
        }
        if(sort){
            query += "?sort=" + sort;
        }
        let url =this.delfinFilesystemsUrl + query;
        return this.http.get(url);
    }

    //get Storage Pool details
    getFilesystemDetails(id): Observable<any> {
        return this.http.get(this.delfinFilesystemsUrl+'/'+id);
    }

    //get all Shares
    getAllShares(storageId?, shareId?, nativeFilesystemId?, qtreeId?, protocol?, name?, limit?, offset?, sort?): Observable<any> {
        let query = "";
        if(storageId){
            query += "?storage_id=" + storageId;
        }
        if(shareId){
            query += "?native_share_id=" + shareId;
        }
        if(nativeFilesystemId){
            query += "?native_filesystem_id=" + nativeFilesystemId;
        }
        if(qtreeId){
            query += "?qtree_id=" + qtreeId;
        }
        if(protocol){
            query += "?protocol=" + protocol;
        }
        if(name){
            query += "?name=" + name;
        }
        if(limit){
            query += "?limit=" + limit;
        }
        if(offset){
            query += "?offset=" + offset;
        }
        if(sort){
            query += "?sort=" + sort;
        }
        let url =this.delfinSharesUrl + query;
        return this.http.get(url);
    }

    //get Share details
    getShareDetails(id): Observable<any> {
        return this.http.get(this.delfinSharesUrl+'/'+id);
    }

    //get all Quotas
    getAllQuotas(storageId?, nativeFilesystemId?, nativeQtreeId?, securityMode?, id?, name?, status?, limit?, offset?, sort?): Observable<any> {
        let query = "";
        if(storageId){
            query += "?storage_id=" + storageId;
        }
        if(nativeFilesystemId){
            query += "?native_filesystem_id=" + nativeFilesystemId;
        }
        if(nativeQtreeId){
            query += "?native_qtree_id=" + nativeQtreeId;
        }
        if(securityMode){
            query += "?security_mode=" + securityMode;
        }
        if(id){
            query += "?id=" + id;
        }
        if(name){
            query += "?name=" + name;
        }
        if(status){
            query += "?status=" + status;
        }
        if(limit){
            query += "?limit=" + limit;
        }
        if(offset){
            query += "?offset=" + offset;
        }
        if(sort){
            query += "?sort=" + sort;
        }
        let url =this.delfinQuotasUrl + query;
        return this.http.get(url);
    }

    //get Storage Pool details
    getQuotaDetails(id): Observable<any> {
        return this.http.get(this.delfinQuotasUrl+'/'+id);
    }

    //get all alert sources
    getAlertSource(id): Observable<any>{
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

    //Get All alerts
    getAllAlerts(): Observable<any>{
        return this.http.get(this.delfinAlertsUrl);
    }

    //Get Alerts by Storage ID
    getAlertsByStorageId(storageId): Observable<any>{
        return this.http.get(this.delfinStoragesUrl + '/' + storageId + '/alerts');
    }

    //delete alerts
    deleteAlerts(id, seqNum): Observable<any>{
        return this.http.delete(this.delfinStoragesUrl + '/' + id + '/alerts/' + seqNum);
    }

    //Configure performance metrics collection
    metricsConfig(id, params): Observable<any>{
        return this.http.put(this.delfinStoragesUrl + '/' + id + '/metrics-config', params);
    }

    //Get All Masking Views
    
    getAllMaskingViews(storageId, nativeMaskingViewId?, nativeStorageHostId?, nativeStorageHostGroupId?, nativeStorageVolumeGroupId?, nativeStoragePortGroupId?, name?, limit?, offset?, sort?): Observable<any> {
        let query = "";
        
        if(nativeMaskingViewId){
            query += "?native_masking_view_id=" + nativeMaskingViewId;
        }
        if(nativeStorageHostId){
            query += "?native_storage_host_id=" + nativeStorageHostId;
        }
        if(nativeStorageHostGroupId){
            query += "?native_storage_host_group_id=" + nativeStorageHostGroupId;
        }
        if(nativeStorageVolumeGroupId){
            query += "?native_volume_group_id=" + nativeStorageVolumeGroupId;
        }
        if(nativeStoragePortGroupId){
            query += "?native_port_group_id=" + nativeStoragePortGroupId;
        }
        if(name){
            query += "?name=" + name;
        }
        if(limit){
            query += "?limit=" + limit;
        }
        if(offset){
            query += "?offset=" + offset;
        }
        if(sort){
            query += "?sort=" + sort;
        }
        let url =this.delfinStoragesUrl + '/' + storageId + '/masking-views' + query;
        return this.http.get(url);
    }

    //get Masking View Details
    getMaskingViewDetails(storageId, maskingViewId): Observable<any> {
        let url =this.delfinStoragesUrl + '/' + storageId + '/masking-views/' + maskingViewId;
        return this.http.get(url);
    }

    getAllStorageHostGroups(storageId, nativeStorageHostGroupId?, name?, limit?, offset?, sort?): Observable<any> {
        let query = "";
        
        if(nativeStorageHostGroupId){
            query += "?native_storage_host_group_id=" + nativeStorageHostGroupId;
        }
        if(name){
            query += "?name=" + name;
        }
        if(limit){
            query += "?limit=" + limit;
        }
        if(offset){
            query += "?offset=" + offset;
        }
        if(sort){
            query += "?sort=" + sort;
        }
        let url =this.delfinStoragesUrl + '/' + storageId + '/storage-host-groups' + query;
        // return this.http.get('http://localhost:4200/assets/data/masking-views.json');
    }

    getAllStorageHosts(storageId, nativeStorageHostId?, name?, limit?, offset?, sort?): Observable<any> {
        let query = "";
        
        if(nativeStorageHostId){
            query += "?native_storage_host_id=" + nativeStorageHostId;
        }
        if(name){
            query += "?name=" + name;
        }
        if(limit){
            query += "?limit=" + limit;
        }
        if(offset){
            query += "?offset=" + offset;
        }
        if(sort){
            query += "?sort=" + sort;
        }
        let url =this.delfinStoragesUrl + '/' + storageId + '/storage-hosts' + query;
        return this.http.get(url);
    }

    getAllStorageHostInitiators(storageId, native_storage_host_initiator_id?, name?, limit?, offset?, sort?): Observable<any> {
        let query = "";
       
        if(native_storage_host_initiator_id){
            query += "?native_storage_host_initiator_id=" + native_storage_host_initiator_id;
        }
        if(name){
            query += "?name=" + name;
        }
        if(limit){
            query += "?limit=" + limit;
        }
        if(offset){
            query += "?offset=" + offset;
        }
        if(sort){
            query += "?sort=" + sort;
        }
        let url =this.delfinStoragesUrl + '/' + storageId + '/storage-initiators/' + query;
        return this.http.get(url);
    }

}

