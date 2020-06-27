import { Router,ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener, Input } from '@angular/core';
import { I18NService, Consts, MsgBoxService, HttpService, Utils } from 'app/shared/api';
import { ConfirmationService, ConfirmDialogModule, MenuItem, Message} from '../../../components/common/api';
import { FormGroup, Validators, FormBuilder, FormControl, FormArray } from '@angular/forms';
import { trigger, state, style, transition, animate} from '@angular/animations';
import { I18nPluralPipe } from '@angular/common';
import { CloudBlockServiceService} from './cloud-block-service.service';
import { BucketService } from '../buckets.service';


let _ = require("underscore");
@Component({
    selector: 'app-cloud-block-service',
    templateUrl: './cloud-block-service.component.html',
    styleUrls: [],
    providers: [ConfirmationService, MsgBoxService ]
})
export class CloudBlockServiceComponent implements OnInit{
    allCloudVolumes: any = [];
    createVolumeForm: FormGroup;
    allBackends: any = [];
    backendsOption = [];
    allTypes = [];
    selectType;
    listedBackends: any;
    allAWSVolumes: any = [];
    selectedVolumes: any = [];
    selectedBackends = [];
    selectedVolume: any;
    backendId: any;
    msgs: Message[];
    menuItems: MenuItem[];
    menuDeleDisableItems : MenuItem[];
    createVolumeDisplay: boolean = false;
    label = {
        name: "Name",
        size: "Size",
        type: "Type",
        state: "State",
        volumeId: "Volume ID",
        availabilityZone: "Availability Zone",
        createdAt: "Created At",
        iops: "IOPS"
    };
    errorMessage = {
        "name": { 
            required: "Name is required",
            minLength: "Minimum 2 characters",
            maxLength: "Maximum 64 characters",
            pattern: "Must start with a character. Can contain alphabets, numbers and underscore. No special characters allowed."
        },
        "backend_type" : {
            required: "Backend type is required"
        },
        "backend" : {
            required: "Backend is required"
        },
        "availabilityZone" : {
            required: "Availability Zone is required"
        },
        "size" : {
            required: "Size is required"
        },
        "type" : {
            required: "Type is required"
        },
        "iops" : {
            required: "IOPS is required"
        }
        
    };
    validRule= {
        'name':'^[a-zA-Z]{1}([a-zA-Z0-9]|[-_]){0,63}$'
    };

    constructor(private cloudBS: CloudBlockServiceService,
        private router: Router,
        private ActivatedRoute: ActivatedRoute,
        public I18N:I18NService,
        private http: HttpService,
        private fb: FormBuilder,
        private msg: MsgBoxService,
        private confirmationService: ConfirmationService,
        private BucketService: BucketService
        ){
            this.getBackends();
        }

    ngOnInit(){
        this.createVolumeForm = this.fb.group({
            "name":["",{validators:[Validators.required, Validators.minLength(3), Validators.maxLength(63)], updateOn:'change'}],
            "backendId":["",{validators:[Validators.required], updateOn:'change'}],
            "backend_type":["",{validators:[Validators.required], updateOn:'change'}],
            "availabilityZone": ['',{validators: [Validators.required]}],
            "size": ['', { validators: [Validators.required], updateOn: 'change' }],
            "type": ['', { validators: [Validators.required], updateOn: 'change' }],
            "iops": ['', { validators: [Validators.required], updateOn: 'change' }],
        });
        this.getTypes();
        this.getBackends();
    }

    getTypes() {
        this.allTypes = [];
        this.BucketService.getTypes().subscribe((res) => {
            res.json().types.forEach(element => {
            if( element.name=='aws-file'){
                this.allTypes.push({
                    label: Consts.CLOUD_TYPE_NAME[element.name],
                    value: element.name
                })
            }
            });
        });
        
    }

    getBackendsByTypeId() {
        this.backendsOption = [];
        this.BucketService.getBackendsByTypeId(this.selectType).subscribe((res) => {
            let backends = res.json().backends ? res.json().backends :[];
            this.listedBackends = backends;
            backends.forEach(element => {
                this.backendsOption.push({
                    label: element.name,
                    value: element.id
                })
            });
        });
    }

    setRegion(){
        let selectedBackend = this.createVolumeForm.value.backend;
        this.listedBackends.forEach( element =>{
            if(element.name == selectedBackend){
               
            }
        })
    }


    getBackends() {
        this.http.get('v1/{project_id}/backends').subscribe((res)=>{
            this.allBackends = res.json().backends ? res.json().backends :[];
            this.allBackends.forEach(element => {
                if(element.type == 'aws-file'){
                    this.selectedBackends.push(element);
                }
                this.backendId = this.selectedBackends[0]['id'];


            });
            if(this.backendId){
                this.cloudBS.getVolumesByBackend(this.backendId).subscribe((res) => {
                    let vols = res.json() && res.json().volumes ? res.json().volumes : [];
                    this.allAWSVolumes = vols;
                    
                }, (error) => {
                    this.allAWSVolumes = [];
                    console.log("Something went wrong. Error fetching file shares", error);
                })
            }
        });
    }

    getVolumes(){
        let self = this;
        this.cloudBS.getVolumesByBackend(this.selectedBackends[0]['id']).subscribe((res) => {
            let vols = res.json() && res.json().volumes ? res.json().volumes : [];
            this.allAWSVolumes = vols;
            
        }, (error) => {
            console.log("Something went wrong. Error fetching file shares", error);
        })
    }

    showCreate(){
        this.createVolumeDisplay = true;
        this.createVolumeForm.reset(
            {
                "name":"",
                "backendId":"",
                "backend_type":"",
                "availabilityZone" : "",
                "size" : "",
                "type" : "",
                "iops" : "",
            }
        );
        this.createVolumeForm.controls['name'].setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(63), Validators.pattern(this.validRule.name)]);
    }

    createVolume(){
        if(!this.createVolumeForm.valid){
            for(let i in this.createVolumeForm.controls){
                this.createVolumeForm.controls[i].markAsTouched();
            }
            return;
        }
        let param = {
            name:this.createVolumeForm.value.name,
            availabilityZone: this.createVolumeForm.value.availabilityZone,
            size: parseInt(this.createVolumeForm.value.size),
            type: this.createVolumeForm.value.type,
            backendId:this.createVolumeForm.value.backendId,
            iops: parseInt(this.createVolumeForm.value.iops)
        };
        this.cloudBS.createVolume(param).subscribe((res)=>{
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: 'Cloud Volume has been created successfully.'});
            this.createVolumeDisplay = false;
            this.getBackends();
        }, (error)=>{
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: "Error", detail: 'Cloud Volume could not be created.'});
        })
    }
    
    returnSelectedVolume(selectedVolume){
        this.selectedVolume = selectedVolume;
    }

    
}