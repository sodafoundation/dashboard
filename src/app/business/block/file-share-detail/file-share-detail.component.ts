import { Router,ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener, Input } from '@angular/core';
import { I18NService, MsgBoxService, HttpService, Utils } from 'app/shared/api';
import { ConfirmationService, ConfirmDialogModule} from '../../../components/common/api';
import { trigger, state, style, transition, animate} from '@angular/animations';
import { I18nPluralPipe } from '@angular/common';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { Http } from '@angular/http';
import { FileShareService, SnapshotService ,FileShareAclService } from '../fileShare.service';
import { ProfileService } from '../../profile/profile.service';

let _ = require("underscore");
@Component({
    selector: 'app-file-share-detail',
    templateUrl: './file-share-detail.component.html',
    styleUrls: [],
    providers: [ConfirmationService, MsgBoxService]
})
export class FileShareDetailComponent implements OnInit{
    items;
    fromFileShareId;
    label;
    fileShare;
    snapshotCreateShow: boolean = false;
    snapshotModifyShow: boolean = false;
    fromSnapshot: boolean = false;
    fromAcls: boolean = false;
    aclCreateShow: boolean = false;
    aclModifyShow: boolean = false;
    selectedSnapshots = [];
    selectedSnapshotObj = {
        name: "",
        description: ""
    };
    selectedAcls = [];
    modifyAcl = {
        id: "",
        accessCapability: "",
        type: "",
        accessTo: ""
    };
    param = {
        key: 'fileShareId',
        value: null
    };
    snapshots;
    acls =[];
    createSnapshotFormGroup;
    modifySnapshotFormGroup;
    createAclsFormGroup;
    modifyAclsFormGroup;
    availabilityAclLevel;
    availabilityip;
    AclsItems = [0];
    profiles;
    showCreateSnapshot = true;
    aclfilter;
    errorMessage = {
        "level": { required: "Access Level is required." },
        "user": { required: "Ip/User is required." },
        "name":{ required: "Name is required." },
        "userInput":{required: "Ip/User is required"},
        "accessCapability": { required: "Access Level is required." },
    }
    
    constructor(
        private ActivatedRoute: ActivatedRoute,
        public i18n:I18NService,
        private confirmationService: ConfirmationService,
        private http: HttpService,
        private fb: FormBuilder,
        private msg: MsgBoxService,
        private FileShareService: FileShareService,
        private ProfileService: ProfileService,
        private SnapshotService: SnapshotService,
        private FileShareAclService: FileShareAclService
    ){}
    ngOnInit(){
        this.ActivatedRoute.params.subscribe((params) => {
            this.fromFileShareId = params.fileShareId;
            this.fromSnapshot = params.fromRoute === "fromSnapshot";
            this.fromAcls = params.fromRoute === "fromAcls";
        });

        this.label= {
            Name: this.i18n.keyID["sds_block_volume_name"] + ":",
            Profile: this.i18n.keyID["sds_block_volume_profile"] + ":",
            Status: this.i18n.keyID["sds_block_volume_status"] + ":",
            Description: this.i18n.keyID['sds_block_volume_descri'] + ":",
            Capacity: this.i18n.keyID["sds_home_capacity"] + ":",
            CreatedAt: this.i18n.keyID["sds_block_volume_createat"] + ":",
            AZ: this.i18n.keyID["sds_block_volume_az"] + ":",
            aclLevel: this.i18n.keyID['sds_fileShare_acl_level'],
            user: this.i18n.keyID['sds_fileShare_acl_user']
        }
        this.items = [
            { label: this.i18n.keyID["sds_fileShare_title"], url: '/block' },
            { label: this.i18n.keyID["sds_fileShare_detail"], url: '/fileShareDetail' }
        ];

        this.createSnapshotFormGroup = this.fb.group({
            "name": ["", Validators.required],
            "description": ["", Validators.maxLength(200)]
        })
        this.modifySnapshotFormGroup = this.fb.group({
            "name": ["", Validators.required],
            "description": ["", Validators.maxLength(200)]
        })
        this.createAclsFormGroup = this.fb.group({
            "level":  ["", Validators.required],
            "user0":  ["ip", Validators.required],
            "userInput0": ["", Validators.required]
        })

        this.availabilityAclLevel =[
            {label: "Read", value: "Read"},
            {label: "Write", value: "Write"},
            {label: "Execute", value: "Execute"}
        ]
        this.availabilityip =[
            {label: "ip", value: "ip"},
            {label: "user", value: "user"}
        ]
        this.param = {
            key: 'fileShareId',
            value: this.fromFileShareId 
        };
        this.getProfile();
        this.getAcls(this.fromFileShareId)
    }
    getProfile(){
        this.ProfileService.getProfiles().subscribe((res) => {
            this.profiles = res.json();

            this.getFileShareDetail(this.fromFileShareId);
        });
    }
    getFileShareDetail(id){
        this.FileShareService.getFileShareDetail(id).subscribe((res)=>{
            this.fileShare = res.json();
            let _profile = this.profiles.filter(profile=>{
                return this.fileShare.profileId == profile.id;
            })[0];
            this.fileShare.profileName = _profile != undefined ? _profile.name: '--';
            this.fileShare.size = Utils.getDisplayGBCapacity(res.json().size);
            // this.getSnapshots(this.fromFileShareId);
        })
    }
    getAclsDataArray(value){
        let dataArr = [];
        this.AclsItems.forEach(index=>{
            dataArr.push({
                accessCapability: (()=>{
                    let level = value['level'];
                    level.forEach((item,index)=>{
                        if(item == "Read"){
                            level[index] = "r";
                        }else if(item == "Write"){
                            level[index] = "w";
                        }else if (item == "Execute"){
                            level[index] = "x";
                        }
                    })
                    return level;
                })(),
                type: value['user'+index],
                accessTo: (()=>{
                    let acls = [];
                    acls.push(value['userInput'+index]);
                    return acls;
                })()
            })
        })
        return dataArr;
    }
    deleteAclUsers(index){
        this.AclsItems.splice(index, 1);
        this.createAclsFormGroup.removeControl('user'+index);
        this.createAclsFormGroup.removeControl('userInput'+index);
    }
    addTransRules(){
        this.AclsItems.push(
            this.AclsItems[this.AclsItems.length-1] + 1
          );
          this.AclsItems.forEach(index => {
            if(index !== 0){
              this.createAclsFormGroup.addControl('user'+index, this.fb.control("", Validators.required));
              this.createAclsFormGroup.addControl('userInput'+index, this.fb.control("", Validators.required));
            }
        });
    }

    getSnapshots(fileShareId){
        let snapshotId = "14775653-c11c-4b85-90ed-56e4da0d4c62";
        this.SnapshotService.getSnapshot(snapshotId).subscribe((res)=>{
            res.json();
        })
    }
    getAcls(fromFileShareId){
        let param = {
            fileshareid: fromFileShareId
        }
        this.FileShareAclService.getFileShareAcl(param).subscribe((res)=>{
            let str = res.json();
            this.acls =[];
            str.forEach(item=>{
                if(item.fileshareId == this.fromFileShareId){
                    let acl = {
                        id: item.id,
                        name: item.AccessTo,
                        type: item.type,
                        level: (()=>{
                            let acl = item.AccessCapability;
                            acl.forEach((item,index)=>{
                                if(item == "r"){
                                    acl[index] = "Read";
                                }else if(item == "w"){
                                    acl[index] = "Write";
                                }else if(item == "x"){
                                    acl[index] = "Execute";
                                }
                            })
                            return acl;
                        })(),
                        createdAt: Utils.formatDate(item.createdAt),
                        updatedAt: Utils.formatDate(item.updatedAt)
                    }
                    this.acls.push(acl);
                }
            })
        })
    }
    showSnapshotPropertyDialog(dialog, selectedSnapshot){
        if(dialog == 'create'){
            this.snapshotCreateShow = true;
        }else if(dialog == 'modify'){
            this.snapshotModifyShow = true;
            this.selectedSnapshotObj.name  = selectedSnapshot.name;
            this.selectedSnapshotObj.description = selectedSnapshot.description;
            this.selectedSnapshotObj['id'] = selectedSnapshot.id;
        }
    }
    showAclPropertyDialog(dialog, acl?){
        if(dialog == 'create'){
            this.aclCreateShow = true;
        }else if(dialog == 'modify'){
            this.aclModifyShow = true;
            this.modifyAcl.accessCapability = acl.level;
            this.modifyAcl.type = acl.type;
            this.modifyAcl.accessTo = acl.name[0];
            this.modifyAcl.id = acl.id;
            this.modifyAclsFormGroup = this.fb.group({
                "accessCapability": [this.modifyAcl.accessCapability, Validators.required],
                "type": [this.modifyAcl.type, Validators.required],
                "accessTo": [this.modifyAcl.accessTo, Validators.required]
            })
        }
    }
    batchDelete(dialog, param) {
        if (param) {
            let  msg, arr = [];
            if(_.isArray(param)){
                param.forEach((item,index)=> {
                    arr.push(item.id);
                })
                if(dialog == 'snapshot'){
                    msg = "<div>Are you sure you want to delete the selected Snapshots?</div><h3>[ "+ param.length +" Snapshots ]</h3>";
                }else if(dialog == 'acls'){
                    msg = "<div>Are you sure you want to delete the selected Access?</div><h3>[ "+ param.length +" Snapshots ]</h3>";
                }
            }else{
                arr.push(param.id);
                if(dialog == 'snapshot'){
                    msg = "<div>Are you sure you want to delete the Snapshot?</div><h3>[ "+ param.name +" ]</h3>";
                }else if(dialog == 'acls'){
                    msg = "<div>Are you sure you want to delete the Access?</div><h3>[ "+ param.name +" ]</h3>";
                }
            }
    
            this.confirmationService.confirm({
                message: msg,
                header: (()=>{
                    if(dialog =='snapshot'){
                        return this.i18n.keyID['sds_block_volume_del_sna']
                    }else if(dialog == 'acls'){
                        return this.i18n.keyID['sds_fileShare_delete_acl']
                    }
                })(),
                acceptLabel: this.i18n.keyID['sds_block_volume_delete'],
                isWarning: true,
                accept: ()=>{
                    if(dialog =='snapshot'){
                        arr.forEach(item => {
                            this.deleteSnapshot(item);
                        });
                    }else if(dialog == 'acls'){
                        arr.forEach(item => {
                            this.deleteAcls(item);
                        });
                    }
                },
                reject:()=>{}
            })
        }
    }
    deleteSnapshot(id){
        this.SnapshotService.deleteSnapshot(id).subscribe((res)=>{
            this.getSnapshots(this.fromFileShareId);
            this.showCreateSnapshot = true;
        })
    }
    deleteAcls(aclId){
        this.FileShareAclService.deleteFileShareAcl(aclId).subscribe((res)=>{
            this.getAcls(this.fromFileShareId);
        })
    }
    createSnapshot(){
        // validate
        if(!this.createSnapshotFormGroup.valid){
            for(let i in this.createSnapshotFormGroup.controls){
                this.createSnapshotFormGroup.controls[i].markAsTouched();
            }
            return
        }
        let value = this.createSnapshotFormGroup.value;
        value.shareId = this.fromFileShareId;
        this.SnapshotService.createSnapshot(value).subscribe((res)=>{
            this.snapshotCreateShow = false;
            this.getSnapshots(this.fromFileShareId);
            this.showCreateSnapshot = false;
        })
    }
    modifySnapshot(){
        // validate
        if(!this.modifySnapshotFormGroup.valid){
            for(let i in this.modifySnapshotFormGroup.controls){
                this.modifySnapshotFormGroup.controls[i].markAsTouched();
            }
            return
        }
        //modify snapshot 
        let value = this.modifySnapshotFormGroup.value;
        this.SnapshotService.updateSnapshot(this.selectedSnapshotObj['id'],value).subscribe((res)=>{
            this.snapshotModifyShow = false;
            this.getSnapshots(this.fromFileShareId);
        })
    }
    createAclsSubmit(value){
        // if(!this.createAclsFormGroup.valid){
        //     for(let i in this.createAclsFormGroup.controls){
        //         this.createAclsFormGroup.controls[i].markAsTouched();
        //     }
        //     return;
        // }
        let dataArr = this.getAclsDataArray(value);
        for(let i in dataArr){
            this.aclsCreateSubmit(dataArr[i]);
        }
    }
    modifyAclsSubmit(value){
        if(!this.modifyAclsFormGroup.valid){
            for(let i in this.modifyAclsFormGroup.controls){
                this.modifyAclsFormGroup.controls[i].markAsTouched();
            }
            return;
        }
        this.aclsModifySubmit(value);
    }
    aclsCreateSubmit(param){
        param['fileshareId'] = this.fromFileShareId;
        this.FileShareAclService.createFileShareAcl(param,this.fromFileShareId).subscribe((res)=>{
            this.getAcls(this.fromFileShareId);
            this.aclCreateShow = false;
        })
    }
    aclsModifySubmit(param){
        this.FileShareAclService.updateFileShareAcl(this.modifyAcl.id,param).subscribe((res)=>{
            this.getAcls(this.fromFileShareId);
            this.aclModifyShow = false;
        })
    }
}