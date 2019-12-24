import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener, Input } from '@angular/core';
import { I18NService, MsgBoxService, HttpService, Utils } from 'app/shared/api';
import { BucketService } from '../../buckets.service';
import { ConfirmationService, ConfirmDialogModule } from '../../../../components/common/api';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { I18nPluralPipe } from '@angular/common';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

declare let X2JS: any;
let _ = require("underscore");
let lodash = require('lodash');
let CryptoJS = require("crypto-js");
@Component({
    selector: 'objectAcl',
    templateUrl: './object-acl.component.html',
    styleUrls: [],
    providers: [ConfirmationService, MsgBoxService]
})
export class ObjectAclComponent implements OnInit {
    cols: any=[{a:1}];
    checkBoxArr: string[]
    Signature;
    kDate;
    key;
    bucketId;
    items = [];
    folderId = "";
    backetUrl;
    constructor(
        private BucketService: BucketService,
        private ActivatedRoute: ActivatedRoute,
    ) {}
    ngOnInit() {
        this.ActivatedRoute.params.subscribe((params)=>{
            this.key = params.key
            this.bucketId = params.bucketId
            
        })
        this.getObjectAclList()
    }

    // query Objectacl list
    getObjectAclList() {
        this.items = window.sessionStorage['headerTag'] && window.sessionStorage['headerTag'] != "" ? JSON.parse(window.sessionStorage.getItem("headerTag")) : [];
        window['getAkSkList'](()=> {
            let requestMethod = "GET";
            let url = this.BucketService.url + '/' + this.bucketId+ `/${this.key}?acl`;
            window['canonicalString'](requestMethod, url, () => {
                let options: any = {};
                let name = this.bucketId + `/${this.key}?acl`
                this.getSignature(options);
                this.BucketService.getObjectAcl(name,options).subscribe((res) => {
                    let str = res['_body'];
                    let x2js = new X2JS();
                    let jsonObj = x2js.xml_str2json(str);
                    let chooseObj = jsonObj.AccessControlPolicy.AccessControlList.Grant
                    this.checkBoxArr = []
                    Array.isArray(chooseObj) && chooseObj.forEach((item) => {
                        if(item.Permission =="WRITE"){
                            this.checkBoxArr.push('write','read')
                            return
                        }else if(item.Permission == "READ"){
                            this.checkBoxArr.push('read')
                        }
                    });
                    
                })
            })
        })
    }
    
    // creat Objectacl 
    onSubmit() {
        let user 
        let isWrite =  this.checkBoxArr.some((item)=>{return item=='write'}) 
        let isRead = this.checkBoxArr.some((item)=>{return item=='read'})
        if(isWrite) {
            user = 'public-read-write'
        }else if(isRead){
            user = 'public-read'
        }else {
            user = 'private'
        }
        let data = {}
        this.creatObjectAclSubmit(data,user)

    }
    creatObjectAclSubmit(param,user) {
        window['getAkSkList'](()=> {
            let requestMethod = "PUT";
            let url = this.BucketService.url + '/' + this.bucketId + `/${this.key}?acl`;
            window['canonicalString'](requestMethod,url,() => {
                let options: any = {}; 
                this.getSignature(options);
                options['Content-Length'] = param.length;
                options.headers.set('Content-Type', 'application/xml');
                options.headers.set('x-amz-acl', user);
                let name = this.bucketId + `/${this.key}?acl`
                this.BucketService.creatObjectAcl(name, param, options).subscribe((res)=> {
                    this.getObjectAclList()
                })
            })
        })
    }

    // Rquest header with AK/SK authentication added
    getSignature(options) {
        let SignatureObjectwindow = window['getSignatureKey']();
        let requestObject = this.BucketService.getSignatureOptions(SignatureObjectwindow, options);
        options = requestObject['options'];
        this.Signature = requestObject['Signature'];
        this.kDate = requestObject['kDate'];
        return options;
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
    window.sessionStorage['headerTag'] = JSON.stringify(this.items)
    window.sessionStorage['folderId'] = JSON.stringify(this.folderId);
  }
}
