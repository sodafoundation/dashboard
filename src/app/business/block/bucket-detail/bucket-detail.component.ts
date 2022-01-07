import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute} from '@angular/router';
import { I18NService, Utils, MsgBoxService, HttpService, Consts} from 'app/shared/api';
import { BucketService} from '../buckets.service';
import { MenuItem ,ConfirmationService, Message} from '../../../components/common/api';
import { HttpClient } from '@angular/common/http';
import {XHRBackend, RequestOptions, Request, RequestOptionsArgs, Response, Headers, BaseRequestOptions } from '@angular/http';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { BaseRequestOptionsArgs } from 'app/shared/service/api';

declare let X2JS:any;
let lodash = require('lodash');
let _ = require("underscore");

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
  enableArchival = false;
  buketName:string="";
  bucketId:string="";
  bucketLocation: any;
  bucketBackendType: any;
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
  archiveTierOptions: any[];
  restoreObjectForm: FormGroup;
  restoreDisplay = false;
  restoreOptions: any = [];
  selectRestoreOptions: any;
  showErrorMsg = false;
  isReadyCopy = true;
  isReadyPast = true;
  UPLOAD_UPPER_LIMIT = 1024 * 1024 * 1024 * 2;
  moreItems = [];
  copySelectedDir = [];
  msgs: Message[];
  allBackends: any[];
  archivalEnabled: any = {};
  isPasting: boolean = false;
  servicePlansEnabled: boolean;
  errorMessage = {
    "backend_type": { required: "Type is required." },
    "backend": { required: "Backend is required." },
    "name": {
      required: "name is required.",
      isExisted:"Name is existing",
      pattern: "Folder names cannot contain the following names/:"
    },
    "archive_tier" : {
      required: "Tier is required"
    }
  };
  validRule= {
    'name':/^((?!\/|:).)*$/
  };
  uploadForm :FormGroup;
  files;
  allFolderNameForCheck = [];

  progressValue: number = 0;

  restoreObjectFormLabel = {
    "days" : "Days",
    "tier" : "Retrieval Tier",
    "storageClass" : "Storage Class"
  }

  restoreObjectErrorMsg = {
    "days": {
      required: "Days are requried"
    },
    "tier":{
      required: "Retrieval tier is required"
    },
    "storageClass":{
      required: "Storage Class is required"
    }
  };
  restoreFormItemsCopy = [];
  restoreFormItems = [
    {
      label: 'Days',
      required: 'true',
      id: 'days',
      type: 'number',
      options: [],
      name: 'days',
      formControlName: 'days',
      value: 1,
      arr:['aws-s3']
    },
    {
      label: 'Tier',
      required: 'true',
      id: 'tier',
      type: 'select',
      options: [],
      name: 'tier',
      formControlName: 'tier',
      arr:['aws-s3']
    },
    {
      label: 'Storage Class',
      required: 'true',
      id: 'storage-class',
      type: 'select',
      options: [],
      name: 'storage-class',
      formControlName: 'storageClass',
      arr:['azure-blob']
    }
  ];
  
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
    this.servicePlansEnabled = Consts.STORAGE_SERVICE_PLAN_ENABLED;
    this.createFolderForm = this.fb.group({
      "name": ["",{validators:[Validators.required,Utils.isExisted(this.allFolderNameForCheck),Validators.pattern(this.validRule.name)], updateOn:'change'}]
    });
    this.uploadForm = this.fb.group({
        
    });
    this.restoreObjectForm = this.fb.group({
      "days":new FormControl([]),
      "tier":new FormControl([]),
      "storageClass": new FormControl([])
  });
  }

  ngOnInit() {
    this.ActivatedRoute.params.subscribe((params) => {
      this.bucketId = params.bucketId;
      this.bucketLocation = params.bucketLocation;
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
    
    this.allBackends = [];
    if(this.servicePlansEnabled){
      this.archivalEnabled = true;
    }else{
      this.BucketService.getBckends().subscribe((res) => {
        this.allBackends = res.json().backends;
          this.allBackends.forEach(element => {
              if(element['name'] == this.bucketLocation){
                this.bucketBackendType = element['type'];
                if(Consts.STORAGE_CLASSES[this.bucketBackendType]){
                  this.archivalEnabled[this.bucketBackendType] = true;
                  this.restoreOptions = Consts.RETRIEVAL_OPTIONS[this.bucketBackendType];
                }
              }
          });
      });
      
    }
    
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
    this.isPasting = true;
    this.msgs = [];
    this.copySelectedDir.forEach(item=>{
      let key = this.folderId != "" ? this.folderId + item.Key : item.Key;
      let copySource = item.folderId != "" ? item.source + '/' + item.folderId + item.Key : 
      item.source + '/' + item.Key;
      let sourceBucket = item.source;
      window['getAkSkList'](() => {
          let requestMethod = "PUT";
          let url = "/" + this.bucketId + '/' + key;
          let requestOptions: any;
          let options: any = {};
          let contentHeaders = {
            'x-amz-copy-source' : copySource,
            'X-Amz-Metadata-Directive' : ''
          }
          if(sourceBucket != this.bucketId){
            //Copy between different buckets
            contentHeaders['X-Amz-Metadata-Directive'] = 'COPY';
          }else{
            //Copy in the same bucket
            contentHeaders['X-Amz-Metadata-Directive'] = 'REPLACE';
          }
          requestOptions = window['getSignatureKey'](requestMethod, url, '', '', '', '', '', '', contentHeaders) ;
          options['headers'] = new Headers();
          options = this.BucketService.getSignatureOptions(requestOptions, options);
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
          let pastedObjectTitle = key + ' pasted.';
          let pastedObjectMessage = key + ' will be available in the destination bucket shortly.';
          this.msgs.push({severity: 'success', summary: pastedObjectTitle, detail: pastedObjectMessage});
          this.BucketService.copyObject(this.bucketId + '/' + key, '', options).subscribe((res) => {
            this.isReadyPast = true;
            window.sessionStorage['searchIndex'] = "";
            this.getAlldir();
            this.isPasting = false;
          }, (error)=>{
            window.sessionStorage['searchIndex'] = "";
            this.isPasting = false;
            let pastedObjectMessage = 'Object' + key + 'could not be pasted. ' + error._body;
            this.msgs.push({severity: 'error', summary: 'Error', detail: pastedObjectMessage});
          });
      })
    })
  }
  //Click on folder
  folderLink(file){
    let folderKey = file.Key;
    if(this.folderId !== null && this.folderId !== ""){
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
        let url = '/' + this.bucketId;
        let requestOptions: any;
        let options: any = {};
        requestOptions = window['getSignatureKey'](requestMethod, url);
        options['headers'] = new Headers();
        options = this.BucketService.getSignatureOptions(requestOptions, options);
        this.BucketService.getBucketById(this.bucketId,options).subscribe((res) => {
          let str = res._body;
          let x2js = new X2JS();
          let jsonObj = x2js.xml_str2json(str);
          let alldir = jsonObj.ListBucketResult.Contents ? jsonObj.ListBucketResult.Contents :[] ;
          if(Object.prototype.toString.call(alldir) === "[object Array]"){
              this.allDir = alldir;
          }else if(Object.prototype.toString.call(alldir) === "[object Object]"){
              this.allDir = [alldir];
          }
          //The depth of the clone
          let backupAllDir = JSON.parse( JSON.stringify( this.allDir ) );
          this.resolveObject();
          //Data in folder
          if(this.folderId && this.folderId !=""){
            if(!this.folderId.endsWith(this.colon)){
              this.folderId = this.folderId + this.colon;
            }
            this.allDir = this.allDir.filter(arr=>{
              let folderContain = false;
              if(arr.Key.substring(0,this.folderId.length) == this.folderId && arr.Key.length > this.folderId.length){
                // The number of occurrences of ":" in the folder
                let folderNum = (this.folderId.split(this.colon)).length-1;
                let ObjectKeyNum = (arr.Key.split(this.colon)).length-1;
                if(folderNum == ObjectKeyNum){
                  //Identify the file in the folder
                  folderContain = true;
                }else if(ObjectKeyNum == folderNum + 1){
                  //Identify folders within folders
                  let lastNum = arr.Key.lastIndexOf(this.colon);
                  if(lastNum == arr.Key.length -1){
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
              if(item.Key.indexOf(this.colon) !=-1){
                let index;
                index = item.Key.indexOf(this.colon,index);
                //Distinguish between folders and files in folders
                if(index == item.Key.length-1){
                  folderIndex = true;
                }
              }
              return item.Key.indexOf(this.colon) ==-1 || folderIndex;
            })
          }
          let folderArray = [];
          this.allFolderNameForCheck = [];
          this.allDir.forEach(item=>{
            item.size = Utils.getDisplayCapacity(item.Size,2,'KB');
            item.lastModified = new Date(item.LastModified).toUTCString();
            item.Location = item.Location;
            item.Tier = "Tier_" + item.Tier + " (" + item.StorageClass + ")";
            if(item.Key.indexOf(this.colon) !=-1){
              item.objectName = item.Key.slice(0,item.Key.lastIndexOf(this.colon));
              this.allFolderNameForCheck.push(item.objectName);
              item.newFolder = true;
              item.disabled = false;
              item.size = "--";
              backupAllDir.forEach(arr=>{
                if(this.folderId !=""){
                  let hasFolder = arr.Key.indexOf(this.folderId) !=-1 && arr.Key != this.folderId;
                  if( hasFolder){
                    let newArrKey = arr.Key.slice(this.folderId.length);
                    if(newArrKey.slice(0,item.Key.length) == item.Key && newArrKey != item.Key){
                      item.disabled = true
                    }
                  }
                }else{
                  let hasFile = arr.Key.indexOf(item.Key) !=-1 && arr.Key != item.Key;
                  if(hasFile && arr.Key.slice(0,item.Key.length) == item.Key){
                    item.disabled = true
                  }
                }
              })
            }else{
              item.objectName = item.Key;
              item.newFolder = false;
              item.disabled = false;
            }
          })
        });

    })
    window.sessionStorage['folderId'] = ""
    window.sessionStorage['headerTag'] = ""
  }
  //Resolve objects with file directories that are not manually uploaded
  resolveObject(){
    let set = new Set();
    this.allDir.forEach((item,index)=>{
      let includeIndex = item.Key.indexOf(this.colon);
      if(includeIndex != -1 && includeIndex < item.Key.length-1){
        while(includeIndex > -1){
          set.add(item.Key.substr(0,includeIndex+1));
          includeIndex = item.Key.indexOf(this.colon, includeIndex+1);
        }
      }
    })
    this.allDir.forEach(it=>{
      set.delete(it.Key);
    })
    set.forEach(item=>{
      let defaultObject = lodash.cloneDeep(this.allDir[0]);
      defaultObject.Key = item;
      this.allDir.push(defaultObject);
    })
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

  //Show Restore Form
  showRestoreObject(file){
    this.selectFileName = file.Key;
    if(!this.servicePlansEnabled){
      this.restoreDisplay = true;
      this.restoreFormCreate(this.bucketBackendType);
    } else{
      this.restoreObject();
    }    
    
  }

  restoreFormCreate(type){
    this.restoreFormItemsCopy = []
    this.restoreFormItems.forEach((item)=>{
      if(item.type=='select'){
        item.options = this.restoreOptions;
      }
      item.arr.forEach((it)=>{
          if(it == type){
              this.restoreFormItemsCopy.push(item)
              this.restoreObjectForm.controls[`${item.formControlName}`].setValidators(Validators.required);
          }else{
              this.restoreObjectForm.controls[`${item.formControlName}`].setValidators([]);
          }
      })
    })
    this.restoreObjectForm.updateValueAndValidity();
  }
  cancelRestore(){
    this.restoreDisplay = false;
    switch (this.bucketBackendType) {
      case 'aws-s3':
          this.restoreObjectForm.reset({
            "days" : 1
          });  
          break;
      case 'azure-blob':
          this.restoreObjectForm.reset(); 
          break;
      default:
        break;
    }
    
  }
  
  restoreObject(value?){
    let params = {};
    
    if(!this.servicePlansEnabled){
      switch (this.bucketBackendType) {
        case 'aws-s3':
          params = {
            "days" : value.days,
            "tier" : value.tier
          };  
          break;
        case 'azure-blob':
          params = {
            "storageClass" : value.storageClass
          };
          break;
        default:
          break;
      }
    }
    
      
    window['getAkSkList'](()=>{
      let requestMethod = "POST";
      let url = '/' + this.bucketId + '/' + this.selectFileName + '?restore';
      let requestOptions: any;
      let options: any = {};
      let contentHeaders = {
        'Content-Type' : 'application/json',
        'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD'
      };
      requestOptions = window['getSignatureKey'](requestMethod, url, '', '', '', '', '', '', contentHeaders);
      
      options['headers'] = new Headers();
      
      options = this.BucketService.getSignatureOptions(requestOptions, options);
      
      this.BucketService.restoreObject(this.bucketId + '/' + this.selectFileName, params, options).subscribe((res)=>{
        this.restoreDisplay = false;
        if(!this.servicePlansEnabled){
          this.restoreObjectForm.reset({
            "days" : 1
          });
        }        
        this.msgs = [];
        this.msgs.push({severity: 'success', summary: 'Success', detail: 'Object restoration has been initiated successfully. Object will be available for download shortly.'});
      },
      (error)=>{
        this.restoreDisplay = false;
        if(!this.servicePlansEnabled){
          this.restoreObjectForm.reset({
            "days" : 1
          });
        }
        this.msgs = [];
        this.msgs.push({severity: 'error', summary: "Error", detail: error._body});
      })
  })

    
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
        this.archiveTierOptions = Consts.STORAGE_CLASSES[this.bucketBackendType];
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
    if(this.enableArchival){
      if(this.servicePlansEnabled){
        headers.append('X-Amz-Storage-Class','Archive');
      } else{
        headers.append('X-Amz-Storage-Class',this.uploadForm.value.archive_tier);  
      }
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
        this.enableArchival = false;
        this.uploadForm.reset();
        this.getAlldir();
      });
    }
  }

  archivalControl(e){
    if(e.checked && !this.servicePlansEnabled){
      this.uploadForm.addControl('archive_tier', this.fb.control("", Validators.required));
    } else{
      if(this.uploadForm.controls['archive_tier']){
        this.uploadForm.removeControl('archive_tier');
      }      
    }
  }

  cancelUpload(){
    this.uploadDisplay = false;
    this.enableArchival = false;
    this.uploadForm.reset();
  }
  downloadFile(file) {
    let fileObjectKey;
    let fileString: any;
    let fileContent: any;
    if(this.folderId !=""){
      fileObjectKey = this.folderId + file.Key;
    }else{
      fileObjectKey = file.Key;
    }
    let downloadUrl = this.BucketService.url + `${this.bucketId}/${fileObjectKey}`;
    window['getAkSkList'](()=>{
      
        let requestMethod = "GET";
        let url = '/' + this.bucketId + '/' + fileObjectKey;
        let requestOptions: any;
        let options: any = {};
        requestOptions = window['getSignatureKey'](requestMethod, url);
        options['headers'] = new Headers();
        options = this.BucketService.getSignatureOptions(requestOptions, options);
        window['load'](file.Key,file.ETag)
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.open('GET', downloadUrl, true);    
        xhr.responseType = "arraybuffer";
        xhr.setRequestHeader('Content-Type', requestOptions.headers['Content-Type']);
        xhr.setRequestHeader('X-Auth-Token', requestOptions.headers['X-Auth-Token']);
        xhr.setRequestHeader('X-Amz-Content-Sha256', requestOptions.headers['X-Amz-Content-Sha256']);
        xhr.setRequestHeader('X-Amz-Date', requestOptions.headers['X-Amz-Date']);
        xhr.setRequestHeader('Authorization', requestOptions.headers['Authorization']);
        let msgs = this.msg
        xhr.onload = function () {
          if ((this as any).status === 200) {
            let res = (this as any).response;
            let blob = new Blob([res]);
            var reader = new FileReader();
            reader.readAsArrayBuffer(blob);
            reader.onload = ()=>{
              let binary: any = "";
              fileContent = reader.result;
              let bytes = new Uint8Array(fileContent);
              let length = bytes.byteLength;
              for (var i = 0; i < length; i++) {
                  binary += String.fromCharCode(bytes[i]);
              }
              fileString = binary;
              if (typeof window.navigator.msSaveBlob !== 'undefined') {  
              window.navigator.msSaveBlob(blob, file.Key);
            } else {
              let URL = window.URL
              let objectUrl = URL.createObjectURL(blob)
              if (file.Key) {
                let a = document.createElement('a')
                a.href = objectUrl
                a.download = file.Key
                document.body.appendChild(a)
                a.click()
                a.remove()
                }else {
                  navigator.msSaveBlob(blob);
                }
              }
            }
            window['disload'](file.Key,file.ETag)
            msgs.success(`${file.Key} downloaded successfully`)
          }else{
            window['disload'](file.Key,file.ETag)
            msgs.error(`${file.Key} download failed. The network may be unstable. Please try again later.`);
          }
        };
        xhr.send()
        xhr.onerror = ()=>{
          window['disload'](file.Key,file.ETag)
          msgs.error(`${file.Key} download failed. The network may be unstable. Please try again later.`);
        }
        xhr.onloadend=()=>{
          window['disload'](file.Key)
        }
        xhr.onprogress = (event) => {
          let done = event.loaded;
          let total =  event.total;
          let progress = Math.floor(done/total*100)
          window['downloadProgress'](progress);
      }
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
        let url = "/" + this.bucketId+ '/' +folderName;
        let requestOptions: any;
        let options: any = {};
        requestOptions = window['getSignatureKey'](requestMethod, url);
        options['headers'] = new Headers();
        options = this.BucketService.getSignatureOptions(requestOptions, options);
        options.headers.set('Content-Type','application/xml');
        this.BucketService.uploadFile(this.bucketId+ '/' +folderName,"",options).subscribe((res) => {
          this.showCreateFolder = false;
          this.getAlldir();
        });
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
    if(file.Key.indexOf(this.colon) !=-1){
      fileObjectKey = file.Key.slice(0,file.Key.length-1);
    }else{
      fileObjectKey = file.Key;
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
                    let objectKey = file.Key;
                    //If you want to delete files from a folder, you must include the name of the folder
                    if(this.folderId !=""){
                      objectKey = this.folderId + objectKey;
                    }
                    window['getAkSkList'](()=>{
                      
                        let requestMethod = "DELETE";
                        let url = '/' + `${this.bucketId}/${objectKey}`;
                        let requestOptions: any;
                        let options: any = {};
                        requestOptions = window['getSignatureKey'](requestMethod, url);
                        options['headers'] = new Headers();
                        options = this.BucketService.getSignatureOptions(requestOptions, options);
                        this.BucketService.deleteFile(`${this.bucketId}/${objectKey}`,options).subscribe((res) => {
                          this.getAlldir();
                          this.msgs = [];
                          this.msgs.push({severity: 'success', summary: 'Success', detail: file.Key + ' has been deleted successfully.'});
                        }, (error)=>{
                          this.msgs = [];
                          this.msgs.push({severity: 'error', summary: "Error deleting " + file.Key, detail: error._body});
                        });
                    })
                    
                    break;
                  case "deleteMilti":
                    this.msgs = [];
                   file.forEach(element => {
                      let objectKey = element.Key;
                      //If you want to delete files from a folder, you must include the name of the folder
                      if(this.folderId !=""){
                        objectKey = this.folderId + objectKey;
                      }
                      window['getAkSkList'](()=>{
                        
                        let requestMethod = "DELETE";
                        let url = '/' + `${this.bucketId}/${objectKey}`;
                        let requestOptions: any;
                        let options: any = {};
                        requestOptions = window['getSignatureKey'](requestMethod, url);
                        options['headers'] = new Headers();
                        options = this.BucketService.getSignatureOptions(requestOptions, options);
                          this.BucketService.deleteFile(`${this.bucketId}/${objectKey}`,options).subscribe((res) => {
                          this.getAlldir();
                          this.msgs.push({severity: 'success', summary: 'Success', detail: element.Key + ' has been deleted successfully.'});
                        }, (error)=>{
                          this.msgs.push({severity: 'error', summary: "Error deleting " + element.Key, detail: error._body});
                        });
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
