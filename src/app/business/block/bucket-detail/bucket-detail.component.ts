import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute} from '@angular/router';
import { I18NService, Utils, MsgBoxService, HttpService, Consts} from 'app/shared/api';
import { BucketService} from '../buckets.service';
import { MenuItem ,ConfirmationService, Message} from '../../../components/common/api';
import { HttpClient } from '@angular/common/http';
import {XHRBackend, RequestOptions, Request, RequestOptionsArgs, Response, Headers, BaseRequestOptions } from '@angular/http';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { BaseRequestOptionsArgs } from 'app/shared/service/api';

let _ = require("underscore");
declare let X2JS:any;
let lodash = require('lodash');

@Component({
  selector: 'bucket-detail',
  templateUrl: './bucket-detail.component.html',
  styleUrls: [

  ],
  providers: [ConfirmationService, MsgBoxService],
})
export class BucketDetailComponent implements OnInit {
  fromObjects:boolean = false;
  fromLifeCycle:boolean = false;
  fromAcl:boolean = false;
  kDate = "";
  Signature = "";
  colon = "/";
  folderId = "";
  backetUrl;
  isUpload = window['isUpload'];
  selectFile;
  selectFileName;
  label;
  uploadFileDispaly:boolean = false;
  buketName:string="";
  bucketId:string="";
  items = [{
    label:"Buckets",
    url:["/block","fromBuckets"]
  }];
  allDir = [];
  selectedDir = [];
  uploadDisplay = false;
  selectedSpecify = [];
  showBackend = false;
  allTypes = [];
  backendsOption = [];
  selectBackend:any;
  bucket;
  showCreateFolder = false;
  createFolderForm:FormGroup;
  showErrorMsg = false;
  isReadyCopy = true;
  isReadyPast = true;
  UPLOAD_UPPER_LIMIT = 1024 * 1024 * 1024 * 2;
  moreItems = [];
  copySelectedDir = [];
  errorMessage = {
    "backend_type": { required: "Type is required." },
    "backend": { required: "Backend is required." },
    "name": {
      required: "name is required.",
      isExisted:"Name is existing",
      pattern: "Folder names cannot contain the following names/:"
    }
  };
  validRule= {
    'name':/^((?!\/|:).)*$/
  };
  uploadForm :FormGroup;
  files;
  allFolderNameForCheck = [];
  msgs: Message[];
  constructor(
    private ActivatedRoute: ActivatedRoute,
    public I18N:I18NService,
    private BucketService: BucketService,
    private confirmationService: ConfirmationService,
    private http: HttpService,
    private msg: MsgBoxService,
    private fb:FormBuilder,
    private httpClient:HttpClient
  ) 
  {
    this.createFolderForm = this.fb.group({
      "name": ["",{validators:[Validators.required,Utils.isExisted(this.allFolderNameForCheck),Validators.pattern(this.validRule.name)], updateOn:'change'}]
    });
    this.uploadForm = this.fb.group({
        "backend":["",{validators:[Validators.required], updateOn:'change'}],
        "backend_type":["",{validators:[Validators.required], updateOn:'change'}],
    });
  }

  ngOnInit() {
    this.ActivatedRoute.params.subscribe((params) => {
      this.bucketId = params.bucketId;
      this.items.push({
        label: this.bucketId,
        url: ["/" + this.bucketId],
      });
      this.fromObjects = params.fromRoute === "fromObjects";
      this.fromLifeCycle = params.fromRoute === "fromLifeCycle";
      this.backetUrl = this.bucketId;
      this.getAlldir();
      this.allTypes = [];
      this.getTypes();
    }
    );
    this.copySelectedDir = window.sessionStorage['searchIndex'] != "" ? JSON.parse(window.sessionStorage.getItem("searchIndex")) : [];
  }
  clickOperate(){
    if(this.selectedDir.length >0){
      this.isReadyCopy = false;
      this.copySelectedDir = lodash.cloneDeep(this.selectedDir);
    }else{
      this.isReadyCopy = true;
      this.copySelectedDir = window.sessionStorage['searchIndex'] != "" ? JSON.parse(window.sessionStorage.getItem("searchIndex")) : [];
      this.isReadyPast = this.copySelectedDir.length != 0 ? false :true;
    }
    this.moreItems = [
      {
        disabled: this.isReadyCopy,
        label: 'copy', command: () => {
          this.copyObject();
        }
      },
      {
        disabled: this.isReadyPast,
        label: 'paste', command: (y) => {
          this.pasteObject();
        }
      },
    ];
  }
  //copy object
  copyObject() {
    this.isReadyPast = true;
    this.copySelectedDir.forEach((item, index) =>{
      this.copySelectedDir[index]['source'] = this.bucketId;
      this.copySelectedDir[index]['folderId'] = this.folderId;
    })
    window.sessionStorage['searchIndex'] = JSON.stringify(this.copySelectedDir);
  }
  //paste object
  pasteObject() {
    this.copySelectedDir.forEach(item=>{
      let key = this.folderId != "" ? this.folderId + item.Contents[0].Key : item.Contents[0].Key;
      let copySource = item.folderId != "" ? item.source + '/' + item.folderId + item.Contents[0].Key : 
      item.source + '/' + item.Contents[0].Key;
      let sourceBucket = item.source;
      window['getAkSkList'](() => {
        let requestMethod = "PUT";
        let url = this.BucketService.url + "/" + this.bucketId + '/' + key;
        window['canonicalString'](requestMethod, url, () => {
          let options: any = {};
          this.getSignature(options);
          options.headers.set('Content-Type', 'application/xml');
          //The source data
          options.headers.set('x-amz-copy-source', copySource);
          if(sourceBucket != this.bucketId){
            //Copy between different buckets
            options.headers.set('X-Amz-Metadata-Directive', 'COPY');
          }else{
            //Copy in the same bucket
            options.headers.set('X-Amz-Metadata-Directive', 'REPLACE');
          }
          let param = {};
          this.BucketService.copyObject(this.bucketId + '/' + key, param, options).subscribe((res) => {
            this.isReadyPast = true;
            window.sessionStorage['searchIndex'] = "";
            this.getAlldir();
            res
          }, (error)=>{
            window.sessionStorage['searchIndex'] = "";
          });
        })
      })
    })
  }
  //Click on folder
  folderLink(file){
    let folderKey = file.Contents[0].Key;
    if(this.folderId == ""){
      this.folderId = folderKey;
    }else{
      this.folderId = this.folderId + folderKey;
    }
    this.items.push({
      label: folderKey.slice(0,folderKey.lastIndexOf(this.colon)),
      url: [this.colon + this.folderId],
    })
    this.getAlldir();
  }
  //Click on folder navigation
  navigateClick(itemUrl){
    this.items.forEach((item,index)=>{
      if(item.url[0] == itemUrl[0]){
        this.items = this.items.slice(0, index+1);
      }
    })
    let newLength = this.items.length-1;
    this.backetUrl = this.items[newLength].url[0].slice(1);
    if(itemUrl[0].slice(1) == this.bucketId){
      this.folderId = "";
    }else{
      this.folderId = this.backetUrl;
    }
    this.getAlldir();
  }
  getAlldir(){
    if(window.sessionStorage['headerTag']!==''){
      this.items = []
      this.items = JSON.parse(window.sessionStorage.getItem("headerTag"))
    }
    if(window.sessionStorage['folderId']!==''){
      this.folderId = JSON.parse(window.sessionStorage.getItem("folderId"))
    }
    this.selectedDir = [];
    window['getAkSkList'](()=>{
      let requestMethod = "GET";
      let url = this.BucketService.url + '/' + this.bucketId;
      window['canonicalString'](requestMethod, url,()=>{
        let options: any = {};
        this.getSignature(options);
        this.BucketService.getBucketById(this.bucketId,options).subscribe((res) => {
          let str = res._body;
          let x2js = new X2JS();
          let jsonObj = x2js.xml_str2json(str);
          let alldir = jsonObj.Result.ListBucketResult ? jsonObj.Result.ListBucketResult :[] ;
          if(Object.prototype.toString.call(alldir) === "[object Array]"){
              this.allDir = alldir;
          }else if(Object.prototype.toString.call(alldir) === "[object Object]"){
              this.allDir = [alldir];
          }
	  // Populate Versions
          _.each(this.allDir, function(obj, i){
            let ver: any[] = [];
                if(_.isArray(obj['Contents'])) {
                  _.each(obj['Contents'], function(item, verCount){ 
                    item.size = Utils.getDisplayCapacity(item.Size,2,'KB');
                    if((verCount+1) < obj['Contents'].length){
                      ver.push(obj['Contents'][verCount+1]);
                    }
                    
                  })
                 obj['Versions'] = ver;
                } else {
                  obj['Contents'] = [obj['Contents']];
                }
                
          });
          //The depth of the clone
          let backupAllDir = JSON.parse( JSON.stringify( this.allDir ) );
          this.resolveObject();
          //Data in folder
          if(this.folderId !=""){
            if(!this.folderId.endsWith(this.colon)){
              this.folderId = this.folderId + this.colon;
            }
            this.allDir = this.allDir.filter(arr=>{
              let folderContain = false;
              if(arr.Contents[0].Key.substring(0,this.folderId.length) == this.folderId && arr.Contents[0].Key.length > this.folderId.length){
                // The number of occurrences of ":" in the folder
                let folderNum = (this.folderId.split(this.colon)).length-1;
                let ObjectKeyNum = (arr.Contents[0].Key.split(this.colon)).length-1;
                if(folderNum == ObjectKeyNum){
                  //Identify the file in the folder
                  folderContain = true;
                }else if(ObjectKeyNum == folderNum + 1){
                  //Identify folders within folders
                  let lastNum = arr.Contents[0].Key.lastIndexOf(this.colon);
                  if(lastNum == arr.Contents[0].Key.length -1){
                    folderContain = true;
                  }
                }
              }
              return folderContain;
            })
            this.allDir.forEach(val=>{
              val.Key = val.Key.slice(this.folderId.length);
            })
          }else{
            //Distinguish between folders and files at the first level
            this.allDir = this.allDir.filter(item=>{
              let folderIndex = false;
              if(item.Contents[0].Key.indexOf(this.colon) !=-1){
                let index;
                index = item.Contents[0].Key.indexOf(this.colon,index);
                //Distinguish between folders and files in folders
                if(index == item.Contents[0].Key.length-1){
                  folderIndex = true;
                }
              }
              return item.Contents[0].Key.indexOf(this.colon) ==-1 || folderIndex;
            })
          }
          let folderArray = [];
          this.allFolderNameForCheck = [];
          this.allDir.forEach(item=>{
            item.size = Utils.getDisplayCapacity(item.Contents[0].Size,2,'KB');
            item.lastModified = new Date(item.Contents[0].LastModified).toUTCString();
            item.Location = item.Contents[0].Location;
            item.Tier = "Tier_" + item.Contents[0].Tier + " (" + item.Contents[0].StorageClass + ")";
            if(item.Contents[0].Key.indexOf(this.colon) !=-1){
              item.objectName = item.Contents[0].Key.slice(0,item.Contents[0].Key.lastIndexOf(this.colon));
              this.allFolderNameForCheck.push(item.objectName);
              item.newFolder = true;
              item.disabled = false;
              item.size = "--";
              backupAllDir.forEach(arr=>{
                if(this.folderId !=""){
                  let hasFolder = arr.Contents[0].Key.indexOf(this.folderId) !=-1 && arr.Contents[0].Key != this.folderId;
                  if( hasFolder){
                    let newArrKey = arr.Contents[0].Key.slice(this.folderId.length);
                    if(newArrKey.slice(0,item.Contents[0].Key.length) == item.Contents[0].Key && newArrKey != item.Contents[0].Key){
                      item.disabled = true
                    }
                  }
                }else{
                  let hasFile = arr.Contents[0].Key.indexOf(item.Contents[0].Key) !=-1 && arr.Contents[0].Key != item.Contents[0].Key;
                  if(hasFile && arr.Contents[0].Key.slice(0,item.Contents[0].Key.length) == item.Contents[0].Key){
                    item.disabled = true
                  }
                }
              })
            }else{
              item.objectName = item.Contents[0].Key;
              item.newFolder = false;
              item.disabled = false;
            }
          })
        });
        })
    })
    window.sessionStorage['folderId'] = ""
    window.sessionStorage['headerTag'] = ""
  }
  //Resolve objects with file directories that are not manually uploaded
  resolveObject(){
    let set = new Set();
    this.allDir.forEach((item,index)=>{
      let includeIndex = item.Contents[0].Key.indexOf(this.colon);
      if(includeIndex != -1 && includeIndex < item.Contents[0].Key.length-1){
        while(includeIndex > -1){
          set.add(item.Contents[0].Key.substr(0,includeIndex+1));
          includeIndex = item.Contents[0].Key.indexOf(this.colon, includeIndex+1);
        }
      }
    })
    this.allDir.forEach(it=>{
      set.delete(it.Contents[0].Key);
    })
    set.forEach(item=>{
      let defaultObject = lodash.cloneDeep(this.allDir[0]);
      defaultObject.Contents[0].Key = item;
      this.allDir.push(defaultObject);
    })
  }
  //Request header with AK/SK authentication added
  getSignature(options) {
    let SignatureObjectwindow = window['getSignatureKey']();
    let requestObject = this.BucketService.getSignatureOptions(SignatureObjectwindow,options);
    options = requestObject['options'];
    this.Signature = requestObject['Signature'];
    this.kDate = requestObject['kDate'];
    return options;
  }
  getTypes() {
    this.allTypes = [];
    this.BucketService.getTypes().subscribe((res) => {
        res.json().types.forEach(element => {
            this.allTypes.push({
                label: Consts.CLOUD_TYPE_NAME[element.name],
                value: element.name
            })
        });
    });
  }
  getBackendsByTypeId() {
    this.backendsOption = [];
    this.BucketService.getBackendsByTypeId(this.uploadForm.value.backend_type).subscribe((res) => {
        let backends = res.json().backends ? res.json().backends :[];
        backends.forEach(element => {
            this.backendsOption.push({
                label: element.name,
                value: element.name
            })
        });
    });
  }
  showDetail(){
    if(this.selectedSpecify.length !== 0){
      this.showBackend = true;
    }else{
      this.showBackend = false;
    }
  }
  selectedFileOnChanged(event: any) {
    if(event.target.files[0]){
      let file = event.target.files[0];
      this.selectFile = file;
      this.selectFileName = this.selectFile.name;
      this.showErrorMsg = false;
      this.files = file;
    }
  }

  configUpload(from){
    switch(from){
      case 'fromFolder':
        this.createFolderForm.reset();
        this.showCreateFolder = true;
        this.createFolderForm.controls['name'].setValidators([Validators.required,Utils.isExisted(this.allFolderNameForCheck),Validators.pattern(this.validRule.name)]);
        let user =document.getElementById("folder");
        break;
      case 'upload':
        this.showErrorMsg = false;
        this.uploadDisplay = true;
        this.showBackend = false;
        this.uploadForm.reset();
        this.selectedSpecify = [];
        this.files = '';
        this.selectFile = '';
        this.selectFileName = '';
      break;
    }
    
  }

  uploadFile() {
    if(!this.files){
      this.showErrorMsg = true;
      return;
    }
    let headers = new Headers();
    headers.append('Content-Type', 'application/xml');
    if(this.showBackend){
      if(!this.uploadForm.valid){
          for(let i in this.uploadForm.controls){
              this.uploadForm.controls[i].markAsTouched();
          }
          return;
      }
      headers.append('x-amz-storage-class',this.uploadForm.value.backend);
    }
    let options = {
      headers: headers,
      timeout:Consts.TIMEOUT
    };

    this.uploadDisplay = false;
    this.isUpload = true;
    if(this.selectFile['size'] > this.UPLOAD_UPPER_LIMIT){
      this.msg.info("Uploading files larger than 2GB is not supported");
      this.isUpload = false;
    }else{
      window['startUpload'](this.selectFile, this.bucketId, options,this.folderId, ()=>{
        this.isUpload = false;
        this.getAlldir();
      });
    }
  }

  downloadFile(file) {
    let fileObjectKey;
    if(this.folderId !=""){
      fileObjectKey = this.folderId + file.Contents[0].Key;
    }else{
      fileObjectKey = file.Contents[0].Key;
    }
    let downloadUrl = `${this.BucketService.url}/${this.bucketId}/${fileObjectKey}`;
    window['getAkSkList'](()=>{
      let requestMethod = "GET";
      let url = downloadUrl;
      window['canonicalString'](requestMethod, url,()=>{
        let options: any = {};
        this.getSignature(options);
        window['load'](file.Contents[0].Key,file.Contents[0].ETag)
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);    
        xhr.responseType = "arraybuffer";
        xhr.setRequestHeader('Authorization', this.Signature)
        xhr.setRequestHeader('X-Auth-Date', this.kDate)
        let msgs = this.msg
        xhr.onload = function () {
          if ((this as any).status === 200) {
            let res = (this as any).response;
            let blob = new Blob([res]);
            var reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = ()=>{
              if (typeof window.navigator.msSaveBlob !== 'undefined') {  
              window.navigator.msSaveBlob(blob, file.Contents[0].Key);
            } else {
              let URL = window.URL
              let objectUrl = URL.createObjectURL(blob)
            if (file.Contents[0].Key) {
                let a = document.createElement('a')
                a.href = objectUrl
              a.download = file.Contents[0].Key
                document.body.appendChild(a)
                a.click()
                a.remove()
                }else {
                  navigator.msSaveBlob(blob);
                }
              }
            }
            window['disload'](file.Contents[0].Key,file.Contents[0].ETag)
            msgs.success(`${file.Contents[0].Key} downloaded successfully`)
          }else{
            window['disload'](file.Contents[0].Key,file.Contents[0].ETag)
            msgs.error(`${file.Contents[0].Key} download failed. The network may be unstable. Please try again later.`);
          }
        };
        xhr.send()
        xhr.onerror = ()=>{
          window['disload'](file.Contents[0].Key,file.Contents[0].ETag)
          msgs.error(`${file.Contents[0].Key} download failed. The network may be unstable. Please try again later.`);
        }
        xhr.onloadend=()=>{
          window['disload'](file.Contents[0].Key)
        }
      })
    });
  }
  //Gets the name of the folder
  folderNameOnChanged(folder){
    if(folder.value.name){
      let name = folder.value.name;
      this.createFolderForm.value.name = name;
    }
  }
  createFolder(){
    if(!this.createFolderForm.valid){
      for(let i in this.createFolderForm.controls){
          this.createFolderForm.controls[i].markAsTouched();
      }
      return;
    }
    let folderName;
    if(this.folderId !=""){
      folderName = this.folderId + this.createFolderForm.value.name + this.colon;
    }else{
      folderName = this.createFolderForm.value.name + this.colon;
    }
    window['getAkSkList'](()=>{
      let requestMethod = "PUT";
      let url = this.BucketService.url + "/" + this.bucketId+ '/' +folderName;
      window['canonicalString'](requestMethod, url,()=>{
        let options: any = {};
        this.getSignature(options);
        options.headers.set('Content-Type','application/xml');
        this.BucketService.uploadFile(this.bucketId+ '/' +folderName,"",options).subscribe((res) => {
          this.showCreateFolder = false;
          this.getAlldir();
        });
      })
    })
  }
  deleteMultiDir(){
    let msg = "<div>Are you sure you want to delete the Files ?</div><h3>[ "+ this.selectedDir.length +" ]</h3>";
    let header ="Delete";
    let acceptLabel = "Delete";
    let warming = true;
    this.confirmDialog([msg,header,acceptLabel,warming,"deleteMilti"],this.selectedDir);
  }
  deleteFile(file){
    let fileObjectKey;
    if(file.Contents[0].Key.indexOf(this.colon) !=-1){
      fileObjectKey = file.Contents[0].Key.slice(0,file.Contents[0].Key.length-1);
    }else{
      fileObjectKey = file.Contents[0].Key;
    }
    let msg = "<div>Are you sure you want to delete the File ?</div><h3>[ "+ fileObjectKey +" ]</h3>";
    let header ="Delete";
    let acceptLabel = "Delete";
    let warming = true;
    this.confirmDialog([msg,header,acceptLabel,warming,"delete"], file)
  }

  confirmDialog([msg,header,acceptLabel,warming=true,func], file){
      this.confirmationService.confirm({
          message: msg,
          header: header,
          acceptLabel: acceptLabel,
          isWarning: warming,
          accept: ()=>{
              try {
                switch(func){
                  case "delete":
                    let objectKey = file.Contents[0].Key;
                    //If you want to delete files from a folder, you must include the name of the folder
                    if(this.folderId !=""){
                      objectKey = this.folderId + objectKey;
                    }
                    window['getAkSkList'](()=>{
                      let requestMethod = "DELETE";
                      let url = this.BucketService.url + `/${this.bucketId}/${objectKey}`;
                      window['canonicalString'](requestMethod, url,()=>{
                        let options: any = {};
                        this.getSignature(options);
                        this.BucketService.deleteFile(`/${this.bucketId}/${objectKey}`,options).subscribe((res) => {
                          this.getAlldir();this.msgs = [];
                          this.msgs.push({severity: 'success', summary: 'Success', detail: 'Object deleted successfully.'});
                        },(error)=>{
                          this.msgs = [];
                          this.msgs.push({severity: 'error', summary: "Error", detail: error._body});
                      });
                      })
                    })
                    
                    break;
                  case "deleteMilti":
                   file.forEach(element => {
                      let objectKey = element.Contents[0].Key;
                      //If you want to delete files from a folder, you must include the name of the folder
                      if(this.folderId !=""){
                        objectKey = this.folderId + objectKey;
                      }
                      window['getAkSkList'](()=>{
                        let requestMethod = "DELETE";
                        let url = this.BucketService.url + `/${this.bucketId}/${objectKey}`;
                        window['canonicalString'](requestMethod, url,()=>{
                          let options: any = {};
                          this.getSignature(options);
                          this.BucketService.deleteFile(`/${this.bucketId}/${objectKey}`,options).subscribe((res) => {
                            this.getAlldir();
                            this.msgs.push({severity: 'success', summary: 'Success', detail: 'Objects deleted successfully.'});
                          },(error)=>{
                            this.msgs = [];
                            this.msgs.push({severity: 'error', summary: "Error", detail: error._body});
                        });
                        }) 
                      })
                   });
                    break;
                }
              }
              catch (e) {
                  console.log(e);
              }
              finally {
                  
              }
          },
          reject:()=>{}
      })
  }
  tablePaginate() {
      this.selectedDir = [];
  }
  passHeaderTag() {
    window.sessionStorage['headerTag'] =JSON.stringify(this.items);
  }
}
