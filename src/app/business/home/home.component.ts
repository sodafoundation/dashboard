import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { ParamStorService, Utils } from 'app/shared/api';
import { ProfileService } from 'app/business/profile/profile.service';
import { Observable } from "rxjs/Rx";
import { I18NService ,HttpService, MsgBoxService, Consts} from 'app/shared/api';
import { ReactiveFormsModule, FormsModule,FormControl, FormGroup, FormBuilder,Validators,ValidatorFn, AbstractControl } from '@angular/forms';
import { MenuItem ,ConfirmationService,ConfirmDialogModule} from '../../components/common/api';
import { Router } from '@angular/router';
import { Headers } from '@angular/http';
import { BucketService} from '../block/buckets.service';

declare let X2JS:any;
@Component({
    templateUrl: './home.component.html',
    styleUrls: [
        './home.component.scss'
    ]
})
export class HomeComponent implements OnInit {
    lineData ={};
    lineOption = {};
    showRegisterFlag = false;
    allTypes = [];
    showBackends = false;
    allBackends_count={
        aws:0,
        huaweipri:0,
        huaweipub:0,
        localBKD:0,
        ibmcos:0
    }
    counts= {
        volumesCount:0,
        bucketsCount:0,
        migrationCount:0
    }
    backendForm :FormGroup;
    typeDetail = [];
    selectedType:any;
    selectedRegions = [];
    Allbackends = [];
    modifyBackendshow = false;
    modifyBackendForm:FormGroup;
    selectedBackend:any;
    cloud_type = [];
    allBackendNameForCheck=[];
    isLocalCloud=true;

    @ViewChild("path") path: ElementRef;
    @ViewChild("cloud_aws") c_AWS: ElementRef;
    @ViewChild("cloud_hw") c_HW: ElementRef;
    @ViewChild("cloud_ibmcos") c_IBMCOS: ElementRef;
    @ViewChild("cloud_hw_p") c_HWP: ElementRef;
    @ViewChild("svgCon") svgCon: ElementRef;
    
    scaleX = 1;
    scaleY = 1;

    constructor(
        private http: HttpService,
        private paramStor: ParamStorService,
        private profileService: ProfileService,
        public I18N: I18NService,
        private fb:FormBuilder,
        private ConfirmationService:ConfirmationService,
        private router: Router,
        private msg: MsgBoxService,
        private BucketService: BucketService,
    ) { 
        this.cloud_type = Consts.CLOUD_TYPE;
    }
    errorMessage = {
        "name": { required: "Name is required." ,isExisted:"Name is existing"},
        "type": { required: "Type is required." },
        "region":{ required: "Region is required." },
        "endpoint":{ required: "Endpoint is required." },
        "bucket":{required: "Bucket is required."},
        "ak":{required: "Access Key is required."},
        "sk":{required: "Secret Key is required."}
    };
    ngOnInit() {
        
        this.getCounts();
        this.getType();
        if(this.isLocalCloud){this.backendForm = this.fb.group({
            "name":['', {validators:[Validators.required,Utils.isExisted(this.allBackendNameForCheck)]}],
            "type":['',{validators:[Validators.required]}],
            "region":['',{updateOn:'change'}],
            "endpoint":['',{validators:[Validators.required], updateOn:'change'}],
            "bucket":['',{validators:[Validators.required], updateOn:'change'}],
            "ak":['',{validators:[Validators.required], updateOn:'change'}],
            "sk":['',{validators:[Validators.required], updateOn:'change'}],
        });
        }else{
        this.backendForm = this.fb.group({
            "name":['', {validators:[Validators.required,Utils.isExisted(this.allBackendNameForCheck)]}],
            "type":['',{validators:[Validators.required]}],
            "region":['',{validators:[Validators.required],updateOn:'change'}],
            "endpoint":['',{validators:[Validators.required], updateOn:'change'}],
            "bucket":['',{validators:[Validators.required], updateOn:'change'}],
            "ak":['',{validators:[Validators.required], updateOn:'change'}],
            "sk":['',{validators:[Validators.required], updateOn:'change'}],
        });
        }
        this.modifyBackendForm = this.fb.group({
            "ak":['',{validators:[Validators.required], updateOn:'change'}],
            "sk":['',{validators:[Validators.required], updateOn:'change'}],
        });
        
        this.lineOption = {
            title: {
                display: false,
                text: 'My Title',
                fontSize: 12
            },
            legend: {
                labels: {
                    boxWidth: 12
                },
                display: false,
                position: 'right',
                fontSize: 12
            }
        };
        this.lineData = {
            labels: [[], [], [], [], [],[],[]],
            datasets: [
                {
                    data: [2,4,8,11,14,16,21],
                    fill: true,
                    borderColor: '#4bc0c0'
                }
            ]
        }

        let that = this;
        document.body.addEventListener('mousemove',function(e){
            let initPos = 350;
            let svgConW = that.svgCon.nativeElement.offsetWidth, svgConH = that.svgCon.nativeElement.offsetHeight;
            let winW = document.documentElement.offsetWidth, winH = document.documentElement.offsetHeight;
            let disX = 10, disY = 1;
            let moveX = e.pageX * disX / (winW-320)*0.5, moveY = e.pageY * disY / winH;
            that.scaleX = svgConW/240; 
            that.scaleY = 5;

            let clouds = [that.c_AWS.nativeElement, that.c_HW.nativeElement, that.c_HWP.nativeElement, that.c_IBMCOS.nativeElement];
            clouds.forEach((item, index) => {
                let totalLength = that.path.nativeElement.getTotalLength();
                let point = totalLength/clouds.length * (index+1) + moveX + initPos;
                    if(point > totalLength) point = point - totalLength;
                    if(point < 0) point = totalLength - point;
                
                let pos = that.path.nativeElement.getPointAtLength(point);
                item.style.left = (pos.x*that.scaleX - item.offsetWidth*0.5) +"px";
                item.style.top = (pos.y*that.scaleY + svgConH*(1 - that.scaleY)*0.5 - item.offsetHeight*0.6) +"px";
                item.style.display = "block";
            }) 
        });
        this.initBucket2backendAnd2Type();
    }

/* ---- to hide region textbox on selection of 'CEPH" type -----*/    
    onChange(event) {
        let strUser = event.value;
        if(strUser == 'ceph-s3'){
            this.isLocalCloud=true;
        } else {
 	this.isLocalCloud=false; 
        }
    } 
    initBucket2backendAnd2Type(){
        window['getAkSkList'](()=>{
            let requestMethod = "GET";
            let url = this.BucketService.url;
            window['canonicalString'](requestMethod, url, ()=>{
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
                    this.counts.bucketsCount = allBuckets.length;
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
                        this.initBackendsAndNum(backends);//must after Consts.BUCKET_BACKND.set
                    });
                });  
            });
        }) 
    }
    //Request header with AK/SK authentication added
    getSignature(options) {
        let SignatureObjectwindow = window['getSignatureKey']();
        let kAccessKey = SignatureObjectwindow.SignatureKey.AccessKey;
        let kDate = SignatureObjectwindow.SignatureKey.dateStamp;
        let kRegion = SignatureObjectwindow.SignatureKey.regionName;
        let kService = SignatureObjectwindow.SignatureKey.serviceName;
        let kSigning = SignatureObjectwindow.kSigning;
        let Credential = kAccessKey + '/' + kDate.substr(0,8) + '/' + kRegion + '/' + kService + '/' + 'sign_request';
        let Signature = 'OPENSDS-HMAC-SHA256' + ' Credential=' + Credential + ',SignedHeaders=host;x-auth-date' + ",Signature=" + kSigning;
        options['headers'] = new Headers();
        options.headers.set('Authorization', Signature);
        options.headers.set('X-Auth-Date', kDate);
        return options;  
    }
    initBackendsAndNum(backends){
        let backendArr = Array.from(Consts.BUCKET_BACKND.values());
        this.allBackendNameForCheck = [];
        backends.forEach(element => {
            element.typeName = Consts.CLOUD_TYPE_NAME[element.type];
            element.canDelete = backendArr.includes(element.name);
            this.allBackendNameForCheck.push(element.name);
        });
        let result=backends.reduce(function(initArray,item){
            let index=item.type;
            if(initArray[index]){
                initArray[index].push(item)
            }else{
                initArray[index]=[item]
             }
            return  initArray;
        },[]);
        this.Allbackends = result;
        this.allBackends_count.aws = this.Allbackends[this.cloud_type[0]] ? this.Allbackends[Consts.CLOUD_TYPE[0]].length :0;
        this.allBackends_count.huaweipri = this.Allbackends[this.cloud_type[1]] ? this.Allbackends[Consts.CLOUD_TYPE[1]].length :0;
        this.allBackends_count.huaweipub = this.Allbackends[this.cloud_type[2]] ? this.Allbackends[Consts.CLOUD_TYPE[2]].length :0;
        this.allBackends_count.localBKD = this.Allbackends[this.cloud_type[3]] ? this.Allbackends[Consts.CLOUD_TYPE[3]].length :0 + this.Allbackends[this.cloud_type[4]] ? this.Allbackends[Consts.CLOUD_TYPE[4]].length :0;
        this.allBackends_count.ibmcos = this.Allbackends[this.cloud_type[5]] ? this.Allbackends[Consts.CLOUD_TYPE[5]].length :0;
    }

    getType(){
        let url = 'v1/{project_id}/types';
        this.http.get(url).subscribe((res)=>{
            let all = res.json().types;
            all.forEach(element => {
                this.allTypes.push({
                    label: Consts.CLOUD_TYPE_NAME[element.name],
                    value:element.name
                });
            });
        });
    }
    configModify(backend){
        this.modifyBackendshow = true;
        this.selectedBackend = backend;
        this.modifyBackendForm.reset(
            {
            'ak':'',
            "sk":''
            }
        );
    }
    modifyBackend(){
        if(!this.modifyBackendForm.valid){
            for(let i in this.modifyBackendForm.controls){
                this.modifyBackendForm.controls[i].markAsTouched();
            }
            return;
        }
        let param = {
            "security": this.modifyBackendForm.value.sk,
            "access": this.modifyBackendForm.value.ak
        }
        this.http.put(`v1/{project_id}/backends/${this.selectedBackend.id}`,param).subscribe((res)=>{
            this.modifyBackendshow = false;
        });
    }

    showBackendsDetail(type?){
        this.showBackends = true;
        
        if(type){
            this.selectedType = type;
            this.typeDetail = this.Allbackends[type] ? this.Allbackends[type]:[];
        }else{
            this.selectedType = null;
            let fs_arr = this.Allbackends['fusionstorage-object'] ? this.Allbackends['fusionstorage-object'] : [];
            let ceph_arr = this.Allbackends['ceph-s3'] ? this.Allbackends['ceph-s3'] : [];
            this.typeDetail = fs_arr.concat(ceph_arr);
        }
    }

    deleteBackend(backend){
        if(backend.canDelete){
            this.msg.info("The backend cannot be deleted because buckets have already been created");
        }else{
            let msg = "<div>Are you sure you want to delete the selected backend?</div><h3>[ "+ backend.name +" ]</h3>";
            let header ="Delete ";
            let acceptLabel = "Delete";
            let warming = true;
            this.confirmDialog([msg,header,acceptLabel,warming,backend])
        }
    }

    confirmDialog([msg,header,acceptLabel,warming=true,backend]){
        this.ConfirmationService.confirm({
            message: msg,
            header: header,
            acceptLabel: acceptLabel,
            isWarning: warming,
            accept: ()=>{
                try {
                    if(backend == "close"){
                        return;
                    }else{
                        let url = 'v1/{project_id}/backends/'+backend.id;
                        this.http.delete(url).subscribe((res)=>{
                            this.http.get('v1/{project_id}/backends').subscribe((res)=>{
                                let backends = res.json().backends ? res.json().backends :[];
                                this.initBackendsAndNum(backends);
                                this.showBackendsDetail(this.selectedType);
                            });
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
                            
    getCounts(){
        let url1 = 'v1beta/{project_id}/block/volumes';
        let url3 = 'v1/{project_id}/plans';
        this.http.get(url1).subscribe((res)=>{
            this.counts.volumesCount = res.json().length;
        });
        this.http.get(url3).subscribe((res)=>{
            this.counts.migrationCount = res.json().plans ? res.json().plans.length : 0;
        });
    }
    
    createBackend(){
        if(!this.backendForm.valid){
            for(let i in this.backendForm.controls){
                this.backendForm.controls[i].markAsTouched();
            }
            return;
        }
        let reg: any = null;
        if (this.backendForm.value.type=='ceph-s3'){
            reg = "-";
        }else{
            reg = this.backendForm.value.region;
        }
        let param: any = null;
        param = {
              "name": this.backendForm.value.name,
              "type": this.backendForm.value.type,
              "region": reg,
              "endpoint": this.backendForm.value.endpoint,
              "bucketName": this.backendForm.value.bucket,
              "security": this.backendForm.value.sk,
              "access": this.backendForm.value.ak};
        
        let options = {
        timeout:18000
        };
        this.http.post("v1/{project_id}/backends", param,options).subscribe((res) => {
            this.showRegisterFlag = false;
            this.http.get('v1/{project_id}/backends').subscribe((res)=>{
                let backends = res.json().backends ? res.json().backends :[];
                this.initBackendsAndNum(backends);
            });
        });
    }
    showRegister(){
        this.showRegisterFlag = true;
        this.backendForm.reset();
        this.backendForm.controls['name'].setValidators([Validators.required,Utils.isExisted(this.allBackendNameForCheck)]);
    }
}
