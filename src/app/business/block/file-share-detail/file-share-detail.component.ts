import { Router,ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener, Input } from '@angular/core';
import { I18NService, MsgBoxService, HttpService, Utils } from 'app/shared/api';
import { ConfirmationService, ConfirmDialogModule, Message} from '../../../components/common/api';
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
    nameBlock = false;
    checkSnapshotName = false;
    msgs: Message[];
    checkAclsIp = [];
    showIpErrorMessage = [];
    errorMessage = {
        "level": { required: "Access Level is required." },
        "user": { required: "Ip/User is required." },
        "name":{ required: "Name is required." ,
                 pattern: this.i18n.keyID['sds_pattern']},
        "description":{maxlength: this.i18n.keyID['sds_validate_max_length']},
        "userInput":{required: "Ip is required"},
        "accessCapability": { required: "Access Level is required." },
        "accessTo": {required: "Access is required."}
    }
    Regexp = '(1\\d{2}|2[0-4]\\d|25[0-5]|[1-9]\\d|';
    validRule= {
        'name':'^' + this.Regexp + '[1-9])\\.' + this.Regexp + '\\d)\\.' + this.Regexp + '\\d)\\.' + this.Regexp +'\\d)(\\/([1-9]|[1-2]\\d|3[0-2]))?$' 
    };
    snapshotValidRule = {
        'name':'^[a-zA-Z]{1}([a-zA-Z0-9]|[_]){0,127}$'
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
            "name": ["", {validators: [Validators.required,Validators.pattern(this.snapshotValidRule.name)]}],
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
            "description": ["", Validators.maxLength(200)]
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
            this.nameBlock = this.fileShare.name && (this.fileShare.name.length > 20);
            this.descriptBlock = this.fileShare.description && (this.fileShare.description.length > 20);
            this.exportBlock = this.fileShare.exportLocations && this.fileShare.exportLocations[0] && (this.fileShare.exportLocations[0].length > 20);
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
                accessTo: value['userInput'+index],
                description: value.description
            })
        })
        return dataArr;
    }

    getSnapshots(fileShareId){
        this.snapshots = [];
        this.SnapshotService.getSnapshot().subscribe((res)=>{
            let str = res.json();
            str.forEach(item=>{
                if(item.fileshareId == fileShareId){
                    item.createdAt = Utils.formatDate(item.createdAt);
                    item.date = new Date(Utils.formatDate(item.createdAt)).getTime();
                    item.description = (!item.description || item.description == '') ? '--' : item.description;
                    this.snapshots.push(item); 
                }
            })
            this.snapshots.sort((previous,later)=>{
                return later.date - previous.date;
            })
            this.selectedSnapshots = [];
        })
    }
    getAcls(dialog?){
        this.checkAclsIp = [];
        this.FileShareAclService.getFileShareAcl().subscribe((res)=>{
            let str = res.json();
            this.acls =[];
            str.forEach(item=>{
                if(item.fileshareId == this.fromFileShareId){
                    let acl = {
                        id: item.id,
                        name: item.accessTo,
                        type: item.type,
                        description: item.description? item.description: "--",
                        level: item.accessCapability,
                        createdAt: Utils.formatDate(item.createdAt),
                        updatedAt: Utils.formatDate(item.updatedAt),
                        date: new Date(Utils.formatDate(item.updatedAt)).getTime()
                    }
                    this.acls.push(acl);
                    if(dialog){
                        this.checkAclsIp.push(item.accessTo);
                    }
                }
            })
            this.acls.sort((previous,later)=>{
                return later.date - previous.date;
            })
            this.selectedAcls = [];
        })
    }
    userIpChange(index){
        let userInput = this.createAclsFormGroup.value['userInput'+index];
        if((this.checkAclsIp.indexOf(userInput) !=-1)){
            this.showIpErrorMessage[index] = true;
        }else{
            this.showIpErrorMessage[index] = false;
        }
    }
    showSnapshotPropertyDialog(dialog, selectedSnapshot?){
        if(dialog == 'create'){
            this.snapshotCreateShow = true;
            this.createSnapshotFormGroup.reset({
                name: "",
                description: ""
            });
            this.getSnapshotNameCheck(this.createSnapshotFormGroup);
        }else if(dialog == 'modify'){
            this.snapshotModifyShow = true;
            this.modifySnapshotFormGroup.patchValue({name: selectedSnapshot.name});
            this.selectedSnapshotObj.name  = selectedSnapshot.name;
            this.selectedSnapshotObj.description = selectedSnapshot.description != "--"? selectedSnapshot.description : "";
            this.selectedSnapshotObj['id'] = selectedSnapshot.id;
            this.getSnapshotNameCheck(this.modifySnapshotFormGroup);
        }
    };
    getSnapshotNameCheck(group){
        this.checkSnapshotName = false; 
        group.get("name").valueChanges.subscribe((value: string)=>{
            let defaultLength = "snapshot".length;
            if( value && value.length >= defaultLength){
                let sub = value.substr(0,8);
                if(sub == "snapshot"){
                    this.checkSnapshotName = true;
                }else{
                    this.checkSnapshotName = false;
                }
            }else{
                this.checkSnapshotName = false;
            }
        })
    }
    showAclPropertyDialog(dialog, acl?){
        if(dialog == 'create'){
            this.aclCreateShow = true;
            this.getCreateAclValue();
            this.aclsItems = [0];
            this.getAcls(dialog);
            this.showIpErrorMessage = [false];
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
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: "Fileshare snapshot will be deleted shorty."});
        }, (err)=>{
            this.msgs = [];
            this.showCreateSnapshot = true;
            this.msgs.push({severity: 'error', summary: 'Error', detail: err.message ? err.message : err.json().message});
        })
    }
    deleteAcls(aclId){
        this.FileShareAclService.deleteFileShareAcl(aclId).subscribe((res)=>{
            this.getAcls();
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: "Fileshare ACL will be deleted shorty."});
        }, (err)=>{
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: 'Error', detail: err.message ? err.message : err.json().message});
        })
    }
    createSnapshot(){
        // validate
        if(!this.createSnapshotFormGroup.valid || this.checkSnapshotName){
            for(let i in this.createSnapshotFormGroup.controls){
                this.createSnapshotFormGroup.controls[i].markAsTouched();
            }
            return
        }
        let value = this.createSnapshotFormGroup.value;
        value.fileshareId = this.fromFileShareId;
        value.description = value.description != "" ? value.description: "-";
        this.SnapshotService.createSnapshot(value).subscribe((res)=>{
            this.snapshotCreateShow = false;
            this.getSnapshots(this.fromFileShareId);
            this.showCreateSnapshot = true;
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: "Fileshare snapshot created successfully."});
        },
        err=>{
          this.msgs = [];
          this.snapshotCreateShow = false;
          this.msgs.push({severity: 'error', summary: 'Error', detail: err.message ? err.message : err.json().message});
        })
    }
    modifySnapshot(){
        // validate
        if(!this.modifySnapshotFormGroup.valid || this.checkSnapshotName){
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
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: "Fileshare snapshot updated successfully."});
        }, (err)=>{
            this.snapshotModifyShow = false;
            this.msgs.push({severity: 'error', summary: 'Error', detail: err.message ? err.message : err.json().message});
        })
    }
    createAclsSubmit(value){
        if(!this.createAclsFormGroup.valid || (this.showIpErrorMessage.indexOf(true) !=-1)){
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
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: "Fileshare ACL created successfully."});
        },
        err=>{
          this.msgs = [];
          this.aclCreateShow = false;
          this.msgs.push({severity: 'error', summary: 'Error', detail: err.message ? err.message : err.json().message});
        })
    }
    aclsModifySubmit(param){
        this.FileShareAclService.updateFileShareAcl(this.modifyAcl.id,param).subscribe((res)=>{
            this.getAcls();
            this.aclModifyShow = false;
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: "Fileshare ACL updated successfully."});
        }, (err) =>{
            this.aclModifyShow = false;
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: 'Error', detail: err.message ? err.message : err.json().message});
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