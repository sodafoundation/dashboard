import { Router,ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener, Input } from '@angular/core';
import { I18NService, MsgBoxService, HttpService, Utils } from 'app/shared/api';
import { ConfirmationService, ConfirmDialogModule, MenuItem, Message} from '../../../components/common/api';
import { trigger, state, style, transition, animate} from '@angular/animations';
import { I18nPluralPipe } from '@angular/common';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { CloudFileShareService} from './cloud-file-share.service';
import { BucketService } from '../buckets.service';

let _ = require("underscore");
@Component({
    selector: 'app-cloud-file-share',
    templateUrl: './cloud-file-share.component.html',
    styleUrls: [],
    providers: [ConfirmationService, MsgBoxService ]
})
export class CloudFileShareComponent implements OnInit{
    allFileShares: any = [];
    allBackends: any = [];
    allAWSFileShares: any = [];
    allAzureFileShares: any = [];
    selectedBackends = [];
    selectedFileShares = [];
    selectedFileShare: any;
    msgs: Message[];
    menuItems: MenuItem[];
    menuDeleDisableItems : MenuItem[];
    fileShareTags: any = [];
    label = {
        name: "Name",
        description: "Description",
        backend: "Backend",
        createdAt: "Created At",
        updatedAt: "Updated At",
        region: "Region",
        status: "Status",
        availabilityZone: "Availability Zone",
        tags: "Tags",
        metadata: "Metadata",
        size: "Size"
    };

    constructor(private cloudFS: CloudFileShareService,
        private router: Router,
        private ActivatedRoute: ActivatedRoute,
        public I18N:I18NService,
        private http: HttpService,
        private fb: FormBuilder,
        private msg: MsgBoxService,
        private confirmationService: ConfirmationService,
        private bucketService: BucketService)
        {
            this.msgs = [];
            this.ActivatedRoute.queryParamMap.subscribe(params => {
                let message = params.get('message');
                if(message){
                    this.msgs.push(JSON.parse(message));
                }
            });
        }

    ngOnInit(){
        this.getBackends();
        this.getFileShares();
        this.menuDeleDisableItems = [
            {
                "label": this.I18N.keyID['sds_block_volume_modify'],
                command: () => {
                    this.modifyFileshare(this.selectedFileShare['id']);
                },
                disabled:false
            },
            {
                "label": this.I18N.keyID['sds_block_volume_delete'],
                command: () => {
                    this.batchDelete(this.selectedFileShare);
                },
                disabled:false
            }
        ];
        this.menuItems = [
            {
                "label": this.I18N.keyID['sds_block_volume_modify'],
                command: () => {
                    this.modifyFileshare(this.selectedFileShare['id']);
                },
                disabled:false
            },
            {
                "label": this.I18N.keyID['sds_block_volume_delete'],
                command: () => {
                    this.batchDelete(this.selectedFileShare);
                },
                disabled:false
            }

        ];
    }

    getBackends() {
        this.http.get('v1/{project_id}/backends').subscribe((res)=>{
            this.allBackends = res.json().backends ? res.json().backends :[];
            this.allBackends.forEach(element => {
                if(element.type == 'aws-file' || element.type == 'azure-file' || element.type == 'gcp-file'|| element.type == 'hw-file'){
                    this.selectedBackends.push(element);
                }
            });
        });
    }

    getFileShares(){
        let self = this;
        this.cloudFS.getAllFileShares().subscribe((res) => {
            let shares = res.json() && res.json().fileshares ? res.json().fileshares : [];
            this.allFileShares = shares;

            if(this.allFileShares.length){
                this.allFileShares.forEach(element => {
                    if(!element['tags']){
                        element['tags'] = [];
                    }
                    if(element['size']){
                        let display = Utils.formatBytes(element['size']);
                        element['displaySize'] = display;
                    }
                    let metadataArr = [];
                    if(element['metadata']){
                        let meta = element['metadata']['fields'];
                        _.each(meta, function(value, key){
                            let metaitem = {};
                            metaitem['key'] = key;
                            if(value['Kind'].hasOwnProperty('StringValue')){
                                metaitem['value'] = value['Kind']['StringValue'];
                                metaitem['type'] = 'string';
                            } else if(value['Kind'].hasOwnProperty('NumberValue')){
                                metaitem['value'] = value['Kind']['NumberValue'];
                                metaitem['type'] = 'number';
                            }

                            metadataArr.push(metaitem);

                        })
                        element['metadataArr'] = metadataArr;
                    }

                });
            }
        }, (error) => {
            console.log("Something went wrong. Error fetching file shares", error);
        })
    }

    createFileShare(){

    }
    modifyFileshare(fileShare){
        this.router.navigate(['/modifyCloudFileShare',fileShare]);
    }
    returnSelectedFileShare(selectedFileShare){
        this.selectedFileShare = selectedFileShare;
    }

    batchDelete(fileShare){
        if(fileShare){
            let  msg, arr = [], selectedNames=[];
            if(_.isArray(fileShare)){
                fileShare.forEach((item,index)=> {
                    arr.push(item.id);
                    selectedNames.push(item['name']);
                })
                msg = "<h3>Are you sure you want to delete the selected " + fileShare.length + " FileShares?</h3><h4>[ "+ selectedNames.join(',') +" FileShare(s) ]</h4>";
            }else{
                arr.push(fileShare.id)
                msg = "<h3>Are you sure you want to delete the selected FileShare?</h3><h4>[ "+ fileShare.name +" ]</h4>";
            }
            this.confirmationService.confirm({
                message: msg,
                header: this.I18N.keyID['sds_fileShare_delete'],
                acceptLabel: this.I18N.keyID['sds_block_volume_delete'],
                isWarning: true,
                accept: ()=>{
                    arr.forEach((item,index)=> {
                        this.deleteFileShare(item)
                    })
                },
                reject:()=>{}
            })
        }
    }
    deleteFileShare(fileShare){

        this.cloudFS.deleteFileShare(fileShare).subscribe(res=>{
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: 'Fileshare deleted successfully.'});
            this.getFileShares();
        }, (error)=>{
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: 'Error', detail: 'Error deleting Fileshare'});
        });
    }
}
