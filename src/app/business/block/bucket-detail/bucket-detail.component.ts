import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute} from '@angular/router';
import { I18NService, Utils, MsgBoxService, HttpService, Consts} from 'app/shared/api';
import { BucketService} from '../buckets.service';
import { MenuItem ,ConfirmationService} from '../../../components/common/api';
import { HttpClient } from '@angular/common/http';
import {XHRBackend, RequestOptions, Request, RequestOptionsArgs, Response, Headers, BaseRequestOptions } from '@angular/http';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { BaseRequestOptionsArgs } from 'app/shared/service/api';

declare let X2JS:any;

@Component({
  selector: 'bucket-detail',
  templateUrl: './bucket-detail.component.html',
  styleUrls: [

  ],
  providers: [ConfirmationService, MsgBoxService],
})
export class BucketDetailComponent implements OnInit {
  isUpload = window['isUpload'];
  selectFile;
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
  UPLOAD_UPPER_LIMIT = 1024*1024*1024*2;
  errorMessage = {
    "backend_type": { required: "Type is required." },
    "backend": { required: "Backend is required." }
  };
  uploadForm :FormGroup;
  files;
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
      "name": ['', Validators.required]
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
        url: ["bucketDetail", this.bucketId],
      });
      this.getAlldir();
      this.allTypes = [];
      this.getTypes();
    }
    );
  }
  getAlldir(){
    this.selectedDir = [];
    this.BucketService.getBucketById(this.bucketId).subscribe((res) => {
      let str = res._body;
      let x2js = new X2JS();
      let jsonObj = x2js.xml_str2json(str);
      let alldir = jsonObj.ListObjectResponse.ListObjects ? jsonObj.ListObjectResponse.ListObjects :[] ;
      if(Object.prototype.toString.call(alldir) === "[object Array]"){
          this.allDir = alldir;
      }else if(Object.prototype.toString.call(alldir) === "[object Object]"){
          this.allDir = [alldir];
      }
      this.allDir.forEach(item=>{
        item.size = Utils.getDisplayCapacity(item.Size,2,'KB');
        item.lastModified = Utils.formatDate(item.LastModified);
      });
    });
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
      this.showErrorMsg = false;
      this.files = file;
    }
  }

  configUpload(){
    this.showErrorMsg = false;
    this.uploadDisplay = true;
    this.showBackend = false;
    this.uploadForm.reset();
    this.selectedSpecify = [];
    this.files = '';
    this.selectFile = '';
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
      window['startUpload'](this.selectFile, this.bucketId, options, ()=>{
        this.isUpload = false;
        this.getAlldir();
      });
    }
  }

  downloadFile(file) {
    this.httpClient.get(`v1/s3/${this.bucketId}/${file.ObjectKey}`, {responseType: 'arraybuffer'}).subscribe((res)=>{
      let blob = new Blob([res]);
      if (typeof window.navigator.msSaveBlob !== 'undefined') {  
          window.navigator.msSaveBlob(blob, file.ObjectKey);
      } else {
        let URL = window.URL
        let objectUrl = URL.createObjectURL(blob)
        if (file.ObjectKey) {
          let a = document.createElement('a')
          a.href = objectUrl
          a.download = file.ObjectKey
          document.body.appendChild(a)
          a.click()
          a.remove()
        }
      }
    },
    (error)=>{
      console.log('error');
      this.msg.error("The download failed. The network may be unstable. Please try again later.");
    });
  }
  showDialog(from){
    switch(from){
      case 'fromFolder':
        this.createFolderForm.reset();
        this.showCreateFolder = true;
        break;
    }
  }
  createFolder(){
    if(!this.createFolderForm.valid){
      for(let i in this.createFolderForm.controls){
          this.createFolderForm.controls[i].markAsTouched();
      }
      return;
    }
    this.BucketService.uploadFile(this.bucketId+'/test/').subscribe((res) => {
      this.showCreateFolder = false;
      this.getAlldir();
    });
  }
  deleteMultiDir(){
    let msg = "<div>Are you sure you want to delete the Files ?</div><h3>[ "+ this.selectedDir.length +" ]</h3>";
    let header ="Delete";
    let acceptLabel = "Delete";
    let warming = true;
    this.confirmDialog([msg,header,acceptLabel,warming,"deleteMilti"],this.selectedDir);
  }
  deleteFile(file){
    let msg = "<div>Are you sure you want to delete the File ?</div><h3>[ "+ file.ObjectKey +" ]</h3>";
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
                    let objectKey = file.ObjectKey;
                    this.BucketService.deleteFile(`/${this.bucketId}/${objectKey}`).subscribe((res) => {
                        this.getAlldir();
                    });
                    break;
                  case "deleteMilti":
                   file.forEach(element => {
                      let objectKey = element.ObjectKey;
                      this.BucketService.deleteFile(`/${this.bucketId}/${objectKey}`).subscribe((res) => {
                        this.getAlldir();
                      });
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

}
