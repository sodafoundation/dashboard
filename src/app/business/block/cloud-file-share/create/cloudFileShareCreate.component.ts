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
import { CloudFileShareService } from '../cloudFileShare.service';
import { BucketService} from '../../buckets.service';

@Component({
    selector: 'app-create-cloud-file-share',
    templateUrl: './cloudFileShareCreate.component.html',
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
    isDisabled: boolean = true;
    errorMessage = {
        "zone": { required: "Zone is required."},
        "name": { 
            required: "Name is required",
            minLength: "Minimum 2 characters",
            maxLength: "Maximum 128 characters",
            pattern: "Must start with a character. Can contain alphabets, numbers and underscore. No special characters allowed."
        },
        "backend_type" : {
            required: "Backend type is required"
        },
        "backend" : {
            required: "Backend is required"
        },
        "region": { required: "Region is required" },
        "description" : {
            maxLength: "Maximum 250 characters",
            pattern: "Must start with a character. Can contain alphabets, numbers and underscore. No special characters allowed."
        }
    };
    validRule= {
        'name':'^[a-zA-Z]{1}([a-zA-Z0-9]|[_]){0,127}$',
        'description':'^[a-zA-Z]{1}([a-zA-Z0-9]){0,249}$'
    };
    label = {
        zone: this.i18n.keyID["sds_block_volume_az"],
        name: this.i18n.keyID["sds_block_volume_name"],
        description: this.i18n.keyID["sds_block_volume_descri"],
        region: 'Region',
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
        this.getAZ();
        this.cloudFileShareCreateForm = this.fb.group({
            'zone': new FormControl('', Validators.required),
            'name': new FormControl('', {validators:[Validators.required, Validators.minLength(2), Validators.maxLength(128), Validators.pattern(this.validRule.name),Utils.isExisted(this.allNamesForCheck)]}),
            'description': new FormControl('', {validators:[Validators.maxLength(250),Validators.pattern(this.validRule.description)]}),
            'backend_type' : ["",{validators:[Validators.required], updateOn:'change'}],
            'backend':["",{validators:[Validators.required], updateOn:'change'}],
            'region' : ["", {validators:[Validators.required]}],
            "encrypted": [false, { validators: [Validators.required], updateOn: 'change' }],
            "encryptionSettings":this.fb.array([this.createEncryptionSettings()]),
            "size": [1, {}],
            'tags' : this.fb.array([this.createTags()]),
            'metadata' : this.fb.array([this.createMetadata()])
        });
        this.getTypes();
        this.getBackends();
        
        
    }

    encryptionControl(){
        this.enableEncryption = this.cloudFileShareCreateForm.get('encrypted').value;
        if(this.enableEncryption){
            this.isDisabled = !this.isDisabled;
        } 
    }

    createEncryptionSettings(){
        return this.fb.group({
            key: new FormControl('', Validators.required),
            value: new FormControl('', Validators.required)
          })
    }

    createTags(){
        return this.fb.group({
            key: new FormControl('', Validators.required),
            value: new FormControl('', Validators.required)
          })
    }
    addNextTag() {
        (this.cloudFileShareCreateForm.controls['tags'] as FormArray).push(this.createTags())
    }
    removeTagLink(i: number) {
        
        if(this.cloudFileShareCreateForm.get('tags')['length'] > 1){
            this.cloudFileShareCreateForm.get('tags')['removeAt'](i);
        }
    }

    createMetadata(){
        return this.fb.group({
            key: new FormControl('', Validators.required),
            value: new FormControl('', Validators.required)
          })
    }

    addNextMetadata() {
        (this.cloudFileShareCreateForm.controls['metadata'] as FormArray).push(this.createMetadata())
    }
    removeMetadataLink(i: number) {
       
        if(this.cloudFileShareCreateForm.get('metadata')['length'] > 1){
            this.cloudFileShareCreateForm.get('metadata')['removeAt'](i);
        }
    }

    getFileShareDataArray(value){
        //let unit = value['capacity'] === 'GB'? 1 : 1024;
        let enc = {};
        value['encryptionSettings'].forEach(element => {
            enc[element['key']] = element['value'];
        });
        let meta = {};
        value['metadata'].forEach(element => {
            meta[element['key']] = element['value'];
        });
        let dataArr = {
            availabilityZone: value['zone'],
            name: value['name'],
            description: value['description'],
            region: value['region'],
            encrypted: value['encrypted'],
            encryptionSettings : enc,
            size: value['size'],
            tags: value['tags'],
            metadata: meta
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
        this.cloudFS.createFileShare(dataArr, this.selectedBackend['id']).subscribe((res)=>{
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: 'File share has been created successfully.'});
            this.router.navigate(['/block',"fromCloudFileShare"]);
        }, (error) =>{
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: "Error", detail: error._body});
            console.log("Something went wrong. File share could not be created.", error);
        })
    }
    getAZ(){
        this.availabilityZonesService.getAZ().subscribe((azRes) => {
          let AZs=azRes.json();
          let azArr = [];
          if(AZs && AZs.length !== 0){
              AZs.forEach(item =>{
                  let obj = {label: item, value: item};
                  azArr.push(obj);
              })
          }
          this.availabilityZones = azArr;
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

    getTypes() {
        this.allTypes = [];
        this.BucketService.getTypes().subscribe((res) => {
            res.json().types.forEach(element => {
            if( element.name=='aws-file' || element.name == 'azure-file' ){
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
        let selectedBackend = this.cloudFileShareCreateForm.value.backend;
        this.listedBackends.forEach( element =>{
            if(element.name == selectedBackend){
                this.selectedRegion = element.region;
                this.selectedBackend = element;
            }
        })
        this.cloudFileShareCreateForm.patchValue({
            'region' : this.selectedRegion
        }) 
    }

}