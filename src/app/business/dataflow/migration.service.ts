import { Injectable } from '@angular/core';
import { I18NService, HttpService, ParamStorService } from '../../shared/api';
import { Observable } from 'rxjs';

@Injectable()
export class MigrationService {
  constructor(
    private http: HttpService,
    private paramStor: ParamStorService
  ) { }

  url = 'v1/{project_id}/plans';

  createMigration(param) {
    return this.http.post(this.url, param);
  }
  
  modifyMigration(id,param) {
    let modifyUrl = this.url + '/' + id
    return this.http.put(modifyUrl, param);
  }

  deleteMigration(id): Observable<any> {
    let deleteUrl = this.url + '/' + id
    return this.http.delete(deleteUrl);
  }

  getMigrations(): Observable<any> {
    return this.http.get(this.url);
  }

  getMigrationById(id): Observable<any> {
    let url = this.url + '/' + id;
    return this.http.get(url);
  }
  getMigrationsCount():Observable<any> {
    return this.http.get(this.url+"/count");
  }

  //Search Bucket
  getBucketByName(bucketName): Observable<any> {
    return this.http.get("v1beta/{project_id}/bucket?name=" + bucketName);
  }

}


