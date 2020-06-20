import { Router,ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener, Input } from '@angular/core';
import { I18NService, MsgBoxService, HttpService, Utils } from 'app/shared/api';
import { ConfirmationService, ConfirmDialogModule, MenuItem, Message} from '../../../components/common/api';
import { trigger, state, style, transition, animate} from '@angular/animations';
import { I18nPluralPipe } from '@angular/common';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { CloudFileShareService} from './cloudFileShare.service';
import { ProfileService } from '../../profile/profile.service';

let _ = require("underscore");
@Component({
    selector: 'app-cloud-file-share',
    templateUrl: './cloudFileShare.component.html',
    styleUrls: [],
    providers: [ConfirmationService, MsgBoxService ]
})
export class CloudFileShareComponent implements OnInit{
    allFileShares: any;
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
        tags: "Tags"
    };

    constructor(private cloudFS: CloudFileShareService,
        public I18N:I18NService,
        private http: HttpService,
        private fb: FormBuilder,
        private msg: MsgBoxService,
        private confirmationService: ConfirmationService)
        {}

    ngOnInit(){
        this.getFileShares();
        this.menuDeleDisableItems = [
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
                "label": this.I18N.keyID['sds_block_volume_delete'],
                command: () => {
                    this.batchDelete(this.selectedFileShare);
                },
                disabled:false
            }
        ];
    }

    getFileShares(){
        this.cloudFS.getAllFileShares().subscribe((res) => {

            let shares = res.json();
            if(_.isArray(shares)){
                this.allFileShares = shares;
            } else{
                this.allFileShares = [shares];
            }
            this.allFileShares.forEach(element => {
                if(!element['tags']){
                    element['tags'] = [];
                }
            });
        }, (error) => {
            console.log("Something went wrong. Error fetching file shares", error);
        })
    }
    
    createFileShare(){

    }
    returnSelectedFileShare(selectedFileShare){
        this.selectedFileShare = selectedFileShare;
    }

    batchDelete(fileShare){
        if(fileShare){
            let  msg, arr = [];
            if(_.isArray(fileShare)){
                fileShare.forEach((item,index)=> {
                    arr.push(item.id);
                })
                msg = "<div>Are you sure you want to delete the selected FileShare?</div><h3>[ "+ fileShare.length +" FileShare ]</h3>";
            }else{
                arr.push(fileShare.id)
                msg = "<div>Are you sure you want to delete the selected FileShare?</div><h3>[ "+ fileShare.name +" ]</h3>"; 
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
            this.msgs.push({severity: 'error', summary: 'Error', detail: 'Error deleting Fileshare' + error._body});
        });
    }
}