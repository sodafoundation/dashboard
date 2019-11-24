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

  url = 'v1/s3';

  //Create bucket
  createBucket(name,param?,options?) {
    return this.http.put(this.url+"/"+name,param,options);
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
    let modifyUrl = this.url + '/' + id
    return this.http.put(modifyUrl, param);
  }

  //Delete Bucket
  deleteBucket(name,options): Observable<any> {
    let deleteUrl = this.url + '/' + name
    return this.http.delete(deleteUrl,options);
  }

  //Search all Buckets
  getBuckets(options): Observable<any> {
    return this.http.get(this.url,options);
  }

  //Search Bucket
  getBucketById(id,options): Observable<any> {
    let url = this.url + '/' + id;
    return this.http.get(url,options);
  }
  
  //Set Bucket Encryption
  setEncryption(name,param?,options?) {
    return this.http.put(this.url+"/"+name+"/?DefaultEncryption",param,options);
  }

  //Set Bucket Versioning
  setVersioning(name,param?,options?) {
    return this.http.put(this.url+"/"+name+"/?versioning",param,options);
  }
  suspendVersioning(name,param?,options?) {
    return this.http.put(this.url+"/"+name+"/?versioning",param,options);
  }

  getBckends(): Observable<any> {
    return this.http.get('v1beta/{project_id}/backend');
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
    let url = this.url + "/" + param;
    return this.http.get(url, options);
  }
  //get lifeCycle
  getLifeCycle(name, options){
    let url = this.url + "/" + name;
    return this.http.get(url, options)
  }
  //put lifeCycle
  createLifeCycle(name,param,options){
    let url = this.url + "/" + name;
    return this.http.put(url,param,options);
  }
  //delete lifeCycle
  deleteLifeCycle(name,param){
    let url = this.url + "/" +name;
    return this.http.delete(url,param);
  }

  // Rquest header with AK/SK authentication added
  getSignatureOptions(SignatureObjectwindow, options?){
    let kAccessKey = SignatureObjectwindow.SignatureKey.AccessKey;
    let kDate = SignatureObjectwindow.SignatureKey.dateStamp;
    let kRegion = SignatureObjectwindow.SignatureKey.regionName;
    let kService = SignatureObjectwindow.SignatureKey.serviceName;
    let kSigning = SignatureObjectwindow.kSigning;
    let Credential = kAccessKey + '/' + kDate.substr(0,8) + '/' + kRegion + '/' + kService + '/' + 'sign_request';
    let Signature = 'OPENSDS-HMAC-SHA256' + ' Credential=' + Credential + ',SignedHeaders=host;x-auth-date' + ",Signature=" + kSigning;
    let requestObject = {};
    if(options){
      options['headers'] = new Headers();
      options.headers.set('Authorization',Signature);
      options.headers.set('X-Auth-Date', kDate);
      requestObject['options'] = options;
    }
    requestObject['Signature'] = Signature;
    requestObject['kDate'] = kDate;
    return requestObject;
  }
}

