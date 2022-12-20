import { Router,ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener, Input } from '@angular/core';
import { I18NService, Consts, MsgBoxService, HttpService, Utils } from 'app/shared/api';
import { ConfirmationService, ConfirmDialogModule, MenuItem, Message} from '../../../components/common/api';
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
    
    label = {
        id : "ID",
        name: "Name",
        description: "Description",
        tenantId: "Tenant ID",
        userId: "User ID",
        backendID: "Backend ID",
        backend: "Backend",
        backendType: "Backend Type",
        volumeId: "Volume ID",
        size: "Size",
        type: "Volume Type",
        status: "Status",
        region : "Region",
        availabilityZone: "Availability Zone",
        createdAt: "Created At",
        updatedAt: "Updated At",
        iops: "IOPS",
        tags: "Tags",
        metadata: "Metadata"
    };
   

    constructor(private cloudBS: CloudBlockServiceService,
        private router: Router,
        private ActivatedRoute: ActivatedRoute,
        public I18N:I18NService,
        private http: HttpService,
        private msg: MsgBoxService,
        private confirmationService: ConfirmationService,
        private BucketService: BucketService
        ){
            
            this.msgs = [];
            this.ActivatedRoute.queryParamMap.subscribe(params => {
                let message = params.get('message');
                if(message){
                    this.msgs.push(JSON.parse(message));
                }
            });
        }

    ngOnInit(){
        
        this.volumeTypeOptions = this.volumeTypeOptions.concat(Consts.AWS_VOLUME_TYPES, Consts.HW_VOLUME_TYPES);
        this.getTypes();
        this.getBackends();
        
        this.menuItems = [
            {
                "label": "Modify",
                command: () => {
                    this.modifyVolume(this.selectedVolume);
                },
                disabled:false
            },
            {
                "label": this.I18N.keyID['sds_block_volume_delete'],
                command: () => {
                    this.batchDeleteVolumes(this.selectedVolume);
                },
                disabled:false
            }
        ];
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
    modifyVolume(volume){
        this.router.navigate(['/modifyCloudVolume', volume.id]);
    }

    getBackends() {
        this.http.get('v1/{project_id}/backends').subscribe((res)=>{
            this.allBackends = res.json().backends ? res.json().backends :[];
            this.allBackends.forEach(element => {
                if(element.type == 'aws-block' || element.type == 'hw-block'){
                    this.selectedBackends.push(element);
                }
            });
            if(this.selectedBackends && this.selectedBackends.length){
                this.backendId = this.selectedBackends[0]['id'];
                this.getVolumes(this.backendId);
            } else{
                this.allAWSVolumes = [];
            }
           
        });
    }

    getVolumes(backendId){
        let self = this;
        this.cloudBS.getAllVolumes().subscribe((res) => {
            let vols = res.json() && res.json().volumes ? res.json().volumes : [];
            this.allAWSVolumes = vols;
            
            this.allAWSVolumes.forEach(volElement => {
                if(volElement['size'] && volElement['size'] > 0){
                    volElement['displaySize'] = Utils.formatBytes([volElement['size']]);
                }
                this.volumeTypeOptions.forEach(typeEle => {
                    if(typeEle['value'] == volElement['type']){
                        volElement['volType'] = typeEle['label'];
                    }
                });

                if(!volElement['tags']){
                    volElement['tags'] = [];
                }
                // Parse the Metadata
                let metadataArr = [];
                if(volElement['metadata']){
                    let meta = volElement['metadata']['fields'];
                    _.each(meta, function(value, key){
                        let metaitem = {};
                        if(key=="CreationTimeAtBackend"){
                            if(value['Kind'].hasOwnProperty('StringValue')){
                                metaitem = {
                                    key: "CreationTimeAtBackend",
                                    value : value['Kind']['StringValue'],
                                    type : 'string'
                                }
                            }
                            if(value['Kind'].hasOwnProperty('NumberValue')){
                                metaitem = {
                                    key: "CreationTimeAtBackend", 
                                    value : value['Kind']['NumberValue'],
                                    type : 'number'
                                }
                            }
                            metadataArr.push(metaitem);
                        }
                        if(key=="VolumeId"){
                            if(value['Kind'].hasOwnProperty('StringValue')){
                                metaitem = {
                                    key : "VolumeId", 
                                    value : value['Kind']['StringValue'],
                                    type : 'string'
                                }
                            }
                            if(value['Kind'].hasOwnProperty('NumberValue')){
                                metaitem = {
                                    key: "VolumeId", 
                                    value : value['Kind']['NumberValue'],
                                    type : 'number'
                                }
                            }
                            metadataArr.push(metaitem);
                        }
                        
                    })
                    volElement['metadataArr'] = metadataArr;
                }
            });
        }, (error) => {
            this.allAWSVolumes = [];
            console.log("Something went wrong. Error fetching volumes", error);
        })
    }

    returnSelectedVolume(selectedVolume){
        this.selectedVolume = selectedVolume;
    }

    batchDeleteVolumes(volumes){
        if(volumes){
            let  msg, arr = [], selectedNames=[];
            if(_.isArray(volumes)){
                volumes.forEach((item,index)=> {
                    arr.push(item);
                    selectedNames.push(item['name']);
                })
                msg = "<h3>Are you sure you want to delete the selected " + volumes.length + " volume(s)?</h3><h4>[ "+ selectedNames.join(',') +" Volume(s) ]</h4>";
            }else{
                arr.push(volumes)
                msg = "<h3>Are you sure you want to delete the selected Volume?</h3><h4>[ "+ volumes.name +" ]</h4>"; 
            }
            this.confirmationService.confirm({
                message: msg,
                header: this.I18N.keyID['sds_common_delete'],
                acceptLabel: this.I18N.keyID['sds_block_volume_delete'],
                isWarning: true,
                accept: ()=>{
                    arr.forEach((item,index)=> {
                        this.deleteVolume(item)
                    })
                },
                reject:()=>{}
            })
        }
    }

    deleteVolume(volume){
        this.msgs = [];
        this.cloudBS.deleteVolume(volume.id).subscribe(res=>{
            this.msgs.push({severity: 'success', summary: 'Success', detail: 'Volume ' + volume.name  + ' deleted successfully.'});
            this.getBackends();
        }, (error)=>{
            this.msgs.push({severity: 'error', summary: 'Error', detail: 'Error deleting volume ' + volume.name + '.'});
            console.log("Something went wrong. Could not delete volume", error);
        });
    }
    
}