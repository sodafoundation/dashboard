import { Injectable } from '@angular/core';
import { I18NService, HttpService, ParamStorService } from '../../shared/api';
import { Observable } from 'rxjs';
import { Headers } from '@angular/http';

@Injectable()
export class BucketService {
  constructor(
    private http: HttpService,
    private paramStor: ParamStorService
  ) { }

  url = 's3/';

  //Create bucket
  createBucket(name,param?,options?) {
    return this.http.put(this.url + name,param,options);
  }

  //Upload file
  uploadFile(bucketName,param?,options?) {
    return this.http.put(this.url+`/${bucketName}`,param,options);
  }

  //Save to db
  saveToDB(param) {
    return this.http.post("v1beta/file/updatedb", param);
  }

  //Update Bucket
  modifyBucket(id,param) {
    let modifyUrl = this.url + id
    return this.http.put(modifyUrl, param);
  }

  //Delete Bucket
  deleteBucket(name,options): Observable<any> {
    let deleteUrl = this.url + name
    return this.http.delete(deleteUrl,options);
  }

  //Search all Buckets
  getBuckets(options): Observable<any> {
    return this.http.get(this.url,options);
  }

  //Search Bucket
  getBucketById(id,options): Observable<any> {
    let url = this.url + id;
    return this.http.get(url,options);
  }
  
  //Set Bucket Encryption
  setEncryption(name,param?,options?) {
    return this.http.put(this.url+name+"/?DefaultEncryption",param,options);
  }

  //Set Bucket Versioning
  setVersioning(name,param?,options?) {
    return this.http.put(this.url+name+"/?versioning",param,options);
  }
  suspendVersioning(name,param?,options?) {
    return this.http.put(this.url+name+"/?versioning",param,options);
  }

  getBckends(): Observable<any> {
    return this.http.get('v1/{project_id}/backends');
  }

  getFilesByBucketId(bucketId): Observable<any> {
    return this.http.get('v1beta/{project_id}/file?bucket_id=' + bucketId);
  }

  deleteFile(fileId,options) : Observable<any> {
    return this.http.delete(this.url + fileId,options);
  }

  getTypes() : Observable<any> {
    return this.http.get('v1/{project_id}/types');
  }

  getBackendsByTypeId(typeId): Observable<any> {
    return this.http.get('v1/{project_id}/backends?type=' + typeId);
  }

  //get transOptions
  getTransOptions(param,options){
    let url = this.url + param;
    return this.http.get(url, options);
  }
  //get lifeCycle
  getLifeCycle(name, options){
    let url = this.url + name + '/?lifecycle';
    return this.http.get(url, options)
  }
  //put lifeCycle
  createLifeCycle(name,param,options){
    let url = this.url + name + '/?lifecycle';
    return this.http.put(url,param,options);
  }
  //delete lifeCycle
  deleteLifeCycle(name,param){
    let url = this.url +name;
    return this.http.delete(url,param);
  }
  //copy object
  copyObject(object,param, options){
    let url = this.url + object;
    return this.http.put(url, param, options);
  }

  //get acl
  getAcl(name, options){
    let url = this.url + name + '/?acl';
    return this.http.get(url, options)
  }
  //put acl
  creatAcl(name,param,options){
    let url = this.url + name + '/?acl';
    return this.http.put(url,param,options);
  }
  //get Objectacl
  getObjectAcl(name, options){
    let url = this.url + name + '/?acl';
    return this.http.get(url, options)
  }
  //put Objectacl
  creatObjectAcl(name,param,options){
    let url = this.url + name + '/?acl';
    return this.http.put(url,param,options);
  }

  //Restore Object
  restoreObject(name, param?, options?){
    let url = this.url + name + "?restore"
    return this.http.post(url, param, options);
  }
  
  // Rquest header with AK/SK authentication added
  getSignatureOptions(requestOptions, options){
    options.headers.set('X-Amz-Content-Sha256', requestOptions.headers['X-Amz-Content-Sha256']);
    options.headers.set('X-Amz-Date', requestOptions.headers['X-Amz-Date']);
    options.headers.set('Authorization', requestOptions.headers['Authorization']);
    options.headers.set('X-Auth-Token', requestOptions.headers['X-Auth-Token']);
    options.headers.set('Content-Type', requestOptions.headers['Content-Type']);
    if(requestOptions.headers['X-Amz-Storage-Class']){
      options.headers.set('X-Amz-Storage-Class', requestOptions.headers['X-Amz-Storage-Class']);
    }
    if(requestOptions.headers['tier']){
      options.headers.set('tier', requestOptions.headers['tier']);
    }
    return options;
  }
}

