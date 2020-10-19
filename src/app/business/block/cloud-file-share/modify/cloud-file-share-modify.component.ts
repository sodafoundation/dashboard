import { Router,ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener, Input } from '@angular/core';
import { I18NService, Consts, MsgBoxService, HttpService, Utils } from 'app/shared/api';
import { ConfirmationService, ConfirmDialogModule, Message} from '../../../../components/common/api';
import { trigger, state, style, transition, animate} from '@angular/animations';
import { I18nPluralPipe } from '@angular/common';
import { FormGroup, Validators, FormBuilder, FormControl, FormArray } from '@angular/forms';
import { Http } from '@angular/http';
import { CloudFileShareService } from '../cloud-file-share.service';
import { BucketService} from '../../buckets.service';

let _ = require("underscore");

@Component({
    selector: 'app-modify-cloud-file-share',
    templateUrl: './cloud-file-share-modify.component.html',
    styleUrls: [],
    providers: [ConfirmationService, MsgBoxService]
})
export class CloudFileShareModifyComponent implements OnInit{
    cloudFileShareModifyForm: FormGroup;
    fileShareId: any;
    showModifyForm: boolean = false;
    modifyMetadataArr: any = [];
    modifyTagsArr: any = [];
    selectedFileShare: any;
    backendsOption = [];
    allBackends = [];
    allTypes = [];
    selectType;
    selectBackend;
    listedBackends: any;
    selectedRegion: any;
    selectedBackend: any;
    enableEncryption = false;
    errorMessage = {
        "name": {
            required: "Name is required",
            minLength: "Minimum 2 characters",
            maxLength: "Maximum 128 characters",
            pattern: "Must start with a character. Can contain alphabets, numbers and underscore. No special characters allowed."
        },
        "size" : {
            required: "Size is required"
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
        'name':'^[a-zA-Z]{1}([a-zA-Z0-9]|[-_]){0,127}$',
        'description':'^[a-zA-Z ]{1}([a-zA-Z0-9 ]){0,249}$'
    };
    label = {
        name: this.i18n.keyID["sds_block_volume_name"],
        description: this.i18n.keyID["sds_block_volume_descri"],
        region: 'Region',
        encrypted: "Enable Encryption",
        encryptionSettings: "Encryption Settings",
        size: "Size (GiB)",
        tags: "Tags",
        metadata: "Metadata",
        backend_type: "Type",
        backend: "Backend",
        az: "Availability Zone"
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
        private BucketService: BucketService)
    {
        this.ActivatedRoute.params.subscribe((params) => {
            this.fileShareId = params.fileShareId
        });


    }
    ngOnInit(){
        let self =this;
        this.cloudFS.getFileShareById(this.fileShareId).subscribe((res) => {
            this.selectedFileShare = res.json();
            this.BucketService.getBckends().subscribe((res) => {
                this.allBackends = res.json().backends;
                this.allBackends.forEach(element => {
                    if(element['id'] == this.selectedFileShare['backendId']){
                        this.selectedFileShare['backend_type'] = element['type'];
                    }
                });
                this.allTypes = [];
                this.BucketService.getTypes().subscribe((res) => {
                    res.json().types.forEach(element => {
                    if( element.name=='aws-file' || element.name == 'azure-file' || element.name == 'gcp-file'){
                        this.allTypes.push({
                            label: Consts.CLOUD_TYPE_NAME[element.name],
                            value: element.name
                        })
                        if(this.selectedFileShare['backend_type'] == element.name){
                            this.selectType = Consts.CLOUD_TYPE_NAME[element.name];
                        }
                    }
                    });

                });
                this.enableEncryption = this.selectedFileShare['encrypted'] ? this.selectedFileShare['encrypted'] : false;

                this.showModifyForm = true;
                this.cloudFileShareModifyForm = this.fb.group({
                    'description': new FormControl(this.selectedFileShare['description'] ? this.selectedFileShare['description'] : '', {validators:[Validators.maxLength(250),Validators.pattern(this.validRule.description)]}),
                    'type': new FormControl('cloudFS')
                });
                if(this.selectedFileShare['backend_type'] == 'gcp-file'){
                    if(this.selectedFileShare['size']){
                        self.cloudFileShareModifyForm.addControl('size', this.fb.control((this.selectedFileShare['size'] / Math.pow(Consts.TO_GiB_CONVERTER, 3)), [Validators.required, Validators.min(1024)]));
                        self.cloudFileShareModifyForm.controls['size'].setValidators([Validators.required, Validators.min(1), Validators.max(16384)]);
                        self.cloudFileShareModifyForm.controls['size'].updateValueAndValidity();
                    }
                }

                if(this.selectedFileShare['backend_type'] == 'hw-file'){
                    if(this.selectedFileShare['size']){
                        self.cloudFileShareModifyForm.addControl('size', this.fb.control((this.selectedFileShare['size'] / Math.pow(Consts.TO_GiB_CONVERTER, 3)), [Validators.required, Validators.min(1)]));
                    }
                }

                if(this.selectedFileShare['size'] && this.selectedFileShare['backend_type'] == 'azure-file'){
                    self.cloudFileShareModifyForm.addControl('size', this.fb.control((this.selectedFileShare['size'] / Math.pow(Consts.TO_GiB_CONVERTER, 3)), Validators.required));
                }
                if(this.selectedFileShare['availabilityZone'] && this.selectedFileShare['backend_type'] == 'gcp-file'){
                    self.cloudFileShareModifyForm.addControl('availabilityZone', this.fb.control(this.selectedFileShare['availabilityZone']));
                }
                if(this.selectedFileShare['backend_type'] != 'hw-file' && this.selectedFileShare['tags'] && this.selectedFileShare['tags'].length){
                    _.each(this.selectedFileShare['tags'], function(item){
                       self.cloudFileShareModifyForm.addControl('tags', self.fb.array([self.createTags('','',item)]));
                   });
                }
                this.selectedFileShare['metadataArr'] = [];
                if(this.selectedFileShare['metadata']){
                    let meta = this.selectedFileShare['metadata']['fields'];
                    _.each(meta, function(value, key){
                        let metaitem = {};
                        if(key=="PerformanceMode"){
                            if(value['Kind'].hasOwnProperty('StringValue')){
                                metaitem = {
                                    key: "PerformanceMode",
                                    value : value['Kind']['StringValue'],
                                    type : 'string'
                                }
                            }
                            if(value['Kind'].hasOwnProperty('NumberValue')){
                                metaitem = {
                                    key: "PerformanceMode",
                                    value : value['Kind']['NumberValue'],
                                    type : 'number'
                                }
                            }
                            self.selectedFileShare['metadataArr'].push(metaitem);
                        }
                        if(key=="ThroughputMode"){
                            if(value['Kind'].hasOwnProperty('StringValue')){
                                metaitem = {
                                    key : "ThroughputMode",
                                    value : value['Kind']['StringValue'],
                                    type : 'string'
                                }
                            }
                            if(value['Kind'].hasOwnProperty('NumberValue')){
                                metaitem = {
                                    key: "ThroughputMode",
                                    value : value['Kind']['NumberValue'],
                                    type : 'number'
                                }
                            }
                            self.selectedFileShare['metadataArr'].push(metaitem);
                        }
                        if(key=="ProvisionedThroughputInMibps"){
                            if(value['Kind'].hasOwnProperty('StringValue')){
                                metaitem = {
                                    key : "ProvisionedThroughputInMibps",
                                    value : value['Kind']['StringValue'],
                                    type : 'string'
                                }
                            }
                            if(value['Kind'].hasOwnProperty('NumberValue')){
                                metaitem = {
                                    key: "ProvisionedThroughputInMibps",
                                    value : value['Kind']['NumberValue'],
                                    type : 'number'
                                }
                            }
                            self.selectedFileShare['metadataArr'].push(metaitem);
                        }
                        if(key=="Tier"){
                            if(value['Kind'].hasOwnProperty('StringValue')){
                                metaitem = {
                                    key : "Tier",
                                    value : value['Kind']['StringValue'],
                                    type : 'string'
                                }
                            }
                            if(value['Kind'].hasOwnProperty('NumberValue')){
                                metaitem = {
                                    key: "Tier",
                                    value : value['Kind']['NumberValue'],
                                    type : 'number'
                                }
                            }
                            self.selectedFileShare['metadataArr'].push(metaitem);
                        }

                    })
                }
                if(this.selectedFileShare['metadataArr'] && this.selectedFileShare['metadataArr'].length){

                   self.cloudFileShareModifyForm.addControl('metadata', self.fb.array([self.createMetadata('','',this.selectedFileShare['metadataArr'][0])]));
                   this.selectedFileShare['metadataArr'].slice(1).forEach(element => {
                        (this.cloudFileShareModifyForm.controls['metadata'] as FormArray).push(self.createMetadata('','',element));
                   });
                } else if(this.selectedFileShare['backend_type'] == 'azure-file' || this.selectedFileShare['backend_type'] == 'gcp-file'){
                    this.cloudFileShareModifyForm.addControl('metadata', this.fb.array([this.createMetadata()]));
                }
            });

        }, (error) => {
            console.log("Something went wrong. Could not fetch fileshare.")
        })

    }

    getFileShareById(fileShareId){
        this.cloudFS.getFileShareById(fileShareId).subscribe((res) => {
            this.selectedFileShare = res.json();
        }, (error) => {
            console.log("Something went wrong. Could not fetch fileshare.")
        })
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
        (this.cloudFileShareModifyForm.controls['tags'] as FormArray).push(this.createTags((key ? key : ''), (value ? value : '')))
    }
    removeTagLink(i: number) {
        if(this.cloudFileShareModifyForm.get('tags')['length'] > 1){
            this.cloudFileShareModifyForm.get('tags')['removeAt'](i);
        }
    }

    createMetadata(key?, value?, metaObj?){
        if(metaObj){
            return this.fb.group({
                key: new FormControl(metaObj.key),
                value: new FormControl(metaObj.value),
              })
        } else{
            return this.fb.group({
                key: new FormControl(key ? key : ''),
                value: new FormControl(value ? value : '')
            })
        }

    }

    addNextMetadata(key?, value?) {
        (this.cloudFileShareModifyForm.controls['metadata'] as FormArray).push(this.createMetadata((key ? key : ''), (value ? value : '')))
    }
    removeMetadataLink(i: number) {
        if(this.cloudFileShareModifyForm.get('metadata')['length'] > 1){
            this.cloudFileShareModifyForm.get('metadata')['removeAt'](i);
        }
    }

    getFileShareDataArray(value){

        let dataArr = {
            description: value['description'] ? value['description'] : '',
            type: value['type']
        }
        if(value['metadata']){
            let meta = {};
            dataArr['metadata'] = [];
            value['metadata'].forEach(element => {
                if(element['key']=="ProvisionedThroughputInMibps"){
                    meta[element['key']] = parseInt(element['value']);
                } else if(element['key']){
                    meta[element['key']] = element['value'];
                }
                if(!_.isEmpty(meta)){
                    dataArr['metadata'] = meta;
                } else{
                    delete dataArr['metadata'];
                }
            });
        }
        if(value['availabilityZone']){
            dataArr['availabilityZone'] = value['availabilityZone'];
        }
        if(value['size']){
            dataArr['size'] = parseInt(value['size']) * Consts.FROM_GiB_CONVERTER;
        }
        if(value['tags']){
            dataArr['tags'] = value['tags'];
        }
        return dataArr;
    }
    onSubmit(value){
        if(!this.cloudFileShareModifyForm.valid){
            for(let i in this.cloudFileShareModifyForm.controls){
                this.cloudFileShareModifyForm.controls[i].markAsTouched();
            }
            return;
        }
        let dataArr = this.getFileShareDataArray(value);
        this.cloudFS.updateFileShare(this.selectedFileShare['id'], dataArr).subscribe((res)=>{
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: 'File share has been modified successfully.'});
            let queryParams = {
                "message": JSON.stringify({severity: 'success', summary: 'Success', detail: 'File share has been modified successfully.'})
            };
            this.router.navigate(['/block',"fromCloudFileShare"], {queryParams: queryParams});
        }, (error) =>{
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: "Error", detail:"Something went wrong. File share could not be modified."});
            console.log("Something went wrong. File share could not be modified.", error);
        })
    }
}
