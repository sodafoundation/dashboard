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
import { ServicePlanService } from '../service-plan/service-plan.service';
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
    showRightSidebar: boolean = false;
    listedBackends: any;
    selectedRegion: any;
    selectedBuckets=[];
    allBuckets = [];
    createBucketForm:FormGroup;
    errorMessage :Object;
    validRule: any;
    createBucketDisplay=false;
    showLife = false;
    backendsOption = [];
    lifeOperation = [];
    lifeOperation1 = [];
    allBackends = [];
    allTypes = [];
    allTiers = [];
    tierOptions = [];
    selectTier;
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
    allMigrationsName=[];
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
    showAKSKWarning: boolean;
    servicePlansEnabled: boolean;
    isAdmin: boolean;
    isUser: boolean;
    constructor(
        public I18N: I18NService,
        private router: Router,
        private ActivatedRoute:ActivatedRoute,
        private confirmationService: ConfirmationService,
        private fb:FormBuilder,
        private BucketService: BucketService,
        private servicePlanService: ServicePlanService,
        private MigrationService:MigrationService,
        private http:Http,
        private msg: MsgBoxService
    ){
        this.showAKSKWarning = window['akskWarning'];
        this.servicePlansEnabled = Consts.STORAGE_SERVICE_PLAN_ENABLED;
        this.isAdmin = window['isAdmin'];
        this.isUser = window['isUser'];
        this.errorMessage = {
            "name": { 
                required: "Name is required.", 
                isExisted:"This name already exists.",
                minlength: "The bucket name should have minimum 3 characters.",
                maxlength: "The bucket name can have maximum 63 characters.",
                pattern: "Please enter valid bucket name."
            },
            "backend_type": { required: "Type is required." },
            "backend":{ required: "Backend is required." },
            "destBucket":{ required: "Destination Bucket is required." },
            "tier" : { required: "Service Plan is required." }
        };
        this.validRule = {
            'validName' : '^[a-z0-9][a-z0-9\.\-]{1,61}[a-z0-9]$'
        };
        this.createBucketForm = this.fb.group({
            "name":["",{validators:[Validators.required, Validators.minLength(3), Validators.maxLength(63), Validators.pattern(this.validRule.validName), 
                Utils.isExisted(this.allBucketNameForCheck)], updateOn:'change'}],
            "backend":["",{validators:[Validators.required], updateOn:'change'}],
            "backend_type":["",{validators:[Validators.required], updateOn:'change'}],
            "version": [false],
            "encryption": [false, { validators: [Validators.required], updateOn: 'change' }],
            "sse":["",{}],
        });
        this.migrationForm = this.fb.group({
            "name": ['',{validators:[Validators.required, Utils.isExisted(this.allMigrationsName)], updateOn:'change'}],
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
        this.getMigrations();
        if(this.servicePlansEnabled){
            this.getTiers();
        } 
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
        this.showRightSidebar = true;
        this.availbucketOption = [];
        this.createMigrateShow=true;
        this.selectedBucket = bucket;
        this.migrationForm.controls['name'].setValidators([Validators.required,Utils.isExisted(this.allMigrationsName)]);
        this.selectTime = true;
        if(!this.servicePlansEnabled){
            this.bucketOption.forEach((value,index)=>{
                if(Consts.BUCKET_BACKND.get(value.label) !== Consts.BUCKET_BACKND.get(bucket.name)){
                    this.availbucketOption.push({
                        label:value.label,
                        value:value.value
                    });
                }
            });
        } else{
            this.bucketOption.forEach((value,index)=>{
                if(bucket.name != value.label){
                    this.availbucketOption.push({
                        label:value.label,
                        value:value.value
                    });
                }
            });
        }
        
    }
    getBuckets() {
        this.allBuckets = [];
        this.bucketOption = [];
        this.allBucketNameForCheck = [];
        window['getAkSkList'](()=>{
            let requestMethod = "GET";
            let url = this.BucketService.url;
            let requestOptions: any;
            let options: any = {};
            requestOptions = window['getSignatureKey'](requestMethod, url);
            options['headers'] = new Headers();
            options = this.BucketService.getSignatureOptions(requestOptions, options);
            if(Object.keys(options).length > 0){
                this.showCreateBucket = false;
                this.BucketService.getBuckets(options).subscribe((res) => {
                    let str = res._body;
                    let x2js = new X2JS();
                    let jsonObj = x2js.xml_str2json(str);
                    let buckets = (jsonObj ? jsonObj.ListAllMyBucketsResult.Buckets.Bucket:[]);
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
                    if(!this.servicePlansEnabled){
                        this.initBucket2backendAnd2Type();
                    }                    
                });
            }else{
                this.showCreateBucket = true;
            }
        })
    }
   
    initBucket2backendAnd2Type(){
        window['getAkSkList'](()=>{
            let requestMethod = "GET";
            let url = this.BucketService.url;
            let requestOptions: any;
            let options: any = {};
            requestOptions = window['getSignatureKey'](requestMethod, url);
            options['headers'] = new Headers();
            options = this.BucketService.getSignatureOptions(requestOptions, options);
            this.BucketService.getBuckets(options).subscribe((res)=>{
                let str = res['_body'];
                let x2js = new X2JS();
                let jsonObj = x2js.xml_str2json(str);
                let buckets = (jsonObj ? jsonObj.ListAllMyBucketsResult.Buckets.Bucket:[]);
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

    getTiers() {
        this.tierOptions = [];
        this.allTiers = [];
        this.servicePlanService.getTierList().subscribe((response) =>{
            this.allTiers = response.json().tiers;
            this.allTiers.forEach(element => {
                this.tierOptions.push({
                    label: element.name,
                    value: element.name
                })
            })
        }, (error)=>{
            console.log("Something went wrong. Service Plans could not be fetched.");
        })
        
        
    }


    getMigrations(){
        this.allMigrationsName = [];
        this.MigrationService.getMigrations().subscribe((res)=>{
            let migrations = res.json().plans;
            if(migrations && migrations.length){
                migrations.forEach(element => {
                    this.allMigrationsName.push(element.name);
                });
            }
        },(error)=>{
            console.log("Something went wrong. Could not fetch migrations.")
        });
    }
    createMigration(){
        this.msgs = [];
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
                let planId = res.json().plan.id;
                this.http.post(`v1/{project_id}/plans/${planId}/run`,{}).subscribe((res)=>{});
                this.msgs.push({severity: 'success', summary: 'Migration initiated successfully', detail: 'Please check the dataflow section for migration progress.'});
                this.resetMigrateForm();
                this.showRightSidebar = false;
            },(error)=>{
                let errorMsg = "There was an error while initiating the migration. <br />Details: " + error.json().detail; 
                this.msgs.push({severity: 'error', summary: "Error initiating migration", detail: errorMsg});
                this.resetMigrateForm();
                this.showRightSidebar = false;
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
                    this.msgs.push({severity: 'success', summary: 'Migration scheduled successfully!', detail: 'Please check the dataflow section for migration progress.'});
                    this.resetMigrateForm();
                },(error)=>{
                    let errorMsg = "There was an error while scheduling the migration. <br />Details: " + error.json().detail; 
                    this.msgs.push({severity: 'error', summary: "Error scheduling migration", detail: errorMsg});
                    this.resetMigrateForm();
                }); 
            })
        }    
    }
    resetMigrateForm(){
        this.createMigrateShow = false;
        this.migrationForm.reset(
            {
            'name':'',
            "deleteSrcObject":false,
            "excuteTime":new Date(),
            "excute":true
            }
        );
    }
    getBackendsByTypeId() {
        this.backendsOption = [];
        this.BucketService.getBackendsByTypeId(this.selectType).subscribe((res) => {
            let backends = res.json().backends ? res.json().backends :[];
            this.listedBackends = backends;
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
    setRegion(){
        let selectedBackend = this.createBucketForm.value.backend;
        this.listedBackends.forEach( element =>{
            if(element.name == selectedBackend){
                this.selectedRegion = element.region;
            }
        })
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
        let param; 
        if(!this.servicePlansEnabled){
            param = {
                name:this.createBucketForm.value.name,
                backend_type:this.createBucketForm.value.backend_type,
                backend:this.createBucketForm.value.backend,
                locationConstraintValue: this.createBucketForm.value.backend
            };

        } else if(this.servicePlansEnabled){
            param = {
                name:this.createBucketForm.value.name,
                tier:(this.createBucketForm.value.tier),
                locationConstraintValue: (this.createBucketForm.value.tier)
            };
        }
        
        let xmlStr = `<CreateBucketConfiguration xmlns=\"http://s3.amazonaws.com/doc/2006-03-01/\">
                        <LocationConstraint>${param.locationConstraintValue}</LocationConstraint>
                    </CreateBucketConfiguration>`
        window['getAkSkList'](()=>{
            let requestMethod = "PUT";
            let url = '/'+this.createBucketForm.value.name;
            let requestOptions: any;
            let options: any = {};
            if(this.servicePlansEnabled){
                let contentHeaders = {
                    'tier' : "True"
                };
                requestOptions = window['getSignatureKey'](requestMethod, url, '', encodeURIComponent(this.selectedRegion), '', xmlStr, '', '', contentHeaders) ;
            } else{
                requestOptions = window['getSignatureKey'](requestMethod, url, '', encodeURIComponent(this.selectedRegion), '', xmlStr) ;
            }
            options['headers'] = new Headers();
            options = this.BucketService.getSignatureOptions(requestOptions, options);
            this.BucketService.createBucket(this.createBucketForm.value.name,requestOptions.body,options).subscribe((res)=>{
            this.createBucketDisplay = false;
            this.showRightSidebar = false;
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
            let url = '/'+this.createBucketForm.value.name + "/?DefaultEncryption";
            let requestOptions: any;
            let options: any = {};
            requestOptions = window['getSignatureKey'](requestMethod, url, '', '', '', encryptStr) ;
            options['headers'] = new Headers();
            options = this.BucketService.getSignatureOptions(requestOptions, options);
            this.BucketService.setEncryption(this.createBucketForm.value.name,encryptStr,options).subscribe((res)=>{
                if(this.enableVersion){
                    this.enableBucketVersioning(this.createBucketForm.value.name);
                    this.enableVersion = false;
                }
                this.getBuckets();
            }, (error) => {
                console.log("Set encryption failed", error);
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
            let url = '/'+bucketName + "/?versioning";
            let requestOptions: any;
            let options: any = {};
            requestOptions = window['getSignatureKey'](requestMethod, url, '', '', '', versionStr) ;
            options['headers'] = new Headers();
            options = this.BucketService.getSignatureOptions(requestOptions, options);
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
    }
    showSuspendVersioning(bucketName){
        let msg = "<div>Are you sure you want to Suspend Versioning on the Bucket ?</div><h3>[ "+ bucketName +" ]</h3>";
        let header ="Suspend Versioning";
        let acceptLabel = "Suspend";
        let warming = true;
        this.confirmDialog([msg,header,acceptLabel,warming,"suspend"], bucketName);
    }
    suspendVersioning(bucketName){
        let versionStr = `<VersioningConfiguration>
                                        <Status>Suspended</Status>
                                    </VersioningConfiguration>`
        window['getAkSkList'](()=>{
            let requestMethod = "PUT";
            let url = '/'+bucketName + "/?versioning";
            let requestOptions: any;
            let options: any = {};
            requestOptions = window['getSignatureKey'](requestMethod, url, '', '', '', versionStr) ;
            options['headers'] = new Headers();
            options = this.BucketService.getSignatureOptions(requestOptions, options);
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
        
    }
    showCreateForm(){
        if(this.servicePlansEnabled){
            
            this.getTiers();
            this.createBucketForm.removeControl('backend');
            this.createBucketForm.removeControl('backend_type');
            this.createBucketForm.addControl('tier', this.fb.control("", Validators.required));
            
            this.createBucketForm.reset(
                {
                    "name":"",
                    "tier" : "",
                    "version": false,
                    "encryption": false
                }
            );
            
        } else{
            this.createBucketForm.reset(
                {
                    "backend":"",
                    "backend_type":"",
                    "name":"",
                    "version": false,
                    "encryption": false
                }
            );
            this.getTypes();
        }
        this.showRightSidebar = true;
        this.createBucketDisplay = true;        
        this.enableEncryption = false;
        this.enableVersion = false;
        this.createBucketForm.controls['name'].setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(63), Validators.pattern(this.validRule.validName), Utils.isExisted(this.allBucketNameForCheck)]);
        
    }
    closeSidebar(){
        this.showRightSidebar = false;
        this.createBucketDisplay = false;
        this.createMigrateShow = false;
        this.resetMigrateForm();        
    }
    deleteBucket(bucket){
        window['getAkSkList'](()=>{
            let requestMethod = "GET";
            let url = '/' + bucket.name;
            let requestOptions: any;
            let options: any = {};
            requestOptions = window['getSignatureKey'](requestMethod, url);
            options['headers'] = new Headers();
            options = this.BucketService.getSignatureOptions(requestOptions, options);
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
                        case "delete":  
                                        let name = bucket.name;
                                        if(plans){
                                            plans.forEach(element => {
                                                this.http.delete(`v1/{project_id}/plans/${element.id}`).subscribe();
                                            });
                                        }
                                        window['getAkSkList'](()=>{
                                            
                                                let requestMethod = "DELETE";
                                                let url = '/' + name;
                                                let requestOptions: any;
                                                let options: any = {};
                                                requestOptions = window['getSignatureKey'](requestMethod, url);
                                                options['headers'] = new Headers();
                                                options = this.BucketService.getSignatureOptions(requestOptions, options);
                                                this.BucketService.deleteBucket(name,options).subscribe((res) => {
                                                    this.getBuckets();
                                                    this.msgs = [];
                                                    this.msgs.push({severity: 'success', summary: 'Bucket deleted!', detail: 'Bucket ' + name + ' has been deleted successfully.'});
                                                }, (error)=>{
                                                    let str = error['_body'];
                                                    let x2js = new X2JS();
                                                    let jsonObj = x2js.xml_str2json(str);
                                                    console.log("Something went wrong. Could not delete bucket.", jsonObj);
                                                    this.msgs = [];
                                                    this.msgs.push({severity: 'error', summary: "Error ", detail: 'Bucket ' + name + ' could not be deleted.' + '<br />' + 'Details: ' + jsonObj.Error.Message});
                                                });
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
