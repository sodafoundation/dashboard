import { Router,ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener, Input } from '@angular/core';
import { I18NService, MsgBoxService, HttpService, Utils } from 'app/shared/api';
import { BucketService} from '../../buckets.service';
import { ConfirmationService, ConfirmDialogModule} from '../../../../components/common/api';
import { trigger, state, style, transition, animate} from '@angular/animations';
import { I18nPluralPipe } from '@angular/common';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { Http } from '@angular/http';
import { HttpClient } from '@angular/common/http';

declare let X2JS: any;
let _ = require("underscore");
@Component({
    selector: 'lifeCycle',
    templateUrl: './liftCycle.component.html',
    styleUrls: [],
    providers: [ConfirmationService, MsgBoxService]
})
export class LifeCycleComponent implements OnInit{
    @Input() bucketId;
    showCreateLifeCycle = false;
    createLifeCycleForm: FormGroup;
    transForm;
    errorMessage = {
        "days": { required: "Type is required." },
        "transistion": { required: "Storageclass is required." },
        "name": { required: "name is required.", isExisted:"Name is existing"},
    };
    validRule= {
        'name':'^[a-zA-Z]{1}([a-zA-Z0-9]|[_]){0,254}$'
    };
    ruleChecked = true;
    expirChecked = false;
    transOptions = [];
    defaultTrans = {
        label: null,
        value: {id:null,transName:null}
    };
    defaultBackend = {
        label: null,
        value: {id:null,backendName:null} 
    };
    backends = [];
    expirCleanUp = false;
    lifeCycleItems = [0];
    createLifeCycleItem = [];
    allLifeCycleForCheck = [];
    Signature;
    kDate;
    transChecked = false;
    lifeCycleAlls = [];
    lifeCycleCreateData;
    expir;
    backendShow = [];
    selectedLifeCycle = [];
    cols;
    label = {
        header: "The data in the bucket will flow automatically according to the following rules.",
        days: this.i18n.keyID['sds_lifeCycleDays'] + ":",
        trans: this.i18n.keyID['sds_lifeCycleTrans'] + ":",
        backend: this.i18n.keyID['sds_backend'] + ":",
        addRule: this.i18n.keyID['sds_fileShare_addRule'],
        expirDelete: this.i18n.keyID['sds_lifeCycle_expiration_delete']
    }
      
    constructor(
        private ActivatedRoute: ActivatedRoute,
        public i18n:I18NService,
        private BucketService: BucketService,
        private confirmationService: ConfirmationService,
        private http: HttpService,
        private fb: FormBuilder,
        private msg: MsgBoxService,
        private HttpClient: HttpClient
    )
    {
        this.createLifeCycleForm = this.fb.group({
            "name":new FormControl('', {validators:[Validators.required, Utils.isExisted(this.allLifeCycleForCheck), Validators.pattern(this.validRule.name)], updateOn:'change'}),
            "prefix": new FormControl(""),
            "enabled":new FormControl(true,{validators:[Validators.required], updateOn:'change'}),
            "transEnabled": new FormControl(this.transChecked),
            "expirEnabled": new FormControl(this.expirChecked),
            "expirDays": new FormControl('1', Validators.required),
            "cleanDays": new FormControl('7', {validators:[Validators.required, Validators.min(1)]}),
            "expirCleanUp": new FormControl(true),
            "days0":new FormControl("30",{validators:[Validators.required], updateOn:'change'}),
            "transId0":new FormControl(this.defaultTrans, {validators:[Validators.required,this.checkStorageClass]}),
            "backendId0": new FormControl(this.defaultBackend),
            "showBackend0": new FormControl(false)
        });

    } 
    ngOnInit(){
        // this.cols = [
        //     { field: 'name', header: 'Name' },
        //     { field: 'Status', header: 'Status' },
        //     { field: 'Prefix', header: 'Prefix' },
        //     { field: 'Rules', header: 'Rules' },
        //     { field: 'Operation', header: 'Operation' }
        //   ];
        this.cols = {
            name: 'Name',
            status: 'Status',
            prefix: 'Prefix',
            rules: 'Rules',
            operation: 'Operation'
        }

        this.backendShow.push(false);
        this.createLifeCycleForm.valueChanges.subscribe(
            (value:string)=>{
                // this.createLifeCycleItem = this.getLifeCycleDataArray(this.createLifeCycleForm.value);
                if(this.transChecked){
                    this.createLifeCycleForm.patchValue({expirDays: 'NFS'})
                }
            }
        );
        // this.createLifeCycleItem = this.getLifeCycleDataArray(this.createLifeCycleForm.value);
        this.createLifeCycleForm.get("expirDays").valueChanges.subscribe(
            (value:string)=>{
                if(this.transChecked){
                    this.createLifeCycleForm.patchValue({expirDays: 'NFS'})
                }
            }
        );
        this.getLifeCycleList();

    }
    checkExpir(){
        if(this.expirChecked){
            this.expirChecked = false;
        }else{
            this.expirChecked = true;
            this.createLifeCycleForm.patchValue({expirDays: 1});
        }
    }
    getLifeCycleList(value?){
        this.lifeCycleAlls = [];
        window['getAkSkList'](()=>{
            let requestMethod = "GET";
            let url = this.BucketService.url + '/' + this.bucketId + "?lifecycle";
            window['canonicalString'](requestMethod, url,()=>{
                let options: any = {};
                this.getSignature(options);
                let name = this.bucketId + "?lifecycle";
                let arr = [];
                this.BucketService.getLifeCycle(name,options).subscribe((res)=>{
                    let str = res['_body'];
                    let x2js = new X2JS();
                    let jsonObj = x2js.xml_str2json(str);
                    let lifeCycleArr = jsonObj.LifecycleConfiguration.Rule;
                    if(lifeCycleArr){
                        if(_.isArray(lifeCycleArr)){
                            lifeCycleArr.forEach(item=>{
                                let lifeCycleAll = {
                                    ObjectKey: item.ID,
                                    Status: item.Status,
                                    Prefix: (()=>{
                                        let prefix = item.Filter.Prefix;
                                        return  prefix != "" ? prefix : "--";
                                    })(),
                                    Rules: (()=>{
                                        let newTrans = [];
                                        let string;
                                        if(item.Status == "enable"){
                                            if(item.Transition){
                                                let trans = item.Transition;
                                                trans.forEach(arr=>{
                                                    string = "Transition to" + arr.StorageClass + ":" + "days" + arr.Days + ",Backend:" + arr.Backend;
                                                    newTrans.push(string);
                                                })
                                            }
                                            if(item.Expiration){
                                                string = "Expired deletion:" + item.Expiration.Days;
                                                newTrans.push(string);
                                            }
                                        }else{
                                            string = "--";
                                            newTrans.push(string);
                                        }
                                        return  newTrans;
                                    })()
                                }
                                arr.push(lifeCycleAll);
                            })
                            this.lifeCycleAlls = arr;
                        }else{
                            let lifeCycleAll = {
                                ObjectKey: lifeCycleArr.ID,
                                Status: lifeCycleArr.Status,
                                Prefix: (()=>{
                                    let prefix = lifeCycleArr.Filter.Prefix;
                                    return  prefix != "" ? prefix : "--";
                                })(),
                                Rules: (()=>{
                                    let newTrans = [];
                                    let string;
                                    if(lifeCycleArr.Status == "enable"){
                                        if(lifeCycleArr.Transition){
                                            let trans = lifeCycleArr.Transition;
                                            let backend = trans.Backend != "" ? trans.Backend : "--";
                                            string = "Transition to " + trans.StorageClass + ": days" + trans.Days + ", Backend:" + backend;
                                            newTrans.push(string);
                                        }
                                        if(lifeCycleArr.Expiration){
                                            string = "Expired deletion: " + lifeCycleArr.Expiration.Days;
                                            newTrans.push(string);
                                        }
                                    }else{
                                        string = "--";
                                        newTrans.push(string);
                                    }
                                    return  newTrans;
                                })()
                            }
                            arr.push(lifeCycleAll);
                            this.lifeCycleAlls = arr;
                        }
                    }
                    if(this.showCreateLifeCycle){
                        this.lifeCycleCreateData = this.getLifeCycleDataArray(value,jsonObj);
                        this.createLifeCycleSubmit(this.lifeCycleCreateData);
                    }
                })
            })
        })
        
        // this.allLifeCycleForCheck.push();
    }
    typeChange(event, transIndex, dialog){
        this.backendShow[transIndex] = true;
        let selectedTransId = event.value.id;
        this.getBackends(selectedTransId, transIndex);
    }
    getTransOptions(transIndex?){
        let storageClasses = "storageClasses";
        this.transOptions = [];
        window['getAkSkList'](()=>{
            let requestMethod = "GET";
            let url = this.BucketService.url + '/' + storageClasses;
            window['canonicalString'](requestMethod, url,()=>{
                let options: any = {};
                this.getSignature(options);
                this.BucketService.getTransOptions(storageClasses,options).subscribe((res)=>{
                    let str = res['_body'];
                    let x2js = new X2JS();
                    let jsonObj = x2js.xml_str2json(str);
                    let array = jsonObj.ListStorageClasses.Class;
                    array.map(arr=>{
                        let transObj = {
                            label: arr.Name,
                            value: {id:arr.Tier,transName:arr.Name}
                        }
                        this.transOptions.push(transObj);
                    })
                })
            })
        })
        
    }
    getBackends(selectedTransId, transIndex){
        let backendArr = [];
        this.http.get('v1/{project_id}/backends?tier=' + selectedTransId).subscribe((res)=>{
            let str = res.json();
            str.backends.map(item=>{
                let backends = {
                    label: item.name,
                    value: {id: item.id,backendName:item.name}
                }
                backendArr.push(backends);
            })
            this.backends.push(backendArr);
        })
    }
    // Rquest header with AK/SK authentication added
    getSignature(options){
        let SignatureObjectwindow = window['getSignatureKey']();
        let requestObject = this.BucketService.getSignatureOptions(SignatureObjectwindow,options);
        options = requestObject['options'];
        this.Signature = requestObject['Signature'];
        this.kDate = requestObject['kDate'];
        return options;
    }
    createLifeCycle(){
        this.ruleChecked = true;
        this.expirChecked = false;
        this.showCreateLifeCycle = true;
        this.expirCleanUp = false;
        this.transChecked = false;
        this.createLifeCycleForm = this.fb.group({
            "name":new FormControl('', {validators:[Validators.required, Utils.isExisted(this.allLifeCycleForCheck), Validators.pattern(this.validRule.name)], updateOn:'change'}),
            "prefix": new FormControl(""),
            "enabled":new FormControl(this.ruleChecked,{validators:[Validators.required], updateOn:'change'}),
            "transEnabled": new FormControl(this.transChecked),
            "expirEnabled": new FormControl(this.expirChecked),
            "expirDays": new FormControl('', Validators.required),
            "cleanDays": new FormControl('7', {validators:[Validators.required, Validators.min(1)]}),
            "expirCleanUp": new FormControl(true),
            "days0":new FormControl("30",{validators:[Validators.required], updateOn:'change'}),
            "transId0":new FormControl(this.defaultTrans, {validators:[Validators.required,this.checkStorageClass]}),
            "backendId0": new FormControl(this.defaultBackend),
            "showBackend0": new FormControl(false)
        });
        // this.createLifeCycleForm.controls['name'].setValidators([Validators.required,Utils.isExisted(this.allLifeCycleForCheck),Validators.pattern(this.validRule.name)]);
        this.getTransOptions();
    }
    getLifeCycleDataArray(value,object?){
        let xmlStr = `<LifecycleConfiguration xmlns=\"http://s3.amazonaws.com/doc/2006-03-01/\">`;
        let x2js = new X2JS();
        let defaultLifeCycle = x2js.json2xml_str(object.LifecycleConfiguration);
        let transRule = {
            Rule: {
                ID: value.name,
                Filter: {
                    Prefix: value.prefix
                },
                Status: (()=>{
                    if(this.transChecked || this.expirChecked){
                        if(value.enabled){
                            return "enable"
                        }else{
                            return "disable"
                        }
                    }else{
                        return "disable"
                    }
                })()
            }
        }
        let jsonObj = x2js.json2xml_str(transRule);
        let ruleXml = "</Rule>";
        jsonObj = jsonObj.split("</Rule>")[0];
        if(this.transChecked){
            this.lifeCycleItems.forEach((item,index)=>{
                let trans = {
                    Transition: {
                        StorageClass: value['transId' +index].transName,
                        Days: value['days' +index],
                        Backend: value['backendId'+index].backendName
                    }
                }
                trans = x2js.json2xml_str(trans);
                jsonObj = jsonObj + trans;
            })
        }
        if(this.expirChecked){
            this.expir = {
                Expiration: {
                    Days: value.expirDays,
                }
            }
            this.expir = x2js.json2xml_str(this.expir);
        }
        let Incomplete = {
            AbortIncompleteMultipartUpload: {
                DaysAfterInitiation: (()=>{
                    if(this.expirCleanUp){
                        return value.cleanDays
                    }else{
                        return 0
                    }
                })()
            }
        }
        Incomplete = x2js.json2xml_str(Incomplete);
        let newLifeCycle;
        if(this.expir){
            newLifeCycle = jsonObj + this.expir + Incomplete + ruleXml;
        }else{
            newLifeCycle = jsonObj + Incomplete + ruleXml;
        }
        xmlStr = xmlStr + defaultLifeCycle + newLifeCycle + `</LifecycleConfiguration>`;
        return xmlStr;
    }
    checkStorageClass(control:FormControl):{[s:string]:boolean}{
        if(control.value == null){
            return {storageClassNull:true}
        }
    }
    enableLifeCycle(){}
    disableLifeCycle(){}
    transSwitch(){
        let ruleValue = this.createLifeCycleForm.get('enabled').value;
        if(ruleValue){
            this.ruleChecked = true;
        }else{
            this.ruleChecked = false;
        }
    }
    expirSwitch(){
        if(this.expirChecked){
            this.expirChecked =true;
        }else{
            this.expirChecked = false;
        }
    }
    addTransRules(){
          this.lifeCycleItems.push(
            this.lifeCycleItems[this.lifeCycleItems.length-1] + 1
          );
        this.lifeCycleItems.forEach((item,index) => {
            if(index !== 0){
                this.createLifeCycleForm.addControl('days'+index, this.fb.control('30', Validators.required));
                this.createLifeCycleForm.addControl('transId'+index, this.fb.control(this.defaultTrans, Validators.required));
                this.createLifeCycleForm.addControl('backendId'+index, this.fb.control(this.defaultBackend, Validators.required));
                this.createLifeCycleForm.addControl("showBackend"+index, new FormControl(false));
                this.backendShow.push(false)
            }
        });
    }
    deleteTransRules(index){
        this.lifeCycleItems.splice(index, 1);
        this.createLifeCycleForm.removeControl('days'+index);
        this.createLifeCycleForm.removeControl('transId'+index);
        this.createLifeCycleForm.removeControl('backendId'+index);
        this.createLifeCycleForm.removeControl("showBackend"+index);
        this.backendShow = this.backendShow.filter((item,i)=>{
            return i != index;
        })
    }
    createLifeCycleSubmit(param){
        window['getAkSkList'](()=>{
            let requestMethod = "PUT";
            let url = this.BucketService.url + '/' + this.bucketId + "/?lifecycle";
            window['canonicalString'](requestMethod, url,()=>{
                let options: any = {};
                this.getSignature(options);
                options['Content-Length'] = param.length;
                options.headers.set('Content-Type','application/xml');
                // options['Content-MD5'] = CryptoJS.SHA256(param, 'base64');
                let name = this.bucketId + "/?lifecycle";
                this.BucketService.createLifeCycle(name,param,options).subscribe((res)=>{
                    this.showCreateLifeCycle=false;
                    this.getLifeCycleList();
                })
            })
        })
    }
    onSubmit(value){
        if(this.transChecked || this.expirChecked){
            if(!this.createLifeCycleForm.valid){
                for(let i in this.createLifeCycleForm.controls){
                    this.createLifeCycleForm.controls[i].markAsTouched();
                }
                return;
            }
        }
        this.getLifeCycleList(value); 
    }
    lifeCycleNameOnChanged(createLifeCycleForm){

    }
    getErrorMessage(control,extraParam){
        let page = "";
        let key = Utils.getErrorKey(control,page);
        return extraParam ? this.i18n.keyID[key].replace("{0}",extraParam):this.i18n.keyID[key];
    }
    deleteLifeCycle(value){
        window['getAkSkList'](()=>{
            let requestMethod = "DELETE";
            let url = this.BucketService.url + '/' + this.bucketId + "/?lifecycle="+ value.ObjectKey;
            window['canonicalString'](requestMethod, url,()=>{
                let options: any = {};
                this.getSignature(options);
                let name = this.bucketId + "/?lifecycle="+ value.ObjectKey;
                this.BucketService.deleteLifeCycle(name,options).subscribe((res)=>{
                    this.getLifeCycleList();
                })
            })
        })
        
    }
}