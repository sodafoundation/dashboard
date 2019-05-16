import { Router,ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener, Input } from '@angular/core';
import { I18NService, MsgBoxService, HttpService, Utils } from 'app/shared/api';
import { ConfirmationService, ConfirmDialogModule} from '../../components/common/api';
import { trigger, state, style, transition, animate} from '@angular/animations';
import { I18nPluralPipe } from '@angular/common';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { Http } from '@angular/http';
import { FileShareService, SnapshotService } from './fileShare.service';
import { ProfileService } from './../profile/profile.service';

let _ = require("underscore");
@Component({
    selector: 'app-file-share',
    templateUrl: './fileShare.component.html',
    styleUrls: [],
    providers: [ConfirmationService, MsgBoxService]
})
export class FileShareComponent implements OnInit{
    selectedFileShares = [];
    createSnapshotShow = false;
    modifyFileShareShow = false;
    createSnapshotForm;
    errorMessage = {"name":  {required: "Name is required." } };
    selectedFileShare;
    modifyFileShareForm;
    fileShares = [];
    profiles = [];
    showCreateSnapshot = true;
    
    constructor(
        private ActivatedRoute: ActivatedRoute,
        public I18N:I18NService,
        private http: HttpService,
        private fb: FormBuilder,
        private msg: MsgBoxService,
        private FileShareService: FileShareService,
        private ProfileService: ProfileService,
        private SnapshotService: SnapshotService,
        private confirmationService: ConfirmationService
    ){
        this.createSnapshotForm = this.fb.group({
            "name": ["",Validators.required],
            "descript": ["", Validators.maxLength(200)]
        })
    }
    ngOnInit(){
        
        this.getProfile();
    }
    getFileShares(){
        this.FileShareService.getFileShare().subscribe((res)=>{
            this.fileShares = res.json();
            this.fileShares.map(item=>{
                let _profile = this.profiles.filter(profile=>{
                    return profile.id == item.profileId;
                })[0];
                item['profileName'] = _profile != undefined ? _profile.name : '--';
                item.size = Utils.getDisplayGBCapacity(item.size);
            })
        })
    }
    getProfile(){
        this.ProfileService.getProfiles().subscribe((res) => {
            this.profiles = res.json();

            this.getFileShares();
        });
    }
    returnSelectedFileShare(selectedFileShare, dialog){
        if(dialog == 'snapshot'){
            this.createSnapshotShow = true;
        }else if(dialog == 'Modify'){
            this.modifyFileShareShow = true;
            this.modifyFileShareForm = this.fb.group({
                "name": [selectedFileShare.name],
                "descript": ["", Validators.maxLength(200)]
            })
        }
        this.selectedFileShare = selectedFileShare;
    }
    modifyFileShare(value){
        let dataArr = value;
        this.FileShareService.updateFileShare(this.selectedFileShare.id,dataArr).subscribe((res)=>{
            this.getFileShares();
            this.modifyFileShareShow = false;
        })
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
        this.FileShareService.deleteFileShare(fileShare).subscribe(res=>{
            this.getFileShares();
        })
    }
    createSnapshot(){
        if(!this.createSnapshotForm.valid){
            for(let i in this.createSnapshotForm.controls){
                this.createSnapshotForm.controls[i].markAsTouched();
            }
            return;
        }
        let value = this.createSnapshotForm.value;
        value.fileshareId = this.selectedFileShare.id;
        
        this.SnapshotService.createSnapshot(value).subscribe((res)=>{
            this.createSnapshotShow = false;
            this.getProfile();
            this.showCreateSnapshot = false;
        })
    }
}