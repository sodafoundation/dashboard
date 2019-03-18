import { Injectable } from '@angular/core';
import { I18NService, HttpService, ParamStorService } from '../../shared/api';
import { Observable } from 'rxjs';

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
}


