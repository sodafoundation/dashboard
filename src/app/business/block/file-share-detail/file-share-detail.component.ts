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
    snapshots = [];
    acls =[];
    createSnapshotFormGroup;
    modifySnapshotFormGroup;
    createAclsFormGroup;
    modifyAclsFormGroup;
    availabilityAclLevel;
    availabilityip;
    aclsItems = [0];
    profiles;
    showCreateSnapshot = true;
    aclfilter;
    descriptBlock = false;
    exportBlock = false;
    errorMessage = {
        "level": { required: "Access Level is required." },
        "user": { required: "Ip/User is required." },
        "name":{ required: "Name is required." },
        "userInput":{required: "Ip is required"},
        "accessCapability": { required: "Access Level is required." },
        "accessTo": {required: "Access is required."}
    }
    Regexp = '(1\\d{2}|2[0-4]\\d|25[0-5]|[1-9]\\d|';
    validRule= {
        'name':'^' + this.Regexp + '[1-9])\\.' + this.Regexp + '\\d)\\.' + this.Regexp + '\\d)\\.' + this.Regexp +'\\d)(\\/([1-9]|[1-2]\\d|3[0-2]))?$' 
    };
    
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
            user: this.i18n.keyID['sds_fileShare_acl_user'],
            export: this.i18n.keyID['sds_fileShare_export'],
            updatedAt: this.i18n.keyID['sds_fileShare_update']
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
        this.availabilityAclLevel =[
            {label: "Read Only", value: "Read Only"},
            {label: "Read Write", value: "Read Write"}
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
        this.getAcls()
    }
    getCreateAclValue(){
        this.createAclsFormGroup = this.fb.group({
            "level":  ["", Validators.required],
            "user":  ["ip"],
            "userInput0": ["", {validators: [Validators.required,Validators.pattern(this.validRule.name)]}],
            "description": [""]
        })
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
            this.fileShare.createdAt = Utils.formatDate(res.json().createdAt);
            this.fileShare.updatedAt = Utils.formatDate(res.json().updatedAt);
            if(this.fileShare.exportLocations){
                this.fileShare.exportLocations[0] = "(" + this.fileShare.exportLocations[0] + ")";
            }
            if(this.fileShare.description && this.fileShare.description.length > 20){
                this.descriptBlock = true;
            }else{
                this.descriptBlock = false;
            }
            if(this.fileShare.exportLocations && this.fileShare.exportLocations[0] && this.fileShare.exportLocations[0].length > 20){
                this.exportBlock = true;
            }else{
                this.exportBlock = false;
            }
            this.getSnapshots(this.fromFileShareId);
        })
    }
    getAclsDataArray(value){
        let dataArr = [];
        this.aclsItems.forEach(index=>{
            dataArr.push({
                accessCapability: (()=>{
                    if(value['level'] == "Read Only"){
                        return ['Read'];
                    }else if(value['level'] == "Read Write"){
                        return ['Read','Write'];
                    }
                })(),
                type: "ip",
                accessTo: value['userInput'+index]
            })
        })
        return dataArr;
    }
    deleteAclUsers(index){
        this.aclsItems.splice(index, 1);
        this.createAclsFormGroup.removeControl('userInput'+index);
    }
    addTransRules(){
        this.aclsItems.push(
            this.aclsItems[this.aclsItems.length-1] + 1
          );
          this.aclsItems.forEach(index => {
            if(index !== 0){
            //   this.createAclsFormGroup.addControl('user'+index, this.fb.control("", Validators.required));
              this.createAclsFormGroup.addControl('userInput'+index, this.fb.control("", Validators.required));
            }
        });
    }

    getSnapshots(fileShareId){
        this.snapshots = [];
        this.SnapshotService.getSnapshot().subscribe((res)=>{
            let str = res.json();
            str.forEach(item=>{
                if(item.fileshareId == fileShareId){
                    item.createdAt = Utils.formatDate(item.createdAt);
                    this.snapshots.push(item); 
                }
            })
            this.selectedSnapshots = [];
        })
    }
    getAcls(){
        this.FileShareAclService.getFileShareAcl().subscribe((res)=>{
            let str = res.json();
            this.acls =[];
            str.forEach(item=>{
                if(item.fileshareId == this.fromFileShareId){
                    let acl = {
                        id: item.id,
                        name: item.accessTo,
                        type: item.type,
                        level: item.accessCapability,
                        createdAt: Utils.formatDate(item.createdAt),
                        updatedAt: Utils.formatDate(item.updatedAt)
                    }
                    this.acls.push(acl);
                }
            })
            this.selectedAcls = [];
        })
    }
    showSnapshotPropertyDialog(dialog, selectedSnapshot?){
        if(dialog == 'create'){
            this.snapshotCreateShow = true;
        }else if(dialog == 'modify'){
            this.snapshotModifyShow = true;
            this.modifySnapshotFormGroup.patchValue({name: selectedSnapshot.name});
            this.selectedSnapshotObj.name  = selectedSnapshot.name;
            this.selectedSnapshotObj.description = selectedSnapshot.description;
            this.selectedSnapshotObj['id'] = selectedSnapshot.id;
        }
    }
    showAclPropertyDialog(dialog, acl?){
        if(dialog == 'create'){
            this.aclCreateShow = true;
            this.getCreateAclValue();
            this.aclsItems = [0];
        }else if(dialog == 'modify'){
            this.aclModifyShow = true;
            this.modifyAcl.accessCapability = acl.level;
            this.modifyAcl.type = acl.type;
            this.modifyAcl.accessTo = acl.name;
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
                    msg = "<div>Are you sure you want to delete the selected Access?</div><h3>[ "+ param.length +" Access ]</h3>";
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
            this.getAcls();
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
        value.fileshareId = this.fromFileShareId;
        this.SnapshotService.createSnapshot(value).subscribe((res)=>{
            this.snapshotCreateShow = false;
            this.getSnapshots(this.fromFileShareId);
            this.showCreateSnapshot = true;
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
        if(!this.createAclsFormGroup.valid){
            for(let i in this.createAclsFormGroup.controls){
                this.createAclsFormGroup.controls[i].markAsTouched();
            }
            return;
        }
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
            this.getAcls();
            this.aclCreateShow = false;
        })
    }
    aclsModifySubmit(param){
        this.FileShareAclService.updateFileShareAcl(this.modifyAcl.id,param).subscribe((res)=>{
            this.getAcls();
            this.aclModifyShow = false;
        })
    }
    getErrorMessage(control,extraParam){
        let page = "", key;
        if(control.errors.pattern){
            key  = Utils.getErrorKey(control,extraParam);
        }else{
            key = Utils.getErrorKey(control,page);
        }
        return extraParam ? this.i18n.keyID[key].replace("{0}",extraParam):this.i18n.keyID[key];
    }
}