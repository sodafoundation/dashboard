import { Router,ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { I18NService ,Consts,Utils,MsgBoxService} from 'app/shared/api';
import { AppService } from 'app/app.service';
import { trigger, state, style, transition, animate} from '@angular/animations';
import { I18nPluralPipe } from '@angular/common';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { MenuItem ,ConfirmationService, Message} from '../../components/common/api';
import { BucketService} from './buckets.service';
import { debug } from 'util';
import { MigrationService } from './../dataflow/migration.service';
import { Http, Headers } from '@angular/http';
declare let X2JS:any;
@Component({
    selector: 'bucket-list',
    templateUrl: './buckets.html',
    styleUrls: [],
    providers: [ConfirmationService],
    animations: [
        trigger('overlayState', [
            state('hidden', style({
                opacity: 0
            })),
            state('visible', style({
                opacity: 1
            })),
            transition('visible => hidden', animate('400ms ease-in')),
            transition('hidden => visible', animate('400ms ease-out'))
        ]),

        trigger('notificationTopbar', [
            state('hidden', style({
            height: '0',
            opacity: 0
            })),
            state('visible', style({
            height: '*',
            opacity: 1
            })),
            transition('visible => hidden', animate('400ms ease-in')),
            transition('hidden => visible', animate('400ms ease-out'))
        ])
    ]
})
export class BucketsComponent implements OnInit{
    selectedBuckets=[];
    allBuckets = [];
    createBucketForm:FormGroup;
    errorMessage :Object;
    createBucketDisplay=false;
    showLife = false;
    backendsOption = [];
    lifeOperation = [];
    lifeOperation1 = [];
    allBackends = [];
    allTypes = [];
    excute = [];
    dataAnalysis = [];
    createMigrateShow = false;
    selectTime = true;
    showAnalysis = false;
    migrationForm:FormGroup;
    analysisForm:FormGroup;
    bucketOption = [];
    availbucketOption =[];
    backendMap = new Map();
    selectedBucket = {
        name:"",
        id:""
    };
    selectType;
    allBucketNameForCheck=[];
    showCreateBucket = false;
    akSkRouterLink = "/akSkManagement";
    enableVersion: boolean;
    enableEncryption = false;
    sseTypes = [];
    selectedSse;
    isSSE: boolean = false;
    isSSEKMS: boolean = false;
    isSSEC: boolean = false;
    msgs: Message[];

    constructor(
        public I18N: I18NService,
        private router: Router,
        private ActivatedRoute:ActivatedRoute,
        private confirmationService: ConfirmationService,
        private fb:FormBuilder,
        private BucketService: BucketService,
        private MigrationService:MigrationService,
        private http:Http,
        private msg: MsgBoxService
    ){
        this.errorMessage = {
            "name": { required: "Name is required.",isExisted:"Name is existing" },
            "backend_type": { required: "Type is required." },
            "backend":{ required: "Backend is required." },
            "destBucket":{ required: "Destination Bucket is required." },
        };
        this.createBucketForm = this.fb.group({
            "backend":["",{validators:[Validators.required], updateOn:'change'}],
            "backend_type":["",{validators:[Validators.required], updateOn:'change'}],
            "name":["",{validators:[Validators.required,Utils.isExisted(this.allBucketNameForCheck)], updateOn:'change'}],
            "version": [false, { validators: [Validators.required], updateOn: 'change' }],
            "encryption": [false, { validators: [Validators.required], updateOn: 'change' }],
            "sse":["",{}],
        });
        this.migrationForm = this.fb.group({
            "name": ['',{validators:[Validators.required], updateOn:'change'}],
            "destBucket":['',{validators:[Validators.required], updateOn:'change'}],
            "rule":[''],
            "deleteSrcObject":[false],
            "excuteTime":[new Date()],
            "excute":[true]
        });
        this.analysisForm = this.fb.group({
            "analysisCluster":[""],
            "ak":[""],
            "sk":[""],
            "jar":[""],
            "anaparam":[""]
        });
    }

    ngOnInit() {
        this.allBuckets = [];
        this.lifeOperation =[{
            label:'Migration',
            value:'Migration'
        },
        {
            label:'Delete',
            value:'Delete'
        }];
        this.lifeOperation1 =[
        {
            label:'Delete',
            value:'Delete'
        },{
            label:'Migration',
            value:'Migration'
        }];
        this.allBackends = [];
        this.getBuckets();
        this.sseTypes = [
            {
                label: "SSE",
                value: 'sse'
            }
        ]
    }
    showcalendar(){
        this.selectTime = !this.selectTime;
    }
    showDetail(){
        this.showAnalysis = !this.showAnalysis;
    }
    configMigration(bucket){
        this.availbucketOption = [];
        this.createMigrateShow=true;
        this.selectedBucket = bucket;
        this.migrationForm.reset(
            {
            'name':'',
            "deleteSrcObject":false,
            "excuteTime":new Date(),
            "excute":true
            }
        );
        this.selectTime = true;
        this.bucketOption.forEach((value,index)=>{
            if(Consts.BUCKET_BACKND.get(value.label) !== Consts.BUCKET_BACKND.get(bucket.name)){
                this.availbucketOption.push({
                    label:value.label,
                    value:value.value
                });
            }
        });
    }
    getBuckets() {
        this.allBuckets = [];
        this.bucketOption = [];
        this.allBucketNameForCheck = [];
        window['getAkSkList'](()=>{
            let requestMethod = "GET";
            let url = this.BucketService.url;
            window['canonicalString'](requestMethod, url,()=>{
                let options: any = {};
                this.getSignature(options);
                if(Object.keys(options).length > 0){
                    this.showCreateBucket = false;
                    this.BucketService.getBuckets(options).subscribe((res) => {
                        let str = res._body;
                        let x2js = new X2JS();
                        let jsonObj = x2js.xml_str2json(str);
                        let buckets = (jsonObj ? jsonObj.ListAllMyBucketsResult.Buckets:[]);
                        if(Object.prototype.toString.call(buckets) === "[object Array]"){
                            this.allBuckets = buckets;
                        }else if(Object.prototype.toString.call(buckets) === "[object Object]"){
                            this.allBuckets = [buckets];
                        }
                        this.allBuckets.forEach(item=>{
                            item.name =item.Name;
                            this.allBucketNameForCheck.push(item.Name);
                            item.createdAt = Utils.formatDate(item.CreationDate);
                            this.bucketOption.push({
                                label:item.name,
                                value:item.name
                            });
                            item.encryptionEnabled = item.SSEConfiguration.SSE.enabled.toLowerCase() == "true" ? true : false;
                            item.versionEnabled = item.VersioningConfiguration.Status.toLowerCase() == "enabled" ? true : false;
                        });
                        this.initBucket2backendAnd2Type();
                    });
                }else{
                    this.showCreateBucket = true;
                }
            })
        })
    }
    //Request header with AK/SK authentication added
    getSignature(options) {
        let SignatureObjectwindow = window['getSignatureKey']();
        if(Object.keys(SignatureObjectwindow.SignatureKey).length > 0){
            let requestObject = this.BucketService.getSignatureOptions(SignatureObjectwindow, options);
            options = requestObject['options'];
            return options;
        }
    }
    initBucket2backendAnd2Type(){
        window['getAkSkList'](()=>{
            let requestMethod = "GET";
            let url = this.BucketService.url;
            window['canonicalString'](requestMethod, url,()=>{
                let options: any = {};
                this.getSignature(options);
                this.BucketService.getBuckets(options).subscribe((res)=>{
                    let str = res['_body'];
                    let x2js = new X2JS();
                    let jsonObj = x2js.xml_str2json(str);
                    let buckets = (jsonObj ? jsonObj.ListAllMyBucketsResult.Buckets:[]);
                    let allBuckets = [];
                    if(Object.prototype.toString.call(buckets) === "[object Array]"){
                        allBuckets = buckets;
                    }else if(Object.prototype.toString.call(buckets) === "[object Object]"){
                        allBuckets = [buckets];
                    }
                    Consts.BUCKET_BACKND.clear();
                    Consts.BUCKET_TYPE.clear();
                    this.http.get('v1/{project_id}/backends').subscribe((res)=>{
                        let backends = res.json().backends ? res.json().backends :[];
                        let backendsObj = {};
                        backends.forEach(element => {
                            backendsObj[element.name]= element.type;
                        });
                        allBuckets.forEach(item=>{
                            Consts.BUCKET_BACKND.set(item.Name,item.LocationConstraint);
                            Consts.BUCKET_TYPE.set(item.Name,backendsObj[item.LocationConstraint]);
                        });
                    });
                });
            })
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
    createMigration(){
        if(!this.migrationForm.valid){
            for(let i in this.migrationForm.controls){
                this.migrationForm.controls[i].markAsTouched();
            }
            return;
        }
        let param = {
            "name": this.migrationForm.value.name,
            "description": "for test",
            "type": "migration",
            "sourceConn": {
                "storType": "opensds-obj",
                "bucketName": this.selectedBucket.name,
            },
            "destConn": {
                "storType": "opensds-obj",
                "bucketName": this.migrationForm.value.destBucket
            },
            "filter": {},
            "remainSource": !this.migrationForm.value.deleteSrcObject
        }
        if(this.migrationForm.value.excute){
            this.MigrationService.createMigration(param).subscribe((res) => {
                this.createMigrateShow = false;
                let planId = res.json().plan.id;
                this.http.post(`v1/{project_id}/plans/${planId}/run`,{}).subscribe((res)=>{});
            });
        }else{
            let date = new Date(this.migrationForm.value.excuteTime);
            let tigger = `00 ${date.getUTCMinutes()} ${date.getUTCHours()} ${date.getUTCDate()} ${date.getUTCMonth() + 1} ${date.getUTCDay()}`;
            let policy={
                "name":"cron test",
                "tenant":"all",
                "description":"cron test function",
                "schedule": {
                    "type":"cron",
                    "tiggerProperties":tigger
                }
            };
            this.http.post('v1/{project_id}/policies',policy).subscribe((res)=>{
                param['policyId'] = res.json().policy.id;
                param['policyEnabled'] = true;
                this.MigrationService.createMigration(param).subscribe((res) => {
                    this.createMigrateShow = false;
                });
            })
        }    
    }
    getBackendsByTypeId() {
        this.backendsOption = [];
        this.BucketService.getBackendsByTypeId(this.selectType).subscribe((res) => {
            let backends = res.json().backends ? res.json().backends :[];
            backends.forEach(element => {
                this.backendsOption.push({
                    label: element.name,
                    value: element.name
                })
            });
        });
    }

    getBackends() {
        this.allBackends = [];
        this.BucketService.getBckends().subscribe((res) => {
            res.json().forEach(element => {
                this.allBackends.push({
                    label: element.name,
                    value: element.name
                })
            });
        });
    }
    versionControl(){
        this.enableVersion = this.createBucketForm.get('version').value;
    }
    encryptionControl(){
        this.enableEncryption = this.createBucketForm.get('encryption').value;
    }
    creatBucket(){
        if(!this.createBucketForm.valid){
            for(let i in this.createBucketForm.controls){
                this.createBucketForm.controls[i].markAsTouched();
            }
            return;
        }
        let param = {
            name:this.createBucketForm.value.name,
            backend_type:this.createBucketForm.value.backend_type,
            backend:this.createBucketForm.value.backend
        };
        let xmlStr = `<CreateBucketConfiguration xmlns=\"http://s3.amazonaws.com/doc/2006-03-01/\">
                        <LocationConstraint>${this.createBucketForm.value.backend}</LocationConstraint>
                    </CreateBucketConfiguration>`
        window['getAkSkList'](()=>{
            let requestMethod = "PUT";
            let url = this.BucketService.url+"/"+this.createBucketForm.value.name;
            window['canonicalString'](requestMethod, url,()=>{
                let options: any = {};
                this.getSignature(options);
                options.headers.set('Content-Type','application/xml');
                this.BucketService.createBucket(this.createBucketForm.value.name,xmlStr,options).subscribe((res)=>{
                    this.createBucketDisplay = false;
                    /* Add the PUT Encryption Call here before fetching the updated list of Buckets */
                    if(this.enableEncryption){
                        this.bucketEncryption();
                    }
                    if(this.enableVersion){
                       this.enableBucketVersioning(this.createBucketForm.value.name);
                    }
                    if(!this.enableEncryption && !this.enableVersion){
                        this.getBuckets();
                    }
                    this.msgs = [];
                    this.msgs.push({severity: 'success', summary: 'Success', detail: 'Bucket has been created successfully.'});
                    /* Call the getBuckets call in the success of the encryption call */
                    
                },(error)=>{
                    this.msgs = [];
                    this.msgs.push({severity: 'error', summary: "Error", detail: error._body});
                }); 
            })
        })           
    }

    bucketEncryption(){
        switch (this.selectedSse) {
            case 'sse':
                this.isSSE = true;
                break;
            case 'sse-kms':
                this.isSSEKMS = true;
                break;
            case 'sse-c':
                this.isSSEC = true;
                break;
        
            default:
                break;
        }
        
        let encryptStr = `<SSEConfiguration>
        <SSE>
            <enabled>${this.isSSE}</enabled>
        </SSE>
        <SSE-KMS>
            <enabled>${this.isSSEKMS}</enabled>
            <DefaultKMSMasterKey>string</DefaultKMSMasterKey>
        </SSE-KMS>
    </SSEConfiguration>`;
        window['getAkSkList'](()=>{
            let requestMethod = "PUT";
            let url = this.BucketService.url+"/"+this.createBucketForm.value.name + "/?DefaultEncryption";
            window['canonicalString'](requestMethod, url,()=>{
                let options: any = {};
                this.getSignature(options);
                options.headers.set('Content-Type','application/xml');
                this.BucketService.setEncryption(this.createBucketForm.value.name,encryptStr,options).subscribe((res)=>{
                    if(this.enableVersion){
                        this.enableBucketVersioning(this.createBucketForm.value.name);
                        this.enableVersion = false;
                    }
                    this.getBuckets();
                }, (error) => {
                    console.log("Set encryption failed", error);
                });
            });
        })
    }
    showEnableVersioning(bucketName){
        let msg = "<div>Are you sure you want to Enable Versioning on the Bucket ?</div><h3>[ "+ bucketName +" ]</h3>";
        let header ="Enable Versioning";
        let acceptLabel = "Enable";
        let warming = false;
        this.confirmDialog([msg,header,acceptLabel,warming,"enable"], bucketName);
    }
    enableBucketVersioning(bucketName){
        let versionStr = `<VersioningConfiguration>
        <Status>Enabled</Status>
      </VersioningConfiguration>`
        window['getAkSkList'](()=>{
            let requestMethod = "PUT";
            let url = this.BucketService.url+"/"+bucketName + "/?versioning";
            window['canonicalString'](requestMethod, url,()=>{
                let options: any = {};
                this.getSignature(options);
                options.headers.set('Content-Type','application/xml');
                this.BucketService.setVersioning(bucketName, versionStr, options).subscribe(()=>{
                    
                    if(this.enableEncryption){
                        this.bucketEncryption();
                        this.enableEncryption=false;
                    }
                    this.msgs = [];
                    this.msgs.push({severity: 'success', summary: 'Success', detail: 'Versioning enabled successfully.'});
                    this.getBuckets();
                }, (error) =>{
                    console.log("Set versioning failed", error);
                    this.msgs = [];
                    this.msgs.push({severity: 'error', summary: 'Error', detail: "Enable versioning failed <br/>" + error});
                });
            });
        });
    }
    showSuspendVersioning(bucketName){
        let msg = "<div>Are you sure you want to Suspend Versioning on the Bucket ?</div><h3>[ "+ bucketName +" ]</h3>";
        let header ="Suspend Versioning";
        let acceptLabel = "Suspend";
        let warming = true;
        this.confirmDialog([msg,header,acceptLabel,warming,"suspend"], bucketName);
    }
    suspendVersioning(bucketName){
        console.log("Suspend Versioning", bucketName);
        let versionStr = `<VersioningConfiguration>
                                        <Status>Suspended</Status>
                                    </VersioningConfiguration>`
        window['getAkSkList'](()=>{
            let requestMethod = "PUT";
            let url = this.BucketService.url+"/"+bucketName + "/?versioning";
            window['canonicalString'](requestMethod, url,()=>{
                let options: any = {};
                this.getSignature(options);
                options.headers.set('Content-Type','application/xml');
                this.BucketService.suspendVersioning(bucketName, versionStr, options).subscribe(()=>{
                    this.msgs = [];
                    this.msgs.push({severity: 'success', summary: 'Success', detail: 'Versioning suspended successfully.'});
                    this.getBuckets();
                }, (error) =>{
                    console.log("Suspend versioning failed", error);
                    this.msgs = [];
                    this.msgs.push({severity: 'error', summary: 'Error', detail: "Suspend versioning failed <br/>" + error});
                });
            });
        });
        
    }
    showCreateForm(){
        this.createBucketDisplay = true;
        this.enableEncryption = false;
        this.enableVersion = false;
        this.createBucketForm.reset(
            {
                "backend":"",
                "backend_type":"",
                "name":"",
                "version": false,
                "encryption": false
            }
        );
        this.createBucketForm.controls['name'].setValidators([Validators.required,Utils.isExisted(this.allBucketNameForCheck)]);
        this.getTypes();
    }
    deleteBucket(bucket){
        window['getAkSkList'](()=>{
            let requestMethod = "GET";
            let url = this.BucketService.url + '/' + bucket.name;
            window['canonicalString'](requestMethod, url,()=>{
                let options: any = {};
                this.getSignature(options);
                this.BucketService.getBucketById(bucket.name,options).subscribe((res) => {
                    let str = res._body;
                    let x2js = new X2JS();
                    let jsonObj = x2js.xml_str2json(str);
                    let alldir = jsonObj.ListBucketResult.Contents ? jsonObj.ListBucketResult.Contents :[] ;
                    if(alldir.length === 0){
                        this.http.get(`v1/{project_id}/plans?bucketname=${bucket.name}`).subscribe((res)=>{
                            let plans = res.json().plans ? res.json().plans : [];
                            let planNames = plans.map((item)=> item.name);
                            if(plans.length === 0){
                                let msg = "<div>Are you sure you want to delete the Bucket ?</div><h3>[ "+ bucket.name +" ]</h3>";
                                let header ="Delete";
                                let acceptLabel = "Delete";
                                let warming = true;
                                this.confirmDialog([msg,header,acceptLabel,warming,"delete"], bucket);
                            }else{
                                let msg = `<div>The bucket has created the following migration task, 
                                and removing the bucket will remove the migration task at the same time.</div>
                                <h5>[${planNames}]</h5>
                                <div>Are you sure you want to delete the Bucket?</div>
                                <h3>[${bucket.name}]</h3>
                                `;
                                let header ="Delete";
                                let acceptLabel = "Delete";
                                let warming = true;
                                this.confirmDialog([msg,header,acceptLabel,warming,"delete"], bucket,plans);
                            }
                        });
                    }else{
                        this.msg.info("The bucket cannot be deleted. please delete objects first.");
                    }
                }); 
            })
             
        })
        
    }
    configLife(bucket){
        this.showLife = true;
    }
    confirmDialog([msg,header,acceptLabel,warming=true,func], bucket,plans?){
        this.confirmationService.confirm({
            message: msg,
            header: header,
            acceptLabel: acceptLabel,
            isWarning: warming,
            accept: ()=>{
                try {
                    switch (func) {
                        case "delete":  console.log("Delete Confirm");
                                        let name = bucket.name;
                                        if(plans){
                                            plans.forEach(element => {
                                                this.http.delete(`v1/{project_id}/plans/${element.id}`).subscribe();
                                            });
                                        }
                                        window['getAkSkList'](()=>{
                                            let requestMethod = "DELETE";
                                            let url = this.BucketService.url + '/' + name;
                                            window['canonicalString'](requestMethod, url,()=>{
                                                let options: any = {};
                                                this.getSignature(options);
                                                this.BucketService.deleteBucket(name,options).subscribe((res) => {
                                                    this.getBuckets();
                                                },
                                                error=>{
                                                    this.getBuckets();
                                                });
                                            })
                                        })
                                        break;
                        
                        case "suspend": console.log("Suspend Confirm")
                                        this.suspendVersioning(bucket);
                                        break;
                        case "enable": console.log("Enable Confirm");
                                        this.suspendVersioning(bucket);
                                        break;
                    
                        default:
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

}
