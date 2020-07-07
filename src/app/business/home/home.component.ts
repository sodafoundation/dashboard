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
        azureblob:0,
        huaweipub:0,
        localBKD:0,
        ibmcos:0,
        gcp:0,
        alibaba:0
    }
    counts= {
        volumesCount:0,
        bucketsCount:0,
        migrationCount:0
    }
    backendForm;
    typeDetail = [];
    selectedType:any;
    selectedRegions = [];
    Allbackends = [];
    modifyBackendshow = false;
    modifyBackendForm:FormGroup;
    selectedBackend:any;
    cloud_type = [];
    allBackendNameForCheck=[];
    formItemCopy = [];
    formItems = [
        {
            label: 'Region',
            required: 'true',
            id: 'region',
            type: 'text',
            name: 'region',
            formControlName: 'region',
            arr:['aws-s3','azure-blob','hw-obs','fusionstorage-object', 'gcp-s3','ibm-cos', 'alibaba-oss', 'aws-file', 'azure-file']
        },
        {
            label: 'Endpoint',
            required: 'true',
            id: 'endpoint',
            type: 'text',
            name: 'endpoint',
            formControlName: 'endpoint',
            arr:['aws-s3','azure-blob','hw-obs','fusionstorage-object','ceph-s3','gcp-s3','ibm-cos','yig', 'alibaba-oss']
        },
        {
            label: 'Bucket',
            required: 'true',
            id: 'bucket',
            type: 'text',
            name: 'bucket',
            formControlName: 'bucket',
            arr:['aws-s3','azure-blob','hw-obs','fusionstorage-object','ceph-s3','gcp-s3','ibm-cos', 'alibaba-oss']
        },
        {
            label: 'Access Key',
            required: 'true',
            id: 'accessKey',
            type: 'text',
            name: 'accessKey',
            formControlName: 'ak',
            arr:['aws-s3','azure-blob','hw-obs','fusionstorage-object','ceph-s3','gcp-s3','ibm-cos', 'alibaba-oss', 'aws-file', 'azure-file']
        },
        {
            label: 'Secret Key',
            required: 'true',
            id: 'secretKey',
            type: 'password',
            name: 'secretKey',
            formControlName: 'sk',
            arr:['aws-s3','azure-blob','hw-obs','fusionstorage-object','ceph-s3','gcp-s3','ibm-cos','alibaba-oss', 'aws-file', 'azure-file']
        },
    ]


    @ViewChild("path") path: ElementRef;
    @ViewChild("cloud_aws") c_AWS: ElementRef;
    @ViewChild("cloud_hw") c_HW: ElementRef;
    @ViewChild("cloud_ibmcos") c_IBMCOS: ElementRef;
    @ViewChild("cloud_hw_p") c_HWP: ElementRef;
    @ViewChild("svgCon") svgCon: ElementRef;
    @ViewChild("cloud_gcp") c_GCP: ElementRef;
    @ViewChild("cloud_alibaba") c_AOS: ElementRef;
    
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
        
        this.backendForm = this.fb.group({
            "name":['', {validators:[Validators.required,Utils.isExisted(this.allBackendNameForCheck)]}],
            "type":['',{validators:[Validators.required]}],
            "region":new FormControl([]),
            "endpoint":new FormControl([]),
            "bucket":new FormControl([]),
            "ak":new FormControl([]),
            "sk":new FormControl([]),
        });
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

            let clouds = [that.c_GCP.nativeElement, that.c_HWP.nativeElement, that.c_IBMCOS.nativeElement, that.c_AOS.nativeElement, that.c_HW.nativeElement, that.c_AWS.nativeElement];
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
    selectOption(){
        this.formItemCopy = []
        let selectOptionItem =this.backendForm && this.backendForm.value.type
        this.formItems.forEach((item)=>{
            item.arr.forEach((it)=>{
                if(it == selectOptionItem){
                    this.formItemCopy.push(item)
                    this.backendForm.controls[`${item.formControlName}`].setValidators(Validators.required);
                }else{
                    this.backendForm.controls[`${item.formControlName}`].setValidators('');
                }
            })
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
            if(Object.keys(options).length > 0 ){
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
                    this.getBuckend(allBuckets);
                }); 
            }else{
                let allBuckets = [];
                this.getBuckend(allBuckets);
            }
        }, (error)=>{
            console.log("Could not fetch AK/SK", error);
        }) 
    }
    getBuckend(allBuckets){
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
    }
    //Request header with AK/SK authentication added
    getSignature(options) {
        let SignatureObjectwindow = window['getSignatureKey']();
        if(Object.keys(SignatureObjectwindow.SignatureKey).length > 0){
            let requestObject = this.BucketService.getSignatureOptions(SignatureObjectwindow,options);
            options = requestObject['options'];
            return options;
        } 
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
        this.allBackends_count.localBKD = 0;

        this.allBackends_count.aws = this.Allbackends['aws-s3'] ? this.Allbackends['aws-s3'].length :0;
        this.allBackends_count.azureblob = this.Allbackends['azure-blob'] ? this.Allbackends['azure-blob'].length :0;
        this.allBackends_count.huaweipub = this.Allbackends['hw-obs'] ? this.Allbackends['hw-obs'].length :0;

        if( this.Allbackends['ceph-s3']){
            this.allBackends_count.localBKD += this.Allbackends['ceph-s3'].length;
        }
        if( this.Allbackends['yig']){
            this.allBackends_count.localBKD += this.Allbackends['yig'].length;
        }
        if( this.Allbackends['fusionstorage-object']){
            this.allBackends_count.localBKD += this.Allbackends['fusionstorage-object'].length;
        }
        if( this.Allbackends['aws-file']){
            this.allBackends_count.localBKD += this.Allbackends['aws-file'].length;
        }
        if( this.Allbackends['azure-file']){
            this.allBackends_count.localBKD += this.Allbackends['azure-file'].length;
        }

        this.allBackends_count.ibmcos = this.Allbackends['ibm-cos'] ? this.Allbackends['ibm-cos'].length :0;
        this.allBackends_count.gcp = this.Allbackends['gcp-s3'] ? this.Allbackends['gcp-s3'].length :0;
        this.allBackends_count.alibaba = this.Allbackends['alibaba-oss'] ? this.Allbackends['alibaba-oss'].length :0;

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
            let yig_arr = this.Allbackends['yig'] ? this.Allbackends['yig'] : [];
            let aws_fs_arr = this.Allbackends['aws-file'] ? this.Allbackends['aws-file'] : [];
            let azure_fs_arr = this.Allbackends['azure-file'] ? this.Allbackends['azure-file'] : [];
            this.typeDetail = fs_arr.concat(ceph_arr,yig_arr,aws_fs_arr,azure_fs_arr);
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
        let param = {
            "name": this.backendForm.value.name,
            "type": this.backendForm.value.type,
            "region": this.backendForm.value.region,
            "endpoint": this.backendForm.value.endpoint,
            "bucketName": this.backendForm.value.bucket,
            "security": this.backendForm.value.sk,
            "access": this.backendForm.value.ak
        };
        let options = {
        timeout:18000
        };
        this.http.post("v1/{project_id}/backends", param,options).subscribe((res) => {
            this.showRegisterFlag = false;
            this.http.get('v1/{project_id}/backends').subscribe((res)=>{
                let backends = res.json().backends ? res.json().backends :[];
                this.initBackendsAndNum(backends);
                this.formItemCopy = []
            });
        });
    }
    showRegister(){
        this.formItemCopy = []
        this.showRegisterFlag = true;
        this.backendForm.reset();
        this.backendForm.controls['name'].setValidators([Validators.required,Utils.isExisted(this.allBackendNameForCheck)]);
    }
}
