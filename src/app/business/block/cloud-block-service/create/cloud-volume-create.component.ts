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
    selector: 'app-cloud-volume-create',
    templateUrl: './cloud-volume-create.component.html',
    styleUrls: [],
    providers: [ConfirmationService, MsgBoxService ]
})
export class CloudVolumeCreateComponent implements OnInit{
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
        "name": { 
            required: "Name is required",
            minlength: "The volume name should have minimum 3 characters.",
            maxlength: "The volume name should have maximum 64 characters.",
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
            
        }

    ngOnInit(){
        this.createVolumeForm = this.fb.group({
            "name":["",{validators:[Validators.required, Validators.minLength(3), Validators.maxLength(63), Validators.pattern(this.validRule.name)], updateOn:'change'}],
            "description" : [""],
            "backendId":["",{validators:[Validators.required], updateOn:'change'}],
            "backend_type":["",{validators:[Validators.required], updateOn:'change'}],
            "availabilityZone": ['',{validators: [Validators.required]}],
            "size": ['', { validators: [Validators.required, Validators.min(4), Validators.max(16384), Validators.pattern(this.validRule.size)], updateOn: 'change' }],
            "type": [''],
            "iops": ['', { validators: [Validators.min(100), Validators.max(64000)], updateOn: 'change' }],
        });
        
        
        
        
        this.getTypes();
        this.getBackends();
    }

    onChangeVolType(){
        if(this.selectType=='aws-block'){
            if(this.selectedVolType=='gp2'){
                this.createVolumeForm.controls['size'].setValue(100);
                this.createVolumeForm.controls['size'].setValidators([Validators.required, Validators.min(1), Validators.max(16384)]);
                this.createVolumeForm.controls['size'].updateValueAndValidity();
            }
            if(this.selectedVolType=='io1'){
                if(!this.createVolumeForm.controls['iops']){
                    this.createVolumeForm.addControl('iops', this.fb.control(3000, Validators.required));
                }
                this.createVolumeForm.controls['size'].setValidators([Validators.required, Validators.min(4), Validators.max(16384)]);
                this.createVolumeForm.controls['size'].setValue(500);
                this.errorMessage.size.min = "Min: 4 GiB"
                this.createVolumeForm.controls['iops'].setValue(3000);
                this.createVolumeForm.controls['iops'].setValidators([Validators.required, Validators.min(100), Validators.max(64000)]);
                this.createVolumeForm.controls['size'].updateValueAndValidity();
                this.createVolumeForm.controls['iops'].updateValueAndValidity();
            }
            if(this.selectedVolType=='sc1' || this.selectedVolType=='st1'){
                this.createVolumeForm.removeControl('iops');
                this.createVolumeForm.controls['size'].setValue(500);
                this.errorMessage.size.min = "Min: 500 GiB"
                this.createVolumeForm.controls['size'].setValidators([Validators.required, Validators.min(500), Validators.max(16384)]);
                this.createVolumeForm.controls['size'].updateValueAndValidity();
            }
            
            if(this.selectedVolType=='standard'){
                this.createVolumeForm.removeControl('iops');
                this.createVolumeForm.controls['size'].setValue(500);
                this.errorMessage.size.min = "Min: 1 GiB"
                this.errorMessage.size.max = "Max: 1024 GiB"
                this.createVolumeForm.controls['size'].setValidators([Validators.required, Validators.min(1), Validators.max(1024)]);
                this.createVolumeForm.controls['size'].updateValueAndValidity();
            }
        }
        if(this.selectType=='hw-block'){

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

    getBackendsByTypeId() {
        this.backendsOption = [];
        if(this.selectType=='aws-block'){
            this.volumeTypeOptions = Consts.AWS_VOLUME_TYPES;
            if(!this.createVolumeForm.controls['iops']){
                this.createVolumeForm.addControl('iops', this.fb.control('', [Validators.required, Validators.min(100), Validators.max(64000)]));
                this.createVolumeForm.controls['iops'].updateValueAndValidity();
            }
            if(!this.createVolumeForm.controls['tags']){
                this.createVolumeForm.addControl('tags', this.fb.array([this.createTags('Name','')]));
            }
            if(!this.createVolumeForm.controls['encrypted']){
                this.createVolumeForm.addControl('encrypted', this.fb.control(false, Validators.required));
            }
            this.createVolumeForm.removeControl('encryptionSettings');
            if(!this.createVolumeForm.controls['encryptionSettings']){
                if(this.createVolumeForm.controls['encrypted']){
                    this.createVolumeForm.get("encrypted").valueChanges.subscribe(
                        (value:string)=>{
                            if(value){
                                this.createVolumeForm.addControl('encryptionSettings', this.fb.array([this.createEncryptionSettings('KmsKeyId', '')]));
                            }
                        }
                    );
                }
            }
        } else if(this.selectType=='hw-block'){
            this.volumeTypeOptions = Consts.HW_VOLUME_TYPES;
            this.createVolumeForm.controls['size'].setValue('');
            this.errorMessage.size.min = "Min: 10 GiB"
            this.errorMessage.size.max = "Max: 32768 GiB"
            this.createVolumeForm.controls['size'].setValidators([Validators.required, Validators.min(10), Validators.max(32768)]);
            this.createVolumeForm.controls['size'].updateValueAndValidity();
            this.createVolumeForm.removeControl('iops');
            this.createVolumeForm.removeControl('encrypted');
            this.createVolumeForm.removeControl('encryptionSettings');
            this.createVolumeForm.removeControl('tags');
        }
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

    updateEncryptionSettings(visible){
        const encSettingsControl = this.createVolumeForm.get('encryptionSettings');
        let encGrp:any =  this.createVolumeForm.controls['encryptionSettings']['controls'];
        if(visible){
            encGrp.forEach(item => {
                item.controls['key'].setValidators(Validators.required);
                item.controls['value'].setValidators(Validators.required);
            });
            encSettingsControl.updateValueAndValidity();
        } else{
            encGrp.forEach(item => {
                item.controls['key'].clearValidators();
                item.controls['key'].setValue('KmsKeyId');
                item.controls['value'].clearValidators();
                item.controls['value'].setValue('');
            });
        }
    }
    encryptionControl(){
        this.enableEncryption = this.createVolumeForm.get('encrypted').value;
        this.isVisible = this.enableEncryption;
        this.updateEncryptionSettings(this.isVisible);
    }

    createEncryptionSettings(key?, value?){
        return this.fb.group({
            key: new FormControl(key ? key : ''),
            value: new FormControl(value ? value : '')
        })
    }

    createTags(key?, value?){
        return this.fb.group({
            key: new FormControl(key ? key : ''),
            value: new FormControl(value ? value : '')
        })
    }
    addNextTag(key?, value?) {
        (this.createVolumeForm.controls['tags'] as FormArray).push(this.createTags((key ? key : ''), (value ? value : '')))
    }
    removeTagLink(i: number) {
        if(this.createVolumeForm.get('tags')['length'] > 1){
            this.createVolumeForm.get('tags')['removeAt'](i);
        }
    }

    getBackends() {
        this.http.get('v1/{project_id}/backends').subscribe((res)=>{
            this.allBackends = res.json().backends ? res.json().backends :[];
            this.allBackends.forEach(element => {
                if(element.type == 'aws-block'){
                    this.selectedBackends.push(element);
                }
            });
            if(this.selectedBackends && this.selectedBackends.length){
                this.cloudBS.getAllVolumes().subscribe((res) => {
                    let vols = res.json() && res.json().volumes ? res.json().volumes : [];
                    this.allAWSVolumes = vols;
                    
                }, (error) => {
                    this.allAWSVolumes = [];
                    console.log("Something went wrong. Error fetching file shares", error);
                })
            } else{
                this.allAWSVolumes = [];
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

    
    getVolumeDataArray(value){
       
        let dataArr = {
            name:value.name,
            availabilityZone: value.availabilityZone,
            size: parseInt(value.size) * Consts.FROM_GiB_CONVERTER,
            type: value.type,
            backendId:value.backendId,
        };
        if(value.iops){
            dataArr['iops'] = parseInt(value.iops);
        }
        if(value.description){
            dataArr['description'] = value.description;
        }
        dataArr['encrypted'] = value['encrypted'] ? value['encrypted'] : false;
        let enc = {};
        if(value['encryptionSettings']){
            value['encryptionSettings'].forEach(element => {
                enc[element['key']] = element['value'];
            });
            if(dataArr['encrypted']){
                dataArr['encryptionSettings'] = enc;
            }
        }
        
        if(value['tags']){
            dataArr['tags'] = value['tags'];
        }

        return dataArr;
    }

    createVolume(value){
        if(!this.createVolumeForm.valid){
            for(let i in this.createVolumeForm.controls){
                this.createVolumeForm.controls[i].markAsTouched();
            }
            return;
        }
        let param = this.getVolumeDataArray(value);
        this.cloudBS.createVolume(param).subscribe((res)=>{
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