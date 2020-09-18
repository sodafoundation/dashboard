import { Router,ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener, Input } from '@angular/core';
import { I18NService, Consts, MsgBoxService, HttpService, Utils } from 'app/shared/api';
import { ConfirmationService, ConfirmDialogModule, MenuItem, Message} from '../../../../components/common/api';
import { FormGroup, Validators, FormBuilder, FormControl, FormArray } from '@angular/forms';
import { trigger, state, style, transition, animate} from '@angular/animations';
import { I18nPluralPipe } from '@angular/common';
import { CloudBlockServiceService} from '../cloud-block-service.service';
import { BucketService } from '../../buckets.service';


let _ = require("underscore");
@Component({
    selector: 'app-cloud-volume-modify',
    templateUrl: './cloud-volume-modify.component.html',
    styleUrls: [],
    providers: [ConfirmationService, MsgBoxService ]
})
export class CloudVolumeModifyComponent implements OnInit{
    allCloudVolumes: any = [];
    modifyVolumeForm: FormGroup;
    allBackends: any = [];
    backendsOption = [];
    allTypes = [];
    selectType;
    listedBackends: any;
    allAWSVolumes: any = [];
    selectedVolumes: any = [];
    selectedBackends = [];
    selectedVolume: any;
    selectedVolumeId: any;
    backendId: any;
    volumeTypeOptions: any = [];
    selectedVolType;
    msgs: Message[];
    menuItems: MenuItem[];
    menuDeleDisableItems : MenuItem[];
    createVolumeDisplay: boolean = false;
    enableEncryption: boolean = false;
    isVisible: boolean = false;
    label = {
        name: "Name",
        description: "Description",
        size: "Size",
        type: "Type",
        encrypted: "Enable Encryption",
        encryptionSettings: "Encryption Settings",
        state: "State",
        volumeId: "Volume ID",
        availabilityZone: "Availability Zone",
        createdAt: "Created At",
        iops: "IOPS",
        tags: "Tags",
    };
    errorMessage = {
        "size" : {
            required: "Size is required",
            min: "Min: 1 GiB",
            max: "Max: 16384 GiB",
            pattern: "Size must be a number."
        },
        "type" : {
            required: "Type is required"
        },
        "iops" : {
            required: "IOPS is required",
            min: "Min: 100 IOPS",
            max: "Max: 64000 IOPS"
        }
        
    };
    validRule= {
        'name':'^[a-zA-Z]{1}([a-zA-Z0-9]|[-_]){0,63}$',
        'size' : '^[0-9]*$'
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
            this.ActivatedRoute.params.subscribe((params) => {
                this.selectedVolumeId = params.volumeId
                
            });
        }

    ngOnInit(){
        this.cloudBS.getVolumeById(this.selectedVolumeId).subscribe((res) => {
            let self = this;
            let vol = res.json();
            this.selectedVolume = vol;
            
            if(this.selectedVolume && this.selectedVolume['type']){
                this.selectedVolType = this.selectedVolume['type'];
            }

            this.modifyVolumeForm = this.fb.group({
                "description" : [this.selectedVolume && this.selectedVolume['description'] ? this.selectedVolume['description'] : ''],
                "size": [this.selectedVolume && this.selectedVolume['size'] ? this.selectedVolume['size'] : '', { validators: [Validators.required, Validators.min(4), Validators.max(16384), Validators.pattern(this.validRule.size)], updateOn: 'change' }],
                "type": [this.selectedVolume && this.selectedVolume['type'] ? this.selectedVolume['type'] : ''],
                "iops": [this.selectedVolume && this.selectedVolume['iops'] ? this.selectedVolume['iops'] : '', { validators: [Validators.min(100), Validators.max(64000)], updateOn: 'change' }],
            });
            

            if(this.selectedVolume['tags'] && this.selectedVolume['tags'].length){
                _.each(this.selectedVolume['tags'], function(item){
                   self.modifyVolumeForm.addControl('tags', self.fb.array([self.createTags('','',item)]));
               });
            }
            this.onChangeVolType();
        }, (error) => {
            console.log("Something went wrong. Error fetching file shares", error);
        })
        
      
        this.volumeTypeOptions = [
            {
                label: 'General Purpose',
                value: 'gp2'
            },
            {
                label: 'Provisioned IOPS',
                value: 'io1'
            },
            {
                label: 'Cold HDD',
                value: 'sc1'
            },
            {
                label: 'Throughput Optimized',
                value: 'st1'
            },
            {
                label: 'Magnetic(Standard)',
                value: 'standard'
            }
        ];
        this.getTypes();
        
    }

    getVolumeDetails(){
        this.cloudBS.getVolumeById(this.selectedVolumeId).subscribe((res) => {
            let vol = res.json();
            this.selectedVolume = vol;
        }, (error) => {
            console.log("Something went wrong. Error fetching file shares", error);
        })
    }

    onChangeVolType(){
        if(this.selectedVolType=='gp2'){
            this.modifyVolumeForm.controls['size'].setValue(this.selectedVolume && this.selectedVolume['size'] ? this.selectedVolume['size'] : 100);
            this.modifyVolumeForm.controls['size'].setValidators([Validators.required, Validators.min(1), Validators.max(16384)]);
            this.modifyVolumeForm.controls['size'].updateValueAndValidity();
            if(this.modifyVolumeForm.controls['iops']){
                this.modifyVolumeForm.controls['iops'].clearValidators();
                this.modifyVolumeForm.controls['iops'].updateValueAndValidity();
            }
        }
        if(this.selectedVolType=='io1'){
            if(!this.modifyVolumeForm.controls['iops']){
                this.modifyVolumeForm.addControl('iops', this.fb.control(this.selectedVolume && this.selectedVolume['iops'] ? this.selectedVolume['iops'] : 3000, Validators.required));
            }
            this.errorMessage.size.min = "Min: 4 GiB";
            this.modifyVolumeForm.controls['size'].setValidators([Validators.required, Validators.min(4), Validators.max(16384)]);
            this.modifyVolumeForm.controls['size'].setValue(this.selectedVolume && this.selectedVolume['size'] ? this.selectedVolume['size'] : 500);
            this.modifyVolumeForm.controls['iops'].setValue(this.selectedVolume && this.selectedVolume['iops'] ? this.selectedVolume['iops'] : 3000);
            this.modifyVolumeForm.controls['iops'].setValidators([Validators.required, Validators.min(100), Validators.max(64000)]);
            this.modifyVolumeForm.controls['size'].updateValueAndValidity();
            this.modifyVolumeForm.controls['iops'].updateValueAndValidity();
        }
        if(this.selectedVolType=='sc1' || this.selectedVolType=='st1'){
           if(this.modifyVolumeForm.controls['iops']){
                this.modifyVolumeForm.removeControl('iops');
            }
            this.errorMessage.size.min = "Min: 500 GiB";
            this.modifyVolumeForm.controls['size'].setValue(this.selectedVolume && this.selectedVolume['size'] && this.selectedVolume['size'] >= 500 ? this.selectedVolume['size'] : 500);
            this.modifyVolumeForm.controls['size'].setValidators([Validators.required, Validators.min(500), Validators.max(16384)]);
            this.modifyVolumeForm.controls['size'].updateValueAndValidity();
        }
      
        if(this.selectedVolType=='standard'){
            if(this.modifyVolumeForm.controls['iops']){
                this.modifyVolumeForm.removeControl('iops');
            }
            this.errorMessage.size.min = "Min: 1 GiB";
            this.errorMessage.size.max = "Min: 1024 GiB";
            this.modifyVolumeForm.controls['size'].setValue(this.selectedVolume && this.selectedVolume['size'] ? this.selectedVolume['size'] : 500);
            this.modifyVolumeForm.controls['size'].setValidators([Validators.required, Validators.min(1), Validators.max(1024)]);
            this.modifyVolumeForm.controls['size'].updateValueAndValidity();
        }
    }

    getTypes() {
        this.allTypes = [];
        this.BucketService.getTypes().subscribe((res) => {
            res.json().types.forEach(element => {
            if( element.name=='aws-block'){
                this.allTypes.push({
                    label: Consts.CLOUD_TYPE_NAME[element.name],
                    value: element.name
                })
            }
            });
        });
        
    }

   
    createTags(key?, value?, tagObj?){
        if(tagObj){
           return this.fb.group({
            key: new FormControl(tagObj.key),
            value: new FormControl(tagObj.value),
          })
        } else{
            return this.fb.group({
                key: new FormControl(key ? key : ''),
                value: new FormControl(value ? value : '')
            })
        }
    }
    addNextTag(key?, value?) {
        (this.modifyVolumeForm.controls['tags'] as FormArray).push(this.createTags((key ? key : ''), (value ? value : '')))
    }
    removeTagLink(i: number) {
        if(this.modifyVolumeForm.get('tags')['length'] > 1){
            this.modifyVolumeForm.get('tags')['removeAt'](i);
        }
    }
    
    
    getVolumeDataArray(value){
       
        let dataArr = {
            size: parseInt(value.size),
            type: value.type
        };
        if(value.iops){
            dataArr['iops'] = parseInt(value.iops);
        }
        if(value.description){
            dataArr['description'] = value.description;
        }
        if(value['tags']){
            dataArr['tags'] = value['tags'];
        }

        return dataArr;
    }

    modifyVolume(value){
        if(!this.modifyVolumeForm.valid){
            for(let i in this.modifyVolumeForm.controls){
                this.modifyVolumeForm.controls[i].markAsTouched();
            }
            return;
        }
        let param = this.getVolumeDataArray(value);
        this.cloudBS.updateVolume(this.selectedVolumeId, param).subscribe((res)=>{
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: 'Cloud Volume has been created successfully.'});
            let queryParams = {
                "message": JSON.stringify({severity: 'success', summary: 'Success', detail: 'Cloud Volume has been created successfully.'})
            };
            this.selectedBackends = [];
            this.selectType = "";
            this.selectedVolType = "";
            this.router.navigate(['/block',"fromCloudVolume"], {queryParams: queryParams});
        }, (error)=>{
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: "Error", detail: 'Cloud Volume could not be created.'});
        })
    }
}
