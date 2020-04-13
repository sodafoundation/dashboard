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
    selector: 'acl',
    templateUrl: './acl.component.html',
    styleUrls: [],
    providers: [ConfirmationService, MsgBoxService]
})
export class AclComponent implements OnInit {
    @Input() bucketId;
    cols: any=[{a:1}];
    checkBoxArr: string[]
    Signature;
    key;
    kDate;

    constructor(
        private BucketService: BucketService,
        private ActivatedRoute: ActivatedRoute,
    ) {}
    ngOnInit() {
        this.getAclList()
    }

    //query acl list
    getAclList() {
        window['getAkSkList'](()=> {
            let requestMethod = "GET";
            let url = this.BucketService.url + '/' + this.bucketId+'/?acl';
            window['canonicalString'](requestMethod, url, () => {
                let options: any = {};
                let key = "/?acl"
                this.getSignature(options);
                let name = this.bucketId + key
                this.BucketService.getAcl(name,options).subscribe((res) => {
                    let str = res['_body'];
                    let x2js = new X2JS();
                    let jsonObj = x2js.xml_str2json(str);
                    let chooseObj = jsonObj.AccessControlPolicy && jsonObj.AccessControlPolicy.AccessControlList.Grant
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
    
    //creat acl 
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
        this.creatAclSubmit(data,user)

    }
    creatAclSubmit(param,user) {
        window['getAkSkList'](()=> {
            let requestMethod = "PUT";
            let url = this.BucketService.url + '/' + this.bucketId + "/?acl";
            window['canonicalString'](requestMethod,url,() => {
                let options: any = {}; 
                this.getSignature(options);
                options['Content-Length'] = param.length;
                options.headers.set('Content-Type', 'application/xml');
                options.headers.set('x-amz-acl', user);
                let name = this.bucketId + "/?acl"
                this.BucketService.creatAcl(name, param, options).subscribe((res)=> {
                    this.getAclList()
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
}
