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
        this.getTypes();
        this.getBackends();
        this.cloudBS.getVolumeById(this.selectedVolumeId).subscribe((res) => {
            let self = this;
            let vol = res.json();
            this.selectedVolume = vol;
            this.allBackends.forEach(backendItem => {
                if(this.selectedVolume['backendId'] == backendItem['id']){
                    this.selectedVolume['backendType'] = backendItem['type'];
                }
            });
            if(this.selectedVolume['backendType'] == "aws-block"){
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
                this.volumeTypeOptions = Consts.AWS_VOLUME_TYPES;
                this.onChangeVolType();
            } else if(this.selectedVolume['backendType'] == "hw-block"){
                this.modifyVolumeForm = this.fb.group({
                    "name" : [this.selectedVolume && this.selectedVolume['name'] ? this.selectedVolume['name'] : ''],
                });
            }
            
        }, (error) => {
            console.log("Something went wrong. Error fetching file shares", error);
        })
        
        
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
            this.modifyVolumeForm.controls['size'].setValue(this.selectedVolume && this.selectedVolume['size'] ? (this.selectedVolume['size'] / Math.pow(Consts.TO_GiB_CONVERTER, 3)) : 100);
            this.modifyVolumeForm.controls['size'].setValidators([Validators.required, Validators.min(1), Validators.max(16384)]);
            this.modifyVolumeForm.controls['size'].updateValueAndValidity();
            if(this.modifyVolumeForm.controls['iops']){
                this.modifyVolumeForm.removeControl('iops');
            }
        }
        if(this.selectedVolType=='io1'){
            if(!this.modifyVolumeForm.controls['iops']){
                this.modifyVolumeForm.addControl('iops', this.fb.control(this.selectedVolume && this.selectedVolume['iops'] ? this.selectedVolume['iops'] : 3000, Validators.required));
            }
            this.errorMessage.size.min = "Min: 4 GiB";
            this.modifyVolumeForm.controls['size'].setValidators([Validators.required, Validators.min(4), Validators.max(16384)]);
            this.modifyVolumeForm.controls['size'].setValue(this.selectedVolume && this.selectedVolume['size'] ? (this.selectedVolume['size'] / Math.pow(Consts.TO_GiB_CONVERTER, 3)) : 500);
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
            this.modifyVolumeForm.controls['size'].setValue(this.selectedVolume && this.selectedVolume['size'] && this.selectedVolume['size'] >= 500 ? (this.selectedVolume['size'] / Math.pow(Consts.TO_GiB_CONVERTER, 3)) : 500);
            this.modifyVolumeForm.controls['size'].setValidators([Validators.required, Validators.min(500), Validators.max(16384)]);
            this.modifyVolumeForm.controls['size'].updateValueAndValidity();
        }
      
        if(this.selectedVolType=='standard'){
            if(this.modifyVolumeForm.controls['iops']){
                this.modifyVolumeForm.removeControl('iops');
            }
            this.errorMessage.size.min = "Min: 1 GiB";
            this.errorMessage.size.max = "Max: 1024 GiB";
            this.modifyVolumeForm.controls['size'].setValue(this.selectedVolume && this.selectedVolume['size'] ? (this.selectedVolume['size'] / Math.pow(Consts.TO_GiB_CONVERTER, 3)) : 500);
            this.modifyVolumeForm.controls['size'].setValidators([Validators.required, Validators.min(1), Validators.max(1024)]);
            this.modifyVolumeForm.controls['size'].updateValueAndValidity();
        }
    }

    getTypes() {
        this.allTypes = [];
        this.BucketService.getTypes().subscribe((res) => {
            res.json().types.forEach(element => {
            if( element.name=='aws-block' || element.name=='hw-block'){
                this.allTypes.push({
                    label: Consts.CLOUD_TYPE_NAME[element.name],
                    value: element.name
                })
            }
            });
        });
        
    }

    getBackends() {
        this.http.get('v1/{project_id}/backends').subscribe((res)=>{
            this.allBackends = res.json().backends ? res.json().backends :[];
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
            
        };
        if(this.selectedVolume['backendType'] == "aws-block"){
            if(value.size){
                dataArr['size'] =  parseInt(value.size) * Consts.FROM_GiB_CONVERTER;
            }
            if(value.type){
                dataArr['type'] = value.type;
            }
            if(value.iops){
                dataArr['iops'] = parseInt(value.iops);
            }
            if(value.description){
                dataArr['description'] = value.description;
            }
            if(value['tags']){
                dataArr['tags'] = value['tags'];
            }
        } else if(this.selectedVolume['backendType'] == "hw-block"){
            if(value.name){
                dataArr['name'] = value.name;
            }
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
            this.msgs.push({severity: 'success', summary: 'Success', detail: 'Cloud Volume has been modified successfully.'});
            let queryParams = {
                "message": JSON.stringify({severity: 'success', summary: 'Success', detail: 'Cloud Volume has been modified successfully.'})
            };
            this.selectedBackends = [];
            this.selectType = "";
            this.selectedVolType = "";
            this.router.navigate(['/block',"fromCloudVolume"], {queryParams: queryParams});
        }, (error)=>{
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: "Error", detail: 'Cloud Volume could not be modified.'});
        })
    }
}
