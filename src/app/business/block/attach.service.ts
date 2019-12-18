import { Injectable } from '@angular/core';
import { I18NService, HttpService, ParamStorService } from '../../shared/api';
import { Observable } from 'rxjs';

@Injectable()
export class AttachService {
  constructor(
    private http: HttpService,
    private paramStor: ParamStorService
  ) { }

  url = 'v1beta/{project_id}/block/attachments';


  //Fetch all Attachments
  getAttachments(): Observable<any> {
    return this.http.get(this.url);
  }

   //Fetch Attachment by ID
   getAttachmentById(id): Observable<any> {
    let attachIdUrl = this.url + '/' + id
    return this.http.get(attachIdUrl);
  }
  //Create Attachment
  createAttachment(param) {
    return this.http.post(this.url, param);
  }

  //Update Attachment
  modifyAttachments(id,param) {
    let modifyUrl = this.url + '/' + id
    return this.http.put(modifyUrl, param);
  }

   //Delete Attachment
   deleteAttachment(id): Observable<any> {
    let deleteUrl = this.url + '/' + id
    return this.http.delete(deleteUrl);
  }
  
}