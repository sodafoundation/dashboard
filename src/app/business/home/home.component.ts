import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { ParamStorService, Utils } from 'app/shared/api';
import { ProfileService } from 'app/business/profile/profile.service';
import { Observable } from "rxjs/Rx";
import { I18NService ,HttpService,Consts} from 'app/shared/api';
import { ReactiveFormsModule, FormsModule,FormControl, FormGroup, FormBuilder,Validators,ValidatorFn, AbstractControl } from '@angular/forms';
import { MenuItem ,ConfirmationService,ConfirmDialogModule} from '../../components/common/api';
import { Router } from '@angular/router';

declare let X2JS:any;
@Component({
    templateUrl: './home.component.html',
    styleUrls: [
        './home.component.scss'
    ]
})
export class HomeComponent implements OnInit {
    items = [];
    chartDatas;
    chartDatasbar;
    option;
    chartBarOpion;
    profileOptions = [];
    lineData_nums;
    lineData_capacity;
    showAdminStatis = true;
    tenants =[];
    lineData ={};
    lineOption = {};
    showRgister = false;
    allTypes = [];
    showBackends = false;
    allBackends_count={
        aws:0,
        huaweipri:0,
        huaweipub:0,
        huaweifs:0
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

    @ViewChild("path") path: ElementRef;
    @ViewChild("cloud_aws") c_AWS: ElementRef;
    @ViewChild("cloud_hw") c_HW: ElementRef;
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
        if(this.paramStor.CURRENT_USER().split("|")[0] == "admin"){
            this.showAdminStatis = true;
            this.getCounts();
            this.getType();
        }else{
            this.showAdminStatis = false;
            this.getTenantCountData();
        }
        this.backendForm = this.fb.group({
            "name":['', {validators:[Validators.required,Utils.isExisted(this.allBackendNameForCheck)]}],
            "type":['',{validators:[Validators.required]}],
            "region":['',{validators:[Validators.required], updateOn:'change'}],
            "endpoint":['',{validators:[Validators.required], updateOn:'change'}],
            "bucket":['',{validators:[Validators.required], updateOn:'change'}],
            "ak":['',{validators:[Validators.required], updateOn:'change'}],
            "sk":['',{validators:[Validators.required], updateOn:'change'}],
        });
        this.modifyBackendForm = this.fb.group({
            "ak":['',{validators:[Validators.required], updateOn:'change'}],
            "sk":['',{validators:[Validators.required], updateOn:'change'}],
        });
        this.items = [
            {
                countNum: 0,
                label: this.I18N.keyID["sds_home_tenants"]
            },
            {
                countNum:0,
                label: this.I18N.keyID["sds_home_users"]
            },
            {
                countNum: 0,
                label: this.I18N.keyID["sds_home_storages"]
            },
            {
                countNum: 0,
                label: this.I18N.keyID["sds_home_pools"]
            },
            {
                countNum: 0,
                label: this.I18N.keyID["sds_home_volumes"]
            },
            {
                countNum: 0,
                label:this.I18N.keyID["sds_home_snapshots"]
            },
            {
                countNum: 0,
                label: this.I18N.keyID["sds_home_replications"]
            },
            {
                countNum: 0,
                label: "Cross-Region Replications"
            },
            {
                countNum: 0,
                label: "Cross-Region Migrations"
            }
        ];

        
        this.option = {
            cutoutPercentage: 80,
            title: {
                display: false,
                text: 'My Title',
                fontSize: 12
            },
            legend: {
                labels: {
                    boxWidth: 12
                },
                display: true,
                position: 'right',
                fontSize: 12
            }
        };
        this.chartBarOpion= {
            scales: {
                yAxes: [{
                    ticks: {
                        min: 0,
                    }
                }]
            },
            legend: {
                display: false
            }
        }

        this.lineData_capacity = {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [
                {
                    label: 'Capacity(GB)',
                    data: [10, 11, 20, 160, 156, 195, 200],
                    fill: false,
                    borderColor: '#4bc0c0'
                }
            ]
        }

        this.lineData_nums = {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [
                {
                    label: 'Volumes',
                    data: [10, 23, 40, 38, 86, 107, 190],
                    fill: false,
                    borderColor: '#565656'
                }
            ]
        }
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
        if(this.showAdminStatis){
            document.body.addEventListener('mousemove',function(e){
                let initPos = 350;
                let svgConW = that.svgCon.nativeElement.offsetWidth, svgConH = that.svgCon.nativeElement.offsetHeight;
                let winW = document.documentElement.offsetWidth, winH = document.documentElement.offsetHeight;
                let disX = 10, disY = 1;
                let moveX = e.pageX * disX / (winW-320)*0.5, moveY = e.pageY * disY / winH;
                that.scaleX = svgConW/240; 
                that.scaleY = 5;
    
                let clouds = [that.c_AWS.nativeElement, that.c_HW.nativeElement, that.c_HWP.nativeElement];
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
        
    }
    initBucket2backendAnd2Type(){
        this.http.get('v1/s3').subscribe((res)=>{
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
        this.allBackends_count.huaweifs = this.Allbackends[this.cloud_type[3]] ? this.Allbackends[Consts.CLOUD_TYPE[3]].length :0;
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
    getProfiles() {
        this.profileService.getProfiles().subscribe((res) => {
            let profiles = res.json();
            profiles.forEach(profile => {
                this.profileOptions.push({
                    name: profile.name,
                    id: profile.id,
                    capacity: 0
                })
            });
        });
    }

    listTenants() {
        let request: any = { params:{} };
        request.params = {
            "domain_id": "default"
        }

        this.http.get("/v3/projects", request).subscribe((res) => {

            this.items[0].countNum = res.json().projects.length;
            this.tenants = res.json().projects;
            this.tenants.forEach((item, i)=>{
                if(item.name == "admin"){
                    this.getAllvolumes(item.id, this.tenants.length - 1);
                    this.getAllSnapshots(item.id);
                    this.getAllReplications(item.id);
                    this.getAllPools(item.id);
                    this.getAllDocks(item.id);
                }
            });


        });
    }
    listUsers(){
        let request: any = { params:{} };
        request.params = {
            "domain_id": "default"
        }
        this.http.get("/v3/users", request).subscribe((res) => {
            this.items[1].countNum = res.json().users.length;
        });
    }
    getAllvolumes(projectId, index?){
        let url = 'v1beta/'+projectId+'/block/volumes';
        this.http.get(url).subscribe((res)=>{
            this.items[4].countNum = this.items[4].countNum + res.json().length;

            if(this.showAdminStatis){
                res.json().forEach(volume => {
                    this.profileOptions.forEach(profile => {
                        if(volume.profileId == profile.id){
                            profile.capacity = profile.capacity + volume.size;
                        }
                    });
                });

                if(index == (this.tenants.length-1)){
                    let [chartData, chartLabel] = [[],[]];
                    this.profileOptions.forEach(ele=>{
                        chartData.push(ele.capacity);
                        chartLabel.push(ele.name);
                    });

                    this.chartDatasbar = {
                        labels: chartLabel,
                        datasets: [{
                            label:"Used Capacity (GB)",
                            backgroundColor: '#42A5F5',
                            data: [chartData]
                        }]
                    }
                }
            }
        });
    }
    getAllSnapshots(projectId){
        let url = 'v1beta/'+projectId+'/block/snapshots';
        this.http.get(url).subscribe((res)=>{
            this.items[5].countNum = this.items[5].countNum + res.json().length;
        });
    }
    getAllReplications(projectId){
        let url = 'v1beta/'+projectId+'/block/replications';
        this.http.get(url).subscribe((res)=>{
            if(res.json()){
                this.items[6].countNum = this.items[6].countNum + res.json().length;
            }
        });
    }
    getAllPools(projectId){
        let url = 'v1beta/'+projectId+'/pools';
        this.http.get(url).subscribe((res)=>{
            this.items[3].countNum = this.items[3].countNum + res.json().length;

            let [storCapacityTotal, storCapacityFree]=[0,0];
            res.json().forEach(element => {
                storCapacityTotal = storCapacityTotal + element.totalCapacity;
                storCapacityFree = storCapacityFree + element.freeCapacity;
            });

            this.chartDatas = {
                labels: [this.I18N.keyID["sds_home_used_capacity"] + " (GB)",this.I18N.keyID["sds_home_free_capacity"] + " (GB)"],
                datasets: [
                    {
                        label: 'high_capacity',
                        data: [(storCapacityTotal-storCapacityFree), storCapacityFree],
                        backgroundColor: [
                            "#438bd3",
                            "rgba(224, 224, 224, .5)"
                        ]
                    }]
            };
        });
    }
    getAllDocks(projectId){
        let url = 'v1beta/'+projectId+'/docks';
        this.http.get(url).subscribe((res)=>{
            this.items[2].countNum = this.items[2].countNum + res.json().length;
        });
    }
    getCountData(){
        this.getProfiles();
        this.listTenants();
        this.listUsers();
    }

    getTenantCountData(){
        let tenantId = this.paramStor.CURRENT_TENANT().split("|")[1];
        this.getAllvolumes(tenantId);
        this.getAllSnapshots(tenantId);
        this.getAllReplications(tenantId);
    }
    showBackendsDeatil(type){
        this.showBackends = true;
        this.selectedType = type;
        this.typeDetail = this.Allbackends[type] ? this.Allbackends[type]:[];
    }
    deleteBackend(backend){
        if(backend.canDelete){
            let msg = "<div>you can't delete the backend with bucket</h3>";
            let header ="Prompt ";
            let acceptLabel = "Close";
            let warming = true;
            this.confirmDialog([msg,header,acceptLabel,warming,"close"])
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
                                this.showBackendsDeatil(this.selectedType);
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
            this.showRgister = false;
            this.http.get('v1/{project_id}/backends').subscribe((res)=>{
                let backends = res.json().backends ? res.json().backends :[];
                this.initBackendsAndNum(backends);
            });
        });
    }
    showRegister(){
        this.showRgister = true;
        this.backendForm.reset();
        this.backendForm.controls['name'].setValidators([Validators.required,Utils.isExisted(this.allBackendNameForCheck)]);
    }
}
