import { Router,ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener, Input } from '@angular/core';
import { I18NService, Consts, MsgBoxService, HttpService, Utils } from 'app/shared/api';
import { ConfirmationService, ConfirmDialogModule, Message} from '../../../../components/common/api';
import { trigger, state, style, transition, animate} from '@angular/animations';
import { I18nPluralPipe } from '@angular/common';
import { FormGroup, Validators, FormBuilder, FormControl, FormArray } from '@angular/forms';
import { Http } from '@angular/http';
import { AvailabilityZonesService } from '../../../resource/resource.service';
import { ProfileService } from '../../../profile/profile.service';
import { CloudFileShareService } from '../cloud-file-share.service';
import { BucketService} from '../../buckets.service';

@Component({
    selector: 'app-create-cloud-file-share',
    templateUrl: './cloud-file-share-create.component.html',
    styleUrls: [],
    providers: [ConfirmationService, MsgBoxService]
})
export class CloudFileShareCreateComponent implements OnInit{
    cloudFileShareCreateForm: FormGroup;
    availabilityZones = [];
    allNamesForCheck = [];
    backendsOption = [];
    allBackends = [];
    allTypes = [];
    selectType;
    listedBackends: any;
    selectedRegion: any;
    selectedBackend: any;
    enableEncryption = false;
    sseTypes = [];
    selectedSse;
    isVisible: boolean = false;
    showField: boolean = true;
    errorMessage = {
        "name": { 
            required: "Name is required",
            minlength: "The file share name should have minimum 2 characters.",
            maxlength: "The file share name should have maximum 128 characters.",
            pattern: "Must start with a character. Can contain alphabets, numbers and underscore. No special characters allowed."
        },
        "backend_type" : {
            required: "Backend type is required"
        },
        "backend" : {
            required: "Backend is required"
        },
        "description" : {
            maxLength: "Maximum 250 characters",
            pattern: "Must start with a character. Can contain alphabets, numbers and underscore. No special characters allowed."
        }
    };
    validRule= {
        'name':'^[a-zA-Z]{1}([a-zA-Z0-9]|[-_]){0,127}$',
        'description':'^[a-zA-Z ]{1}([a-zA-Z0-9 ]){0,249}$'
    };
    label = {
        name: this.i18n.keyID["sds_block_volume_name"],
        description: this.i18n.keyID["sds_block_volume_descri"],
        encrypted: "Enable Encryption",
        encryptionSettings: "Encryption Settings",
        size: "Size",
        tags: "Tags",
        metadata: "Metadata",
        backend_type: "Type",
        backend: "Backend"
    };
    msgs: Message[];

    constructor(
        private cloudFS: CloudFileShareService,
        private router: Router,
        private ActivatedRoute: ActivatedRoute,
        public i18n:I18NService,
        private confirmationService: ConfirmationService,
        private http: HttpService,
        private fb: FormBuilder,
        private msg: MsgBoxService,
        private availabilityZonesService:AvailabilityZonesService, 
        private ProfileService: ProfileService,
        private BucketService: BucketService){

    }
    ngOnInit(){
        this.cloudFileShareCreateForm = this.fb.group({
            'backend_type' : ["",{validators:[Validators.required], updateOn:'change'}],
            'backend':["",{validators:[Validators.required], updateOn:'change'}],
            'name': new FormControl('', {validators:[Validators.required, Validators.minLength(2), Validators.maxLength(128), Validators.pattern(this.validRule.name),Utils.isExisted(this.allNamesForCheck)]}),
            'description': new FormControl('', {validators:[Validators.maxLength(250),Validators.pattern(this.validRule.description)]}),
        });
        this.getTypes();
        this.getBackends();
    }

    getTypes() {
        this.allTypes = [];
        this.BucketService.getTypes().subscribe((res) => {
            res.json().types.forEach(element => {
            if( element.name=='aws-file' || element.name == 'azure-file' || element.name == 'gcp-file'){
                this.allTypes.push({
                    label: Consts.CLOUD_TYPE_NAME[element.name],
                    value: element.name
                })
            }
            });
        });
        
    }

    getBackendsByTypeId() {
        this.prepareCreateForm(this.selectType);
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

    prepareCreateForm(type){
        if(type == 'azure-file'  || type== 'gcp-file' ) {
            this.cloudFileShareCreateForm.addControl('size', this.fb.control(''))
            this.cloudFileShareCreateForm.addControl('metadata', this.fb.array([this.createMetadata()]));
            this.cloudFileShareCreateForm.removeControl('tags');
            this.cloudFileShareCreateForm.removeControl('encrypted');
            this.cloudFileShareCreateForm.removeControl('encryptionSettings');
        } else{
            this.cloudFileShareCreateForm.removeControl('size');
            this.cloudFileShareCreateForm.removeControl('metadata');
        }
        if(type == 'aws-file') {
            if(this.cloudFileShareCreateForm.controls['size']){
                this.cloudFileShareCreateForm.removeControl('size');
            }
            
            this.cloudFileShareCreateForm.addControl('encrypted', this.fb.control(false, [Validators.required]));
            if(this.cloudFileShareCreateForm.controls['encrypted']){
                this.cloudFileShareCreateForm.addControl('encryptionSettings', this.fb.array([this.createEncryptionSettings('KmsKeyId', '')]));
            }
            this.cloudFileShareCreateForm.addControl('tags', this.fb.array([this.createTags('Name','')]));
            if(!this.cloudFileShareCreateForm.controls['metadata']){
                this.cloudFileShareCreateForm.addControl('metadata', this.fb.array([this.createMetadata('PerformanceMode', 'generalPurpose')]));
                this.addNextMetadata('ThroughputMode', 'bursting');
                this.addNextMetadata('ProvisionedThroughputInMibps', '');
            }
            
        } else{
            let self =this;
            if(this.cloudFileShareCreateForm.get('metadata')['length']>1){
                this.cloudFileShareCreateForm.removeControl('metadata');
                this.cloudFileShareCreateForm.addControl('metadata', this.fb.array([this.createMetadata()]));
            }
        }
        
    }

    updateFormAndRegion(){
        let selected = this.cloudFileShareCreateForm.value.backend;
        this.listedBackends.forEach( element =>{
            if(element.name == selected){
                this.selectedRegion = element.region;
                this.selectedBackend = element;
            }
        })
        this.cloudFileShareCreateForm.patchValue({
            'region' : this.selectedRegion
        })
       
    }
    
    updateEncryptionSettings(visible){
        const encSettingsControl = this.cloudFileShareCreateForm.get('encryptionSettings');
        let encGrp:any =  this.cloudFileShareCreateForm.controls['encryptionSettings']['controls'];
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
        this.enableEncryption = this.cloudFileShareCreateForm.get('encrypted').value;
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
            key: new FormControl(key ? key : '', Validators.required),
            value: new FormControl(value ? value : '', Validators.required)
        })
    }
    addNextTag(key?, value?) {
        (this.cloudFileShareCreateForm.controls['tags'] as FormArray).push(this.createTags((key ? key : ''), (value ? value : '')))
    }
    removeTagLink(i: number) {
        if(this.cloudFileShareCreateForm.get('tags')['length'] > 1){
            this.cloudFileShareCreateForm.get('tags')['removeAt'](i);
        }
    }

    createMetadata(key?, value?){
        return this.fb.group({
            key: new FormControl(key ? key : '', Validators.required),
            value: new FormControl(value ? value : '', Validators.required)
        })
    }

    addNextMetadata(key?, value?) {
        (this.cloudFileShareCreateForm.controls['metadata'] as FormArray).push(this.createMetadata((key ? key : ''), (value ? value : '')))
    }
    removeMetadataLink(i: number) {
        if(this.cloudFileShareCreateForm.get('metadata')['length'] > 1){
            this.cloudFileShareCreateForm.get('metadata')['removeAt'](i);
        }
    }

    getFileShareDataArray(value){
        let meta = {};
        value['metadata'].forEach(element => {
            if(element['key']=="ProvisionedThroughputInMibps"){
                meta[element['key']] = parseInt(element['value']);
            } else{
                meta[element['key']] = element['value'];
            }
            
        });
        let dataArr = {
            name: value['name'],
            description: value['description'],
            backendId: this.selectedBackend['id'],
            metadata: meta
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
        
        if(value['size']){
            dataArr['size'] = parseInt(value['size']);
        }
        if(value['tags']){
            dataArr['tags'] = value['tags'];
        }

        return dataArr;
    }
    onSubmit(value){
        if(!this.cloudFileShareCreateForm.valid){
            for(let i in this.cloudFileShareCreateForm.controls){
                this.cloudFileShareCreateForm.controls[i].markAsTouched();
            }
            return;
        }
        let dataArr = this.getFileShareDataArray(value);

        this.cloudFS.createFileShare(dataArr).subscribe((res)=>{
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: 'File share has been created successfully.'});
            let queryParams = {
                "message": JSON.stringify({severity: 'success', summary: 'Success', detail: 'File share has been created successfully.'})
            };
            this.router.navigate(['/block',"fromCloudFileShare"], {queryParams: queryParams});
        }, (error) =>{
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: "Error", detail:"Something went wrong. File share could not be created."});
            console.log("Something went wrong. File share could not be created.", error);
        })
    }
   
    getFileShares(){
        this.cloudFS.getAllFileShares().subscribe((res)=>{
            let fileShares = res.json();
            fileShares.forEach(item=>{
                this.allNamesForCheck.push(item.name);
            })
        })
    }
}