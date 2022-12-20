import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener,EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService, MsgBoxService, Utils ,Consts} from 'app/shared/api';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { AppService } from 'app/app.service';
import { I18nPluralPipe } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MenuItem ,ConfirmationService, Message} from '../../components/common/api';
import { identifierModuleUrl } from '@angular/compiler';
import { MigrationService } from './migration.service';
import { BucketService } from './../block/buckets.service';
import { Http, Headers } from '@angular/http';
import { ReactiveFormsModule, FormsModule} from '@angular/forms';
declare let X2JS:any;

@Component({
    selector: 'migration-list',
    templateUrl: 'migration.html',
    providers: [ConfirmationService, MsgBoxService],
    styleUrls: [],
    animations: []
})
export class MigrationListComponent implements OnInit {
    showRightSidebar: boolean = false;
    allMigrations = [];
    selectedMigrations = [];
    createMigrateShow = false;
    createMigrationForm:FormGroup;
    dataAnalysis = [];
    excute = true;
    showAnalysis = false;
    deleteSrcObject = [];
    selectTime = true;
    bucketOption = [];
    migrationName = "";
    ak = "";
    sk = "";
    analysisCluster = "";
    destBucket = "";
    destBuckets = [];
    backendMap = new Map();
    bucketMap = new Map();
    anaParam = "";
    jarParam = "";
    engineOption = [];
    rule = "";
    excutingTime;
    plan: any;
    errorMessage:Object;
    allMigrationForCheck=[];
    showAKSKWarning: boolean;
    msgs: Message[];
    servicePlansEnabled: boolean;
    constructor(
        public I18N: I18NService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private msg: MsgBoxService,
        private fb: FormBuilder,
        private MigrationService: MigrationService,
        private BucketService:BucketService,
        private http: Http
    ) {
        this.showAKSKWarning = window['akskWarning'];
        this.servicePlansEnabled = Consts.STORAGE_SERVICE_PLAN_ENABLED;
        this.errorMessage = {
            "name": { required: "Name is required.",isExisted:"Migration plan with same name already exists." },
            "srcBucket": { required: "Source Bucket is required." },
            "destBucket":{ required: "Destination Bucket is required." },
        };
        this.createMigrationForm = this.fb.group({
            "name": ['',{validators:[Validators.required,Utils.isExisted(this.allMigrationForCheck)], updateOn:'change'}],
            "srcBucket": ['',{validators:[Validators.required], updateOn:'change'}],
            "destBucket":['',{validators:[Validators.required], updateOn:'change'}],
            "rule":[''],
            "deleteSrcObject":[false],
            "excuteTime":[new Date()],
            "excute":[true]
        });
    }
    @Output() changeNumber = new EventEmitter<string>();

    ngOnInit() {
        this.allMigrations = []
        this.getBuckets();
        
    }
    configCreateMigration(){
        this.createMigrateShow=true;
        this.createMigrationForm.reset(
            {
            'name':'',
            "deleteSrcObject":false,
            "excuteTime":new Date(),
            "excute":true
            }
        );
        this.createMigrationForm.controls['name'].setValidators([Validators.required,Utils.isExisted(this.allMigrationForCheck)]);
        this.showRightSidebar = true;
    }

    getBuckets() {
        this.bucketOption = [];
        window['getAkSkList'](()=>{
            let requestMethod = "GET";
            let url = this.BucketService.url;
            let requestOptions: any;
            let options: any = {};
            requestOptions = window['getSignatureKey'](requestMethod, url);
            options['headers'] = new Headers();
            options = this.BucketService.getSignatureOptions(requestOptions, options);
            this.BucketService.getBuckets(options).subscribe((res) => {
                let str = res._body;
                let x2js = new X2JS();
                let jsonObj = x2js.xml_str2json(str);
                let buckets = (jsonObj ? jsonObj.ListAllMyBucketsResult.Buckets.Bucket:[]);
                let allBuckets = [];
                if(Object.prototype.toString.call(buckets) === "[object Array]"){
                    allBuckets = buckets;
                }else if(Object.prototype.toString.call(buckets) === "[object Object]"){
                    allBuckets = [buckets];
                }
                if(!this.servicePlansEnabled){
                    if(Consts.BUCKET_BACKND.size > 0 && Consts.BUCKET_TYPE.size > 0 ){
                        allBuckets.forEach(item=>{
                            this.bucketOption.push({
                                        label:item.Name,
                                        value:item.Name
                                    });
                        });
                        this.getMigrations();
                    }else{
                        this.http.get('v1/{project_id}/backends').subscribe((res)=>{
                            let backends = res.json().backends ? res.json().backends :[];
                            let backendsObj = {};
                            backends.forEach(element => {
                                backendsObj[element.name]= element.type;
                            });
                            allBuckets.forEach(item=>{
                                Consts.BUCKET_BACKND.set(item.Name,item.LocationConstraint);
                                Consts.BUCKET_TYPE.set(item.Name,backendsObj[item.LocationConstraint]);
                                this.bucketOption.push({
                                    label:item.Name,
                                    value:item.Name
                                });
                            });
                            this.getMigrations();
                        });
                    }
                } else{
                    allBuckets.forEach(item=>{
                        this.bucketOption.push({
                            label:item.Name,
                            value:item.Name
                        });
                    });
                    this.getMigrations();
                }
                
            }); 
            
        })
        
    }
    changeSrcBucket(){
        this.destBuckets = [];
        this.engineOption = [];
            if(!this.servicePlansEnabled){
                this.bucketOption.forEach((value,index)=>{
                    if(Consts.BUCKET_BACKND.get(value.label) !== Consts.BUCKET_BACKND.get(this.createMigrationForm.value.srcBucket.name)){
                        this.destBuckets.push({
                            label:value.label,
                            value:value.value
                        });
                    }
                });
                // Bucket migration from CEPH to HW is not supported
                if(Consts.BUCKET_TYPE.get(this.createMigrationForm.value.srcBucket) == "ceph-s3"){
                    this.destBuckets = this.destBuckets.filter( value => {
                        return Consts.BUCKET_TYPE.get(value.label) != "hw-obs" && Consts.BUCKET_TYPE.get(value.label) != "fusionstorage-object";
                    })
                }
            } else{
                this.bucketOption.forEach((value,index)=>{
                    if(this.createMigrationForm.value.srcBucket != value.label){
                        this.destBuckets.push({
                            label:value.label,
                            value:value.value
                        });
                    }
                });
            }
        
    }

    getMigrations() {
        this.allMigrations = [];
        this.allMigrationForCheck = [];
        this.MigrationService.getMigrations().subscribe((res) => {
            let AllMigrations = res.json().plans ? res.json().plans :[];
            this.changeNumber.emit(AllMigrations.length);
            let newMigrations = []; 
            AllMigrations.forEach((item,index)=>{
                if(!this.servicePlansEnabled){
                    item.srctype = Consts.TYPE_SVG[Consts.BUCKET_TYPE.get(item.sourceConn.bucketName)];
                    item.desttype = Consts.TYPE_SVG[Consts.BUCKET_TYPE.get(item.destConn.bucketName)];
                }                
                item.srcBucket = item.sourceConn.bucketName;
                item.destBucket = item.destConn.bucketName;
                this.allMigrationForCheck.push(item.name);
                newMigrations.unshift(item);
            });
            this.allMigrations = newMigrations;
        });
    }

    createMigration() {
        this.msgs = [];
        if(!this.createMigrationForm.valid){
            for(let i in this.createMigrationForm.controls){
                this.createMigrationForm.controls[i].markAsTouched();
            }
            return;
        }
        let param = {
            "name": this.createMigrationForm.value.name,
            "description": "for test",
            "type": "migration",
            "sourceConn": {
                "storType": "opensds-obj",
                "bucketName": this.createMigrationForm.value.srcBucket
            },
            "destConn": {
                "storType": "opensds-obj",
                "bucketName": this.createMigrationForm.value.destBucket
            },
            "filter": {},
            "remainSource": !this.createMigrationForm.value.deleteSrcObject
        }
        if(this.createMigrationForm.value.excute){
            this.MigrationService.createMigration(param).subscribe((res) => {
                let planId = res.json().plan.id;
                this.http.post(`v1/{project_id}/plans/${planId}/run`,{}).subscribe((res)=>{});
                this.getMigrations();
                this.msgs.push({severity: 'success', summary: 'Migration initiated successfully', detail: 'Please expand the migration to check migration progress.'});
                this.resetMigrateForm();
                this.showRightSidebar = false;
            },(error)=>{
                let errorMsg = "There was an error while initiating the migration. <br />Details: " + error.json().detail; 
                this.msgs.push({severity: 'error', summary: "Error initiating migration", detail: errorMsg});
                this.resetMigrateForm();
                this.showRightSidebar = false;
            });
        }else{
            let date = new Date(this.createMigrationForm.value.excuteTime);
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
                    this.getMigrations();
                    this.msgs.push({severity: 'success', summary: 'Migration scheduled successfully!', detail: 'Please expand the migration to check migration progress.'});
                    this.resetMigrateForm();
                    this.showRightSidebar = false;
                },(error)=>{
                    let errorMsg = "There was an error while scheduling the migration. <br />Details: " + error.json().detail; 
                    this.msgs.push({severity: 'error', summary: "Error scheduling migration", detail: errorMsg});
                    this.resetMigrateForm();
                    this.showRightSidebar = false;
                }); 
            })
        }        
    }

    closeSidebar(){
        this.showRightSidebar = false;
        this.resetMigrateForm();        
    }
    resetMigrateForm(){
        this.createMigrateShow = false;
        this.createMigrationForm.reset(
            {
            'name':'',
            "deleteSrcObject":false,
            "excuteTime":new Date(),
            "excute":true
            }
        );
    }

    onRowExpand(evt) {
        this.plan = evt.data;
    }

    deleteMigrate(migrate){
        let msg = "<div>Are you sure you want to delete the Migration ?</div><h3>[ "+ migrate.name +" ]</h3>";
        let header ="Delete";
        let acceptLabel = "Delete";
        let warming = true;
        this.confirmDialog([msg,header,acceptLabel,warming,"delete"], migrate)
    }
    showDetail(){
        if(this.dataAnalysis.length !== 0){
         this.showAnalysis = true;
        }else{
         this.showAnalysis = false;
        }
    }
    showcalendar(){
        if(this.createMigrationForm.value.excute){
         this.selectTime = true;
        }else{
         this.selectTime = false;
        }
    }
    remigration(migration){
        this.http.get('v1/{project_id}/jobs?planName='+migration.name).subscribe((res)=>{
            let job = res.json().jobs ? res.json().jobs :[];
            let curJob = job[job.length - 1];
            if(curJob && curJob.status == "running"){
                this.msg.info("The migration task is in progress.");
            }else{
                let msg = "<div>Are you sure you want to execute it immediately?</div><h3>[ "+ migration.name +" ]</h3>";
                let header ="Execute";
                let acceptLabel = "Execute";
                let warming = true;
                this.confirmDialog([msg,header,acceptLabel,warming,"Remigrate"], migration)
            }
        })        
    }
    confirmDialog([msg,header,acceptLabel,warming=true,func], migrate){
        this.confirmationService.confirm({
            message: msg,
            header: header,
            acceptLabel: acceptLabel,
            isWarning: warming,
            accept: ()=>{
                try {
                    if(func === "Remigrate"){
                        this.http.post(`v1/{project_id}/plans/${migrate.id}/run`,{}).subscribe((res)=>{
                            this.getMigrations();
                        });    
                    }
                    else if(func === "delete"){
                        let id = migrate.id;
                        this.MigrationService.deleteMigration(id).subscribe((res) => {
                            this.getMigrations();
                        });
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
