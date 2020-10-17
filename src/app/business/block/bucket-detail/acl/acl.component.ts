import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener, Input } from '@angular/core';
import { I18NService, MsgBoxService, HttpService, Utils } from 'app/shared/api';
import { BucketService } from '../../buckets.service';
import { ConfirmationService, ConfirmDialogModule, Message } from '../../../../components/common/api';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { I18nPluralPipe } from '@angular/common';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Http, Headers } from '@angular/http';

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
    msgs: Message[];

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
            let url = "/"+this.bucketId+"/?acl";
            let requestOptions: any;
            let options: any = {};
            requestOptions = window['getSignatureKey'](requestMethod, url) ;
            options['headers'] = new Headers();
            options = this.BucketService.getSignatureOptions(requestOptions, options);
            this.BucketService.getAcl(this.bucketId,options).subscribe((res) => {
                let str = res['_body'];
                let x2js = new X2JS();
                let jsonObj = x2js.xml_str2json(str);
                let publicGroup = jsonObj.AccessControlPolicy && jsonObj.AccessControlPolicy.AccessControlList.Grant ? jsonObj.AccessControlPolicy.AccessControlList.Grant : [];
                this.checkBoxArr = []
                if(publicGroup && publicGroup.length){
                    publicGroup.forEach(element => {
                        if(element['Grantee']['_xsi:type']=="Group"){
                            if(element['Permission'] =="WRITE"){
                                this.checkBoxArr.push('write','read');
                            }else if(element['Permission'] == "READ"){
                                this.checkBoxArr.push('read');
                            }
                        }
                    });
                }
                
            }, (error) => {
                this.msgs = [];
                this.msgs.push({severity: 'error', summary: "Error", detail: "Could not fetch ACL."});
                console.log("Could not fetch ACL list.Something went wrong.", error);
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
            let url = '/' + this.bucketId + "/?acl";
            let requestOptions: any;
            let options: any = {};
            let contentHeaders = {
                'x-amz-acl' : user
            };
            let body = '';
            requestOptions = window['getSignatureKey'](requestMethod, url, '', '', '', body, '', '', contentHeaders) ;
            options['headers'] = new Headers();
            options = this.BucketService.getSignatureOptions(requestOptions, options);
            
            options.headers.set('x-amz-acl', user);
            this.BucketService.creatAcl(this.bucketId, body, options).subscribe((res)=> {
                this.msgs = [];
                this.msgs.push({severity: 'success', summary: 'Success', detail: 'ACL updated successfully.'});
                this.getAclList()
            }, (error) => {
                this.msgs = [];
                this.msgs.push({severity: 'error', summary: "Error", detail: error.json()});
                console.log("Could not create ACL. Something went wrong.", error);
            })
        })
    }

}
