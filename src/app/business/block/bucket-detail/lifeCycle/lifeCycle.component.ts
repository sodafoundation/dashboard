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
@Component({
    selector: 'lifeCycle',
    templateUrl: './lifeCycle.component.html',
    styleUrls: [],
    providers: [ConfirmationService, MsgBoxService]
})
export class LifeCycleComponent implements OnInit {
    @Input() bucketId;
    showRightSidebar: boolean = false;
    showCreateLifeCycle = false;
    showModifyLifeCycle = false;
    createLifeCycleForm;
    errorMessage = {
        "name": { required: this.i18n.keyID['sds_profile_create_name_require'], 
                  isExisted: this.i18n.keyID['sds_isExisted'] },
        "prefix": { isExisted: "prefix is existing" }
    };
    validRule = {
        'name': '^[a-zA-Z]{1}([a-zA-Z0-9]|[_]){0,254}$'
    };
    ruleChecked = true;
    expirChecked = false;
    transOptions = [];
    defaultTrans = {
        label: null,
        value: { id: null, transName: null }
    };
    defaultBackend = {
        label: null,
        value: { id: null, backendName: null }
    };
    backends = [];
    allBuckets: any = [];
    expirCleanUp = false;
    lifeCycleItems = [0];
    createLifeCycleItem = [];
    allLifeCycleForCheck = [];
    allLifeCycleCheckPrefix = [];
    Signature;
    kDate;
    transChecked = false;
    lifeCycleAlls = [];
    backendShow = [];
    bucketShow= [];
    selectedLifeCycle = [];
    transDaysArr = [];
    newExpirDays;
    cols;
    showAddTransRule = true;
    minDays = [];
    minExpirDays;
    submitObj;
    isHover = false;
    index;
    liceCycleDialog;
    modifyBackend = [];
    modifyBucket = [];
    modifyTrans = [];
    enableCycle = false;
    disableCycle = false;
    lifeCycleTitle;
    sameTransition = false;
    label = {
        header: "Create lifecycle rules that will be applied to the objects in the source bucket.",
        days: this.i18n.keyID['sds_lifeCycleDays'] + ":",
        trans: this.i18n.keyID['sds_lifeCycleTrans'] + ":",
        backend: this.i18n.keyID['sds_backend'] + ":",
        targetBucket: this.i18n.keyID['sds_dest_bucket'] + ":",
        addRule: this.i18n.keyID['sds_fileShare_addRule'],
        expirDelete: this.i18n.keyID['sds_lifeCycle_expiration_delete']
    }
    modifyArr = [];
    msgs: Message[];
    
    // List of clouds that support the new bucket CRUD from SODA Multicloud as per multicloud/#1205, multicloud/#1208 and multicloud/#1209
    lifecycleBucketSupport: any = ['aws-s3', 'azure-blob', 'gcp-s3', 'hw-obs'];

    constructor(
        private ActivatedRoute: ActivatedRoute,
        public i18n: I18NService,
        private BucketService: BucketService,
        private confirmationService: ConfirmationService,
        private http: HttpService,
        private fb: FormBuilder,
        private msg: MsgBoxService
    ) { }
    ngOnInit() {
        this.getLifeCycleForm();
        this.getLifeCycleList();
    }
    closeSidebar(){
        this.showRightSidebar = false;
    }
    getLifeCycleForm() {
        this.createLifeCycleForm = this.fb.group({
            "name": new FormControl('', { validators: [Validators.required, Utils.isExisted(this.allLifeCycleForCheck), Validators.pattern(this.validRule.name)], updateOn: 'change' }),
            "prefix": new FormControl("", { validators: [Utils.isExisted(this.allLifeCycleCheckPrefix)] }),
            "enabled": new FormControl(true, { validators: [Validators.required], updateOn: 'change' }),
            "transEnabled": new FormControl([]),
            "expirEnabled": new FormControl([]),
            "expirDays": new FormControl(1),
            "cleanDays": new FormControl(7),
            "expirCleanUp": new FormControl([]),
            "days0": new FormControl(30,{ validators: [Validators.required], updateOn: 'change' }),
            "transId0": new FormControl(""),
            "backendId0": new FormControl(this.defaultBackend),
            "targetBucket0" : new FormControl("")
        });
    }
    // Expir Rules checkbox click
    checkExpir() {
        this.expirChecked = !this.expirChecked;
        if (this.expirChecked) {
            if (this.transChecked && this.transDaysArr.length > 0) {
                let length = this.lifeCycleItems.length - 1;
                let latestDay = "days" + length;
                this.minExpirDays = this.createLifeCycleForm.value[latestDay] + 1;
            } else {
                this.minExpirDays = 1;
            }
            this.createLifeCycleForm.patchValue({ expirDays: this.minExpirDays });
            this.newExpirDays = this.createLifeCycleForm.value["expirDays"];
            this.createLifeCycleForm.controls['expirDays'].setValidators(Validators.required);
        } else {
            this.createLifeCycleForm.controls['expirDays'].setValidators('');
        }
    }
    checkCleanUp() {
        this.expirCleanUp = !this.expirCleanUp;
        if (this.expirCleanUp) {
            this.createLifeCycleForm.controls['cleanDays'].setValidators(Validators.required);
        } else {
            this.createLifeCycleForm.controls['cleanDays'].setValidators('');
        }
    }
    //assemble lifeCycle Rule
    getLifeCycleRule(item) {
        let newTrans = [];
        let string;
        let trans = item.Transition ? item.Transition : '';
        let cleanUp = item.AbortIncompleteMultipartUpload && item.AbortIncompleteMultipartUpload.DaysAfterInitiation ? item.AbortIncompleteMultipartUpload.DaysAfterInitiation : '';
        if (trans || item.Expiration || cleanUp) {
            if (trans) {
                if (_.isArray(item.Transition)) {
                    trans.forEach((arr) => {
                        string = "Transition to " + arr.StorageClass + 
                                 " after: " + arr.Days + 
                                 " days" + 
                                 (arr.TargetBucket != "" ? ", Target bucket: " + arr.TargetBucket : "") + 
                                 (arr.Backend != "" ? ", Backend: " + arr.Backend : "");
                        newTrans.push(string);
                    })
                } else {
                    string = "Transition to " + trans.StorageClass + 
                             " after: " + trans.Days + 
                             " days" + 
                             (trans.TargetBucket != "" ? ", Target bucket: " + trans.TargetBucket : "") + 
                             (trans.Backend != "" ? ", Backend: " + trans.Backend : "");
                    newTrans.push(string);
                }
            }
            if (item.Expiration) {
                string = "Delete after: " + item.Expiration.Days + " days";
                newTrans.push(string);
            }
            if (cleanUp && cleanUp != 0) {
                string = "Clean up incomplete multipart uploads after: " + cleanUp + " days";
                newTrans.push(string);
            }
        } else {
            string = "--";
            newTrans.push(string);
        }
        return newTrans;
    }
    getLifeCyclePrefix(item, dialog, cycle) {
        let prefix = item.Filter && item.Filter.Prefix ? item.Filter.Prefix : "";
        //In the modified State, filter out the prefix of the selected lifeCycle 
        if (prefix != "" && (dialog != "update" || (cycle && cycle.newPrefix != prefix))) {
            this.allLifeCycleCheckPrefix.push(prefix);
        } else if (prefix == "") {
            prefix =  "--";
        }
        return prefix;
    }
    //query lifeCycle list
    getLifeCycleList(dialog?, cycle?) {
        this.lifeCycleAlls = [];
        this.modifyArr = [];
        window['getAkSkList'](() => {
            
            let requestMethod = "GET";
            let url = '/' + this.bucketId + "/?lifecycle";
            let requestOptions: any;
            let options: any = {};
            requestOptions = window['getSignatureKey'](requestMethod, url);
            options['headers'] = new Headers();
            options = this.BucketService.getSignatureOptions(requestOptions, options);

            let arr = [];
            this.BucketService.getLifeCycle(this.bucketId, options).subscribe((res) => {
                let str = res['_body'];
                let x2js = new X2JS();
                let jsonObj = x2js.xml_str2json(str);
                let lifeCycleArr = jsonObj.LifecycleConfiguration.Rule;
                if (lifeCycleArr) {
                    //Multiple lifeCycle
                    if (_.isArray(lifeCycleArr)) {
                        this.modifyArr = lifeCycleArr;
                        lifeCycleArr.forEach(item => {
                            if (dialog != "update" || (cycle && cycle.ObjectKey != item.ID)) {
                                this.allLifeCycleForCheck.push(item.ID);
                            }
                            let lifeCycleAll = {
                                ObjectKey: item.ID,
                                Status: item.Status,
                                prefix: item.Filter && item.Filter.Prefix ? item.Filter.Prefix : '',
                                newPrefix: this.getLifeCyclePrefix(item, dialog, cycle),
                                Rules: this.getLifeCycleRule(item)
                            }
                            arr.push(lifeCycleAll);
                        })
                        this.lifeCycleAlls = arr;
                    } else {
                        //only one lifeCycle
                        this.modifyArr.push(lifeCycleArr);
                        if (dialog != "update") {
                            this.allLifeCycleForCheck.push(lifeCycleArr.ID);
                        }
                        let lifeCycleAll = {
                            ObjectKey: lifeCycleArr.ID,
                            Status: lifeCycleArr.Status,
                            prefix: lifeCycleArr.Filter && lifeCycleArr.Filter.Prefix ? lifeCycleArr.Filter.Prefix: '',
                            newPrefix: this.getLifeCyclePrefix(lifeCycleArr, dialog, cycle),
                            Rules: this.getLifeCycleRule(lifeCycleArr)
                        }
                        arr.push(lifeCycleAll);
                        this.lifeCycleAlls = arr;
                    }
                }
                this.submitObj = jsonObj;
                //the state of the modification
                if (dialog && dialog == "update") {
                    this.editFile(cycle);
                }
            })
        })
    }
    // Transition Rules checkbox click
    transClick() {
        if(this.modifyBackend.length > 0){
            this.modifyBackend = [];
        }
        if(this.modifyBucket.length > 0){
            this.modifyBucket = [];
        }
        this.backendShow[0] = false;
        this.bucketShow[0] = false;
        this.transChecked = !this.transChecked;
        this.lifeCycleItems.forEach((item, index) => {
            if (this.transChecked) {
                this.lifeCycleAddControl(index);
                if (index == 0) {
                    this.lifeCycleItems = [0];
                }
                this.showAddTransRule = true;
                this.getTransOptions();
                this.transOptions = [];
                if (!this.createLifeCycleForm.controls['transId0']) {
                    this.createLifeCycleForm.addControl('days0', this.fb.control('', Validators.required));
                    this.createLifeCycleForm.addControl('transId0', this.fb.control('', Validators.required));
                    this.createLifeCycleForm.addControl('backendId0', this.fb.control('', Validators.required));
                    this.createLifeCycleForm.addControl('targetBucket0', this.fb.control('', Validators.required));
                } else {
                    this.createLifeCycleForm.controls['transId0'].setValidators([Validators.required, this.checkStorageClass]);
                    this.createLifeCycleForm.controls['days0'].setValidators(Validators.required);
                }
                
            } else {
                this.lifeCycleDeleteControl(index);
                this.showAddTransRule = false;
                this.backendShow = [];
                this.bucketShow = [];
            }
        })
    }

    //storageClass change
    typeChange(event, transIndex, dialog?) {
        this.backendShow[transIndex] = true;
        if (transIndex == 0) {
            let minDays;
            if ((dialog && event != "GLACIER") || (event.value && event.value.transName && event.value.transName != "GLACIER")) {
                this.createLifeCycleForm.patchValue({ days0: 30 });
                minDays = 30;
                this.showAddTransRule = true;
                if (this.transDaysArr.length == 0) {
                    this.transDaysArr.push(30);
                }
            } else {
                this.createLifeCycleForm.patchValue({ days0: 1 });
                minDays = 1;
                this.showAddTransRule = false;
                if (this.transDaysArr.length == 0) {
                    this.transDaysArr.push(1);
                } else {
                    this.transDaysArr[transIndex] = 1;
                }
            }
            if (this.minDays.length == 0) {
                this.minDays.push(minDays);
            } else {
                this.minDays[0] = minDays;
            }
        } else {
            let day = "days" + (transIndex - 1);
            let defaultDays = this.createLifeCycleForm.value[day];
            let newDay = "days" + transIndex;
            this.createLifeCycleForm.controls[newDay] = new FormControl(defaultDays + 30);
            if (this.minDays[transIndex]) {
                this.minDays[transIndex] = defaultDays + 30;
            } else {
                this.minDays.push(defaultDays + 30);
            }
            this.transDaysArr[transIndex] = defaultDays + 30;
            if ((dialog && event == "GLACIER") || (event.value && event.value.transName && event.value.transName != "GLACIER")) {
                this.showAddTransRule = true;
            }else{
                this.showAddTransRule = false;
            }
        }
        this.transDaysChange(transIndex);
        if(((dialog && event == "GLACIER") || (event.value && event.value.transName && event.value.transName == "GLACIER")) && transIndex < this.lifeCycleItems.length -1){
            this.deleteTransRules(transIndex+1);
        }
        this.getBuckets(event, transIndex);
        this.getTransValue(this.createLifeCycleForm.value);
    }
    //backend change
    backendChange(event, transIndex){
        if((event && event.value.backendType) && _.contains(this.lifecycleBucketSupport, event.value.backendType)){
            this.bucketShow[transIndex] = true;
            this.getBuckets(event, transIndex);
        } else{
            this.bucketShow[transIndex] = false;
        }
        this.getTransValue(this.createLifeCycleForm.value); 
    }
    getBuckets(event?, transIndex?) {
        let bucketsArr = [];
        window['getAkSkList'](() => {
                let requestMethod = "GET";
                let url = this.BucketService.url;
                let requestOptions: any;
                let options: any = {};
                requestOptions = window['getSignatureKey'](requestMethod, url);
                options['headers'] = new Headers();
                options = this.BucketService.getSignatureOptions(requestOptions, options);
                if (Object.keys(options).length > 0) {
                    this.BucketService.getBuckets(options).subscribe((res) => {
                        let str = res._body;
                        let x2js = new X2JS();
                        let jsonObj = x2js.xml_str2json(str);
                        let buckets = (jsonObj ? jsonObj.ListAllMyBucketsResult.Buckets.Bucket : []);
                        if (Object.prototype.toString.call(buckets) === "[object Array]") {
                            buckets = buckets;
                        } else if (Object.prototype.toString.call(buckets) === "[object Object]") {
                            buckets = [buckets];
                        }
                        if(event.value && event.value.transName){
                            let newBackend;
                            buckets.forEach(item => {
                                if (this.bucketId == item.Name) {
                                    newBackend = item.LocationConstraint
                                }
                            });
                            let selectedTrans = event.value ? event.value.transName : event;
                            let tierId = event.value.id;
                            this.getBackends(selectedTrans, tierId, newBackend, transIndex);
                        } else if(event.value && event.value.backendName){
                            buckets.forEach(element => {
                                if(event.value.backendName == element.LocationConstraint){
                                    let bucketItem = {
                                        label: element.Name,
                                        value: { name: element.Name, backendName: element.LocationConstraint, backendType: event.value.type }
                                    }
                                    bucketsArr.push(bucketItem);
                                }
                            });
                            if(this.allBuckets[transIndex]){
                                this.allBuckets[transIndex] = bucketsArr;
                            } else{
                                this.allBuckets.push(bucketsArr);
                            }                            
                        }
                        if(this.modifyBucket.length > transIndex && this.modifyBucket[transIndex] != ""){
                            this.modifyBucket.forEach((item,index)=>{
                                if(index == transIndex){
                                    bucketsArr.forEach((it,index)=>{
                                        let firstItem = bucketsArr[0];
                                        if(item == it.label){
                                            bucketsArr[0]= it;
                                            bucketsArr[index] = firstItem;
                                        }
                                    })
                                }
                                
                            });
                        }                      
                    });
                }
        })
    }
    getTransOptions(transIndex?, cycle?) {
        let storageClasses = "storageClasses";
        window['getAkSkList'](() => {
            
            let requestMethod = "GET";
            let url = '/' + storageClasses;
            let requestOptions: any;
            let options: any = {};
            requestOptions = window['getSignatureKey'](requestMethod, url);
            options['headers'] = new Headers();
            options = this.BucketService.getSignatureOptions(requestOptions, options);
            this.BucketService.getTransOptions(storageClasses, options).subscribe((res) => {
                let str = res['_body'];
                let x2js = new X2JS();
                let jsonObj = x2js.xml_str2json(str);
                let array = jsonObj.ListStorageClasses.Class;
                let transItem = [];
                let selectedTrans;
                //the state of the modification
                if (cycle && cycle.ObjectKey) {
                    selectedTrans = this.createLifeCycleForm.value['transId' + (transIndex)];
                    if(this.lifeCycleItems.length >1){
                        if (selectedTrans == "STANDARD_IA") {
                            array = array.filter((item, index) => {
                                return item.Name != "STANDARD";
                            })
                        } else if (selectedTrans == "GLACIER") {
                            array = array.filter((item, index) => {
                                return item.Name == "GLACIER";
                            })
                        }
                    }else if(this.lifeCycleItems.length == 1){
                        array.forEach((item, index)=>{
                            let firstItem = array[0];
                            if(item.Name == selectedTrans){
                                array[0] = item;
                                array[index] = firstItem;
                            }
                        })
                    }
                //Add Rules under modified state
                } else if (this.showModifyLifeCycle){
                    let trans = this.createLifeCycleForm.value['transId' + (transIndex -1)];
                    selectedTrans = trans?(trans.transName ? trans.transName : trans) : "--";
                    if(selectedTrans == "STANDARD"){
                        array = array.filter((item, index) => {
                            return item.Name != "STANDARD";
                        })
                    }else if(selectedTrans == "STANDARD_IA"){
                        array = array.filter((item, index) => {
                            return item.Name == "GLACIER";
                        })
                    }
                }else if(transIndex && transIndex > 0) {
                    selectedTrans = this.createLifeCycleForm.value['transId' + (transIndex - 1)].transName;
                    if (selectedTrans == "STANDARD") {
                        array = array.filter((item, index) => {
                            return item.Name != "STANDARD";
                        })
                    } else if (selectedTrans == "STANDARD_IA") {
                        array = array.filter((item, index) => {
                            return item.Name == "GLACIER";
                        })
                    }
                }
                array.map(arr => {
                    if (cycle && cycle.ObjectKey && arr.Name == selectedTrans) {
                        let event = {
                            value: {
                                id: arr.Tier,
                                transName: arr.Name
                            }
                        }
                        this.getBuckets(event, transIndex);

                    }
                    let transObj = {
                        label: "Tier_" + arr.Tier + "(" + arr.Name + ")",
                        value: { id: arr.Tier, transName: arr.Name }
                    }
                    transItem.push(transObj)
                })
                if(this.showModifyLifeCycle && !cycle && transIndex > 0){
                    this.createLifeCycleForm.patchValue({['transId' + transIndex]: transItem[0].value.transName});
                    this.typeChange(transItem[0],transIndex, 'update');
                }
                this.transOptions.push(transItem);
            })
        })

    }
    getBackends(selectedTrans, tierId, newBackend, transIndex) {
        let backendArr = [];
        this.http.get('v1/{project_id}/backends?tier=' + tierId).subscribe((res) => {
            let str = res.json();
            let backendsArr = str.backends;
            //sibling migration is not supported in the same cloud
            if (selectedTrans == "STANDARD") {
                let type;
                backendsArr.forEach(item=>{
                    if(item.name == newBackend){
                        type = item.type;
                    }
                })
                backendsArr = backendsArr.filter(item => {
                    return item.type != type;

                })
            }
            backendsArr.map(item => {
                let backends = {
                    label: item.name,
                    value: { id: item.id, backendName: item.name, backendType: item.type }
                }
                backendArr.push(backends);
            })
            backendArr.push({
                label: "Not set",
                value: {id: null, backendName: null}
            })
            if(this.modifyBackend.length > transIndex && this.modifyBackend[transIndex] != ""){
                this.modifyBackend.forEach((item,index)=>{
                    if(index == transIndex){
                        backendArr.forEach((it,index)=>{
                            let firstItem = backendArr[0];
                            if(item == it.label){
                                backendArr[0]= it;
                                backendArr[index] = firstItem;
                            }
                        })
                    }
                    
                });
            }
            //change the value of backends when modifying the selected storageClass
            if (this.backends[transIndex]) {
                this.backends[transIndex] = backendArr;
            } else {
                this.backends.push(backendArr);
            }
        })
    }
    
    //create/update pop-up box
    createLifeCycle(dialog, cycle?) {
        this.modifyBackend = [];
        this.modifyBucket = [];
        this.backendShow = [];
        this.transOptions = [];
        this.minDays = [];
        this.transDaysArr = [];
        this.backends = [];
        this.allLifeCycleForCheck = [];
        this.allLifeCycleCheckPrefix = [];
        this.modifyTrans = [];
        this.sameTransition = false;
        if (dialog == "create") {
            this.lifeCycleTitle = "Create LifeCycle Rule";
            this.showCreateLifeCycle = true;
            this.showModifyLifeCycle = false;
            this.ruleChecked = true;
            this.expirChecked = false;
            this.expirCleanUp = false;
            this.transChecked = false;
            this.showAddTransRule = true;
            this.lifeCycleItems = [0];
            this.getLifeCycleForm();
            //reset lifeCycle
            this.getTransOptions();
        }
        this.getLifeCycleList(dialog, cycle);
        this.showRightSidebar = this.showCreateLifeCycle ? true : false;
    }
    showModifyLifecycleDialog(dialog, cycle){
        this.lifeCycleTitle = "Update LifeCycle Rule";
        this.showCreateLifeCycle = false;
        this.showModifyLifeCycle = true;     
        this.getLifeCycleList(dialog, cycle);
        this.showRightSidebar = this.showModifyLifeCycle ? true : false;
        
    }
    getLifeCycleDataArray(value, object?, dialog?) {
        let xmlStr = `<LifecycleConfiguration xmlns=\"http://s3.amazonaws.com/doc/2006-03-01/\">`;
        let x2js = new X2JS();
        let defaultLifeCycle, modifyCycle, modifyCleanDays;
        if (object) {
            let arr = lodash.cloneDeep(object.LifecycleConfiguration);
            //In the modified/enable/disable state, delete the original lifeCycle and create new lifeCycle
            if (dialog != "create") {
                if (_.isArray(arr.Rule)) {
                    arr.Rule = arr.Rule.filter(item => {
                        return item.ID != value.name;
                    })
                } else {
                    arr = "";
                }
                if (dialog != "update") {
                    modifyCycle = this.modifyArr.filter(item => {
                        return item.ID == value.name;
                    });
                    modifyCleanDays = modifyCycle[0].AbortIncompleteMultipartUpload && modifyCycle[0].AbortIncompleteMultipartUpload.DaysAfterInitiation ? modifyCycle[0].AbortIncompleteMultipartUpload.DaysAfterInitiation : 0;
                }
            }
            if(arr == "" || arr.Rule[0] || arr.Rule.constructor === Object){
                defaultLifeCycle = x2js.json2xml_str(arr);
            }
        }
        if (value.Status) {
            value.Status = value.Status.toLowerCase() == "enabled" ? "Enabled" : "Disabled";
        }
        let Rules = {
            Rule: {
                ID: value.name,
                Filter: { Prefix: value.prefix ? value.prefix : (value.newPrefix && value.newPrefix!='--' ? value.newPrefix : value.prefix)},
                Status: (((this.transChecked && this.transOptions.length != 0) || this.expirChecked || this.expirCleanUp) && value.enabled) ? "Enabled" :
                    value.Status ? value.Status : "Disabled"
            }
        }
        let jsonObj = x2js.json2xml_str(Rules);
        let ruleXml = "</Rule>";
        jsonObj = jsonObj.split("</Rule>")[0];

        if ((dialog == "create" || dialog == "update") && this.transChecked) {
            //In the create/modify state
            this.lifeCycleItems.forEach((item, index) => {
                let trans = {
                    Transition: {
                        StorageClass: value['transId' + index].transName ? value['transId' + index].transName : value['transId' + index],
                        Days: value['days' + index],
                        Backend: value['backendId' + index].backendName ? value['backendId' + index].backendName : value['backendId' + index],
                        TargetBucket: value['targetBucket' + index].name ? value['targetBucket' + index].name : value['targetBucket' + index]
                    }
                }
                trans = x2js.json2xml_str(trans);
                jsonObj = jsonObj + trans;
            })
        } else if (modifyCycle && modifyCycle[0].Transition) {
            //In the enable/disable state
            let newModifyTrans = modifyCycle[0].Transition;
            let trans;
            if (_.isArray(newModifyTrans)) {
                newModifyTrans.forEach(item => {
                    trans = {
                        Transition: {
                            StorageClass: item.StorageClass,
                            Days: item.Days,
                            Backend: item.Backend
                        }
                    }
                    trans = x2js.json2xml_str(trans);
                    jsonObj = jsonObj + trans;
                })
            } else {
                trans = {
                    Transition: {
                        StorageClass: newModifyTrans.StorageClass,
                        Days: newModifyTrans.Days,
                        Backend: newModifyTrans.Backend,
                        TargetBucket: newModifyTrans.TargetBucket
                    }
                }
                trans = x2js.json2xml_str(trans);
                jsonObj = jsonObj + trans;
            }
        }
        if ((dialog == "create" || dialog == "update") && this.expirChecked) {
            //In the create/modify state
            let expir = {
                Expiration: {
                    Days: value.expirDays
                }
            }
            expir = x2js.json2xml_str(expir);
            jsonObj = jsonObj + expir;
        } else if (modifyCycle && modifyCycle[0].Expiration) {
            //In the enable/disable state
            let expir = {
                Expiration: {
                    Days: modifyCycle[0].Expiration.Days
                }
            }
            expir = x2js.json2xml_str(expir);
            jsonObj = jsonObj + expir;
        }
        if ((dialog == "create" || dialog == "update") && this.expirCleanUp) {
            //In the create/modify state
            let Incomplete = {
                AbortIncompleteMultipartUpload: {
                    DaysAfterInitiation: value.cleanDays
                }
            }
            Incomplete = x2js.json2xml_str(Incomplete);
            jsonObj = jsonObj + Incomplete;
        } else if (modifyCleanDays && modifyCleanDays != 0) {
            //In the enable/disable state
            let Incomplete = {
                AbortIncompleteMultipartUpload: {
                    DaysAfterInitiation: modifyCleanDays
                }
            }
            Incomplete = x2js.json2xml_str(Incomplete);
            jsonObj = jsonObj + Incomplete;
        }
        let newLifeCycle = jsonObj + ruleXml;
        if (defaultLifeCycle) {
            xmlStr = xmlStr + defaultLifeCycle + newLifeCycle + `</LifecycleConfiguration>`;
        } else {
            xmlStr = xmlStr + newLifeCycle + `</LifecycleConfiguration>`;
        }
        return xmlStr;
    }
    checkStorageClass(control: FormControl): { [s: string]: boolean } {
        if (control.value == null) {
            return { storageClassNull: true }
        }
    }
    enableLifeCycle(selected) { 
        let msg, tableHtml, selectedArr = [];
        if(_.isArray(selected)){
            selectedArr = selected;
            msg = "<h3>Are you sure you want to enable the following life cycle rules?</h3>" + 
            "<div>When life cycle rules are enabled, objects affected by the rules convert storage categories or are automatically deleted after a specified number of days</div>" + 
            "<h3>[" + selected.length + " lifeCycle]</h3>";
        }else{
            selectedArr.push(selected);
            msg = "<h3>Are you sure you want to enable the following life cycle rules?</h3>" + 
            "<div>When life cycle rules are enabled, objects affected by the rules convert storage categories or are automatically deleted after a specified number of days</div>" + 
            "<h3>[" + selected.ObjectKey + "]</h3>";
        }
        this.confirmationService.confirm({
            message: msg,
            header: this.i18n.keyID['sds_lifeCycle_enable'],
            acceptLabel: this.i18n.keyID['ok'],
            isWarning: true,
            accept: () => {
                selectedArr.forEach(item => {
                    item.Status = "enabled"
                    item.name = item.ObjectKey;
                    this.onSubmit(item,"enable");
                })
            },
            reject: () => { }
        })
    }
    disableLifeCycle(selected) {
        let msg, tableHtml, selectedArr = [];
        if(_.isArray(selected)){
            selectedArr = selected;
            msg = "<h3>Are you sure you want to disable the following life cycle rules?</h3><div>The disabled life cycle rule no longer takes effect, and you can re-enable it as needed</div>" + 
            "<h3>[" + selected.length + "lifeCycle]</h3>";
        }else{
            selectedArr.push(selected);
            msg = "<h3>Are you sure you want to disable the following life cycle rules?</h3><div>The disabled life cycle rule no longer takes effect, and you can re-enable it as needed</div>" + 
            "<h3>[" + selected.ObjectKey + "]</h3>";
        }
        this.confirmationService.confirm({
            message: msg,
            header: this.i18n.keyID['sds_lifeCycle_disable'],
            acceptLabel: this.i18n.keyID['ok'],
            isWarning: true,
            accept: () => {
                selectedArr.forEach(item => {
                    item.Status = "disabled"
                    item.name = item.ObjectKey;
                    this.onSubmit(item,"disable");
                })
            },
            reject: () => { }
        })
    }
    //click the checkbox in the data
    checkBoxClick(selectedLifeCycle){
        this.disableCycle = false;
        this.enableCycle = false;
        selectedLifeCycle.forEach(item=>{
            if(item.Status == "enable"){
                this.disableCycle = true;
            }else{
                this.enableCycle = true;
            }
        })
    }
    ruleSwitch() {
        let ruleValue = this.createLifeCycleForm.get('enabled').value;
        this.ruleChecked = ruleValue ? true : false;
        this.createLifeCycleForm.patchValue({
            transEnabled: [],
            expirEnabled: [],
            expirCleanUp: []
        })
        this.modifyTrans = [];
        this.showAddTransRule = true;
        this.transChecked = false;
        this.expirChecked = false;
        this.expirCleanUp = false;
    }
    //trans days change
    transDaysChange(index) {
        let transLength: any;
        transLength = this.lifeCycleItems.length;
        this.lifeCycleItems.forEach((item, i) => {
            if (i > index && i < transLength) {
                let gapDays = this.transDaysArr[i] - this.transDaysArr[index];
                if (gapDays < 30) {
                    let defaultDays = this.transDaysArr[index];
                    this.transDaysArr[i] = defaultDays + 30;
                    this.createLifeCycleForm.value['days'+i] = this.transDaysArr[i];
                    index++;
                }
            }
        })
        if (this.expirChecked) {
            this.newExpirDays = this.transDaysArr[(transLength - 1)] + 1;
            this.minExpirDays = this.newExpirDays;
        }
    }
    addTransRules() {
        let index = this.lifeCycleItems.length;
        if (index > 0) {
            this.lifeCycleItems.push(this.lifeCycleItems[index - 1] + 1);
        } else {
            this.lifeCycleItems = [0];
        }
        this.lifeCycleItems.forEach((item, index) => {
            this.lifeCycleAddControl(index);
        });
        this.getTransOptions(index);
    }
    deleteTransRules(index) {
        this.lifeCycleItems.splice(index, 1);
        if(this.lifeCycleItems.length == 1){
            this.sameTransition = false;
        }
        this.lifeCycleDeleteControl(index);
        if (index == 0) {
            this.transOptions = [];
            if(this.modifyTrans && ((_.isArray(this.modifyTrans) && this.modifyTrans.length > 0)|| Object.keys(this.modifyTrans.length != 0))){
                this.modifyTrans = [];
            }
            
        }
        this.showAddTransRule = true;
        if(this.modifyBackend){
            this.modifyBackend = this.modifyBackend.filter((item,itemIndex)=>{
                return itemIndex != index;
            })
        }
        if(this.modifyBucket){
            this.modifyBucket = this.modifyBucket.filter((item,itemIndex)=>{
                return itemIndex != index;
            })
        }
    }
    // lifeCycle add control
    lifeCycleAddControl(index) {
        if (index != 0 || !this.createLifeCycleForm.value["days0"]) {
            this.createLifeCycleForm.addControl('days' + index, this.fb.control(30, Validators.required));
            this.createLifeCycleForm.addControl('transId' + index, this.fb.control('', Validators.required));
            this.createLifeCycleForm.addControl('backendId' + index, this.fb.control(this.defaultBackend));
            this.createLifeCycleForm.addControl('targetBucket' + index, this.fb.control('', Validators.required));
            this.backendShow.push(false)
        }
    }
    //lifeCycle delete control
    lifeCycleDeleteControl(index) {
        this.transDaysArr.splice(index, 1);
        this.createLifeCycleForm.removeControl('days' + index);
        this.createLifeCycleForm.removeControl('transId' + index);
        this.createLifeCycleForm.removeControl('backendId' + index);
        this.createLifeCycleForm.removeControl('targetbucket' + index);
        this.backendShow = this.backendShow.filter((item, i) => {
            return i != index;
        })
        this.bucketShow = this.bucketShow.filter((item, i) => {
            return i != index;
        })
    }
    createLifeCycleSubmit(param) {
        window['getAkSkList'](() => {
            let requestMethod = "PUT";
            let url = '/' + this.bucketId + "/?lifecycle";
            let requestOptions: any;
            let options: any = {};
            requestOptions = window['getSignatureKey'](requestMethod, url, '', '', '', param) ;
            options['headers'] = new Headers();
            options = this.BucketService.getSignatureOptions(requestOptions, options);
            this.BucketService.createLifeCycle(this.bucketId , param, options).subscribe((res) => {
                
                this.msgs = [];
                if(this.showModifyLifeCycle){
                    this.msgs.push({severity: 'success', summary: "Success", detail: "Lifecycle rule has been updated successfully"});	    
                } else{
                    this.msgs.push({severity: 'success', summary: "Success", detail: "Lifecycle rule has been created successfully"});	
                }
                this.showCreateLifeCycle = false;
                this.showRightSidebar = false;
                this.showModifyLifeCycle = false;
                this.getLifeCycleList();
            },(error) => {
                    this.msgs = [];
                    this.msgs.push({severity: 'error', summary: "Error", detail: error._body});		
            })
            
        })
    }
    //Determining whether the values for transition and backend are the same is not recommended for user creation
    getTransValue(value){
        if(this.lifeCycleItems.length > 1){
            let defaultSameTrans;
            this.lifeCycleItems.forEach((item,index)=>{
                if(index < this.lifeCycleItems.length-1){
                    let [trans1,trans2,backend1,backend2, targetBucket1, targetBucket2] = ['transId'+index, 'transId'+(index+1), 'backendId'+index, 'backendId'+(index+1), 'targetBucket'+index, 'targetBucket'+(index+1)];
                    let newTrans1 = value[trans1].transName? value[trans1].transName : value[trans1];
                    let newTrans2 = value[trans2].transName? value[trans2].transName : value[trans2];
                    let newBackend1 = value[backend1].backendName ? value[backend1].backendName : value[backend1];
                    let newBackend2 = value[backend2].backendName ? value[backend2].backendName : value[backend2];
                    let newTargetBucket1 = value[targetBucket1].name ? value[targetBucket1].name : value[targetBucket1];
                    let newTargetBucket2 = value[targetBucket2].name ? value[targetBucket2].name : value[targetBucket2];
                    let transTrue = newTrans1 && newTrans2 && newTrans1 == newTrans2;
                    if(transTrue && (((newBackend1 && newBackend2 && newBackend1 == newBackend2) || !newBackend1 || !newBackend2) || ((newTargetBucket1 && newTargetBucket2 && newTargetBucket1 == newTargetBucket2) || !newTargetBucket1 || !newTargetBucket2))){
                        this.sameTransition = true;
                    }else{
                        this.sameTransition = false;
                    }
                    if(!defaultSameTrans){
                        defaultSameTrans = this.sameTransition;
                    }
                }
            })
            if(defaultSameTrans != this.sameTransition || (defaultSameTrans && this.sameTransition)){
                this.sameTransition = true;
            }else{
                this.sameTransition = false;
            }
        }else{
            this.sameTransition = false;
        }
    }
    onSubmit(value,dialog?) {
        if(this.showModifyLifeCycle){
            dialog = "update";
        }else if(this.showCreateLifeCycle){
            dialog = "create";
        }
        //this dialog here is used to distinguish whether the Enable or disable operation
        if (this.sameTransition || (!dialog && !this.createLifeCycleForm.valid)) {
            for (let i in this.createLifeCycleForm.controls) {
                this.createLifeCycleForm.controls[i].markAsTouched();
            }
            return;
        };
        
        let data;
        if(dialog){
            data = this.getLifeCycleDataArray(value, this.submitObj,dialog);
        }else{
            data = this.getLifeCycleDataArray(value, this.submitObj);
        }
        this.createLifeCycleSubmit(data);
    }
    getErrorMessage(control, extraParam) {
        let page = "";
        let key = Utils.getErrorKey(control, page);
        return extraParam ? this.i18n.keyID[key].replace("{0}", extraParam) : this.i18n.keyID[key];
    }
    batchDelete(value) {
        if (value) {
            let msg, arr = [];
            if (_.isArray(value)) {
                arr = value;
                msg = "<div>Are you sure you want to delete the selected LifeCycles?</div><h3>[ " + value.length + " LifeCycle ]</h3>";
            } else {
                arr.push(value)
                msg = "<div>Are you sure you want to delete the selected LifeCycle?</div><h3>[ " + value.ObjectKey + " ]</h3>";
            }
            this.confirmationService.confirm({
                message: msg,
                header: this.i18n.keyID['sds_lifeCycle_delete'],
                acceptLabel: this.i18n.keyID['sds_block_volume_delete'],
                isWarning: true,
                accept: () => {
                    arr.forEach((item, index) => {
                        if(arr.length > 1){
                            this.deleteLifeCycle(item,"multiple");
                        }else{
                            this.deleteLifeCycle(item);
                        }
                    })
                },
                reject: () => { }
            })
        }

    }

    deleteLifeCycle(value, multiple?) {
        //Multiple means batch deletion
        window['getAkSkList'](() => {
            
                let requestMethod = "DELETE";
                let url = '/' + this.bucketId + "/?lifecycle" + "&ruleID=" + value.ObjectKey;
                let requestOptions: any;
                let options: any = {};
                requestOptions = window['getSignatureKey'](requestMethod, url);
                options['headers'] = new Headers();
                options = this.BucketService.getSignatureOptions(requestOptions, options);
                let requestUrl = this.bucketId + "/?lifecycle" + "&ruleID=" + value.ObjectKey;
                this.BucketService.deleteLifeCycle(requestUrl, options).subscribe((res) => {
                    let lifeCycleArr = _.filter(this.lifeCycleAlls, item=>{
                        item.name = item.ObjectKey;
                        return item.ObjectKey != value.ObjectKey;
                    });
                    this.modifyArr = _.filter(this.modifyArr, item => {
                       return item.ID != value.ObjectKey;
                    })
                    this.submitObj.LifecycleConfiguration.Rule = _.filter(this.submitObj.LifecycleConfiguration.Rule,it=>{
                        return it.ID != value.ObjectKey;
                    })
                    if(lifeCycleArr.length >0 && !multiple){
                        let data = this.getLifeCycleDataArray(lifeCycleArr[0], this.submitObj, lifeCycleArr[0].Status);
                        this.createLifeCycleSubmit(data);
                    }else{
                        this.getLifeCycleList();
                    }
		}, (error) => {
                    this.msgs = [];
                    this.msgs.push({severity: 'error', summary: "Error", detail: error._body});
                })
        })
    }
    //lifeCycle page initialization in modified statue
    editFile(cycle) {
        let modifyCycle = this.modifyArr.filter(item => {
            return item.ID == cycle.ObjectKey;
        });
        this.modifyTrans = modifyCycle[0].Transition ? modifyCycle[0].Transition : '';
        let expir = modifyCycle[0].Expiration ? modifyCycle[0].Expiration : '';
        let expirDays = expir ? parseInt(expir.Days) : 1;
        let cleanUp = modifyCycle[0].AbortIncompleteMultipartUpload && modifyCycle[0].AbortIncompleteMultipartUpload.DaysAfterInitiation ? modifyCycle[0].AbortIncompleteMultipartUpload.DaysAfterInitiation : 0;
        let cleanUpDay = parseInt(cleanUp) != 0 ? parseInt(cleanUp) : 7;
        this.transChecked = this.modifyTrans ? true : false;
        this.expirChecked = expir ? true : false;
        this.expirCleanUp = cleanUp && cleanUp != 0 ? true : false;
        let ruleEnable = (this.modifyTrans || expir)? true : false;
        this.ruleChecked = ruleEnable;
        this.createLifeCycleForm = this.fb.group({
            'name': new FormControl(modifyCycle[0].ID, { validators: [Validators.required, Utils.isExisted(this.allLifeCycleForCheck), Validators.pattern(this.validRule.name)], updateOn: 'change' }),
            "prefix": new FormControl(modifyCycle[0].Filter && modifyCycle[0].Filter.Prefix ? modifyCycle[0].Filter.Prefix : '', { validators: [Utils.isExisted(this.allLifeCycleCheckPrefix)] }),
            "enabled": new FormControl(ruleEnable, { validators: [Validators.required], updateOn: 'change' }),
            "transEnabled": new FormControl(this.modifyTrans && ruleEnable ? ['trans'] : []),
            "expirEnabled": new FormControl(expir && ruleEnable ? ['expir'] : []),
            "expirDays": new FormControl(expirDays, Validators.required),
            "cleanDays": new FormControl(cleanUpDay),
            "expirCleanUp": new FormControl(this.expirCleanUp && ruleEnable ? ['cleanUp'] : []),
        })
        this.newExpirDays = expirDays;
        if (ruleEnable && this.modifyTrans) {
            let lastTrans;
            if (_.isArray(this.modifyTrans)) {
                this.modifyTrans.forEach((item, index) => {
                    let transItem = {
                        value : {
                            backendName: item.Backend
                        }
                    }
                    this.getBuckets(transItem, index);
                    this.getModifyTrans(item, index, cycle);
                    
                })
                let lastTransIndex = this.modifyTrans.length -1;
                lastTrans = this.createLifeCycleForm.value['transId' + lastTransIndex];
            } else {
                let transItem = {
                    value : {
                        backendName: this.modifyTrans['Backend']
                    }
                }
                this.getBuckets(transItem, 0);
                this.getModifyTrans(this.modifyTrans, 0, cycle);
                lastTrans = this.createLifeCycleForm.value['transId0'];
            }
            if(lastTrans == "GLACIER"){
                this.showAddTransRule = false;
            }else{
                this.showAddTransRule = true;
            }
        }
    }
    getModifyTrans(item, index, cycle) {
        this.createLifeCycleForm.addControl('days' + index, this.fb.control(item.Days, Validators.required));
        this.createLifeCycleForm.addControl('transId' + index, this.fb.control(item.StorageClass, Validators.required));
        this.createLifeCycleForm.addControl('backendId' + index, this.fb.control(item.Backend));
        this.createLifeCycleForm.addControl('targetBucket' + index, this.fb.control(item.TargetBucket));
        this.modifyBackend.push(item.Backend);
        this.modifyBucket.push(item.TargetBucket);
        this.transDaysArr[index] = parseInt(item.Days);
        this.backendShow.push(true)
        this.bucketShow.push(true);
        if (index == 0) {
            this.lifeCycleItems = [0];
            let defaultTrans = this.createLifeCycleForm.value['transId0'];
            if (defaultTrans != "GLACIER") {
                this.minDays.push(30);
            } else {
                this.minDays.push(1);
            }
        } else {
            this.lifeCycleItems.push(this.lifeCycleItems[index - 1] + 1);
            let day = index == 1 ? 60 : 90;
            this.minDays.push(day);
        }
        this.getTransOptions(index, cycle);
        
    }
    cancelCycle() {
        this.showCreateLifeCycle = false;
        this.showModifyLifeCycle = false;
        this.showRightSidebar = false;
        this.createLifeCycleForm.reset();
    }
}