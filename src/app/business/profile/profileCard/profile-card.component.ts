import { Router } from '@angular/router';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { I18NService, MsgBoxService, Utils ,ParamStorService } from 'app/shared/api';
import { AppService } from 'app/app.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { I18nPluralPipe } from '@angular/common';
import { HttpService } from './../../../shared/api';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { ClipboardService } from 'ngx-clipboard';
import { ButtonModule ,ConfirmationService, Message} from './../../../components/common/api';
import { ProfileService } from './../profile.service';

// import {CardModule} from 'primeng/card';
let lodash = require('lodash');
@Component({
    selector: 'profile-card',
    templateUrl: './profile-card.component.html',
    styleUrls: [

    ],
    animations: [
        trigger('overlayState', [
            state('hidden', style({
                opacity: 0
            })),
            state('visible', style({
                opacity: 1
            })),
            transition('visible => hidden', animate('400ms ease-in')),
            transition('hidden => visible', animate('400ms ease-out'))
        ]),

        trigger('notificationTopbar', [
            state('hidden', style({
                height: '0',
                opacity: 0
            })),
            state('visible', style({
                height: '*',
                opacity: 1
            })),
            transition('visible => hidden', animate('400ms ease-in')),
            transition('hidden => visible', animate('400ms ease-out'))
        ])
    ]
})
export class ProfileCardComponent implements OnInit {
    @Output() checkParam = new EventEmitter();
    policys = [];
    policyId;
    data:any;
    storageAclFlag = false;
    map = new Map();
    showModifyProfile = false;
    modifyProfileForm: FormGroup;
    dropMenuItems = [];
    isAdministrator = true;
    msgs: Message[];
    @Input() 
    set cardData(data: any) {
        this.data = data;
        this.policys = [];
        if(data){
            this.policyId = {
                id: data.id,
                name: data.name,
                descript: data.description
            }
            if(data['provisioningProperties'].ioConnectivity.maxIOPS){
                this.policys.push("QoS");
            }
            if(data['snapshotProperties'].retention && Object.keys(data['snapshotProperties'].retention).length !== 0){
                this.policys.push("Snapshot");
            }
            if(data['replicationProperties'] && data['replicationProperties'].dataProtection && data['replicationProperties'].dataProtection.replicaType){
                this.policys.push("Replication");
            }
            if(data['provisioningProperties'].dataStorage.storageAccessCapability){
                this.storageAclFlag = true;
            }else{
                this.storageAclFlag = false;
            }
            if(data['customProperties']){
                this.policys.push("Customization");
            }
        }
        
        this.map["Qos"] = "50px";
        this.map["Replication"] = "114px";     
    };
    @Input() checkName;

    chartDatas: any;
    errorMessage={
        "name": { 
            required: this.I18N.keyID['sds_profile_create_name_require'],
            isExisted:this.I18N.keyID['sds_isExisted'],
        },
        "descript":{maxlength:this.I18N.keyID['sds_validate_max_length']}
    };
    constructor(
        public I18N: I18NService,
        private router: Router,
        private http: HttpService,
        private fb: FormBuilder,
        private ProfileService: ProfileService,
        private paramStor: ParamStorService,
        private confirmationService:ConfirmationService,
        private clipboardService: ClipboardService
    ) { }
    option = {};
    ngOnInit() {
        this.option = {
            cutoutPercentage: 70,
            // rotation: (0.5 * Math.PI),
            // circumference: (Math.PI),
            title: {
                display: true,
                text: 'Capacity Usage',
                position: 'top',
                fontSize: 12
            },
            legend: {
                labels: {
                    boxWidth: 10,
                    boxHeight: 2,
                    textAlign: 'left'
                },
                display: true,
                width: '5px',
                position: 'right',
                fontSize: 12,
                maxWidth: 10
            }
        };
        this.dropMenuItems = [
            {
                label: "Modify",
                command: ()=>{
                    this.modifyPorfile(this.data);
                }
            },
            {
                label: "Delete",
                command: () => { this.showWarningDialogFun(this.data) }
            }
        ];
        let username = this.paramStor.CURRENT_USER().split("|")[0];
        if(username == "admin"){
            this.isAdministrator = true;
        }else{
            this.isAdministrator = false;
        }
        this.chartDatas = {
            labels: ['Unused Capacity (GB)', 'Used Capacity (GB)'],
            datasets: [
                {
                    data: [this.data.totalFreeCapacity,this.data.totalCapacity-this.data.totalFreeCapacity],
                    backgroundColor: [
                        "rgba(224, 224, 224, .5)",
                        "#438bd3"
                    ]
                }]
        };
    }

    index;
    isHover;

    showSuspensionFrame(event){
        if(event.type === 'mouseenter'){
            this.isHover = true;
        }else if(event.type === 'mouseleave'){
            this.isHover = false;
        }
        let arrLength = event.target.parentNode.children.length;
        for(let i=0; i<arrLength; i++) {
            if(event.target.parentNode.children[i] === event.target){
                this.index = i;
            }
        }
    }

    modifyPorfile(policyId){
        let id = policyId.id;
        this.showModifyProfile = true;
        let modifyNameForCheck = lodash.cloneDeep(this.checkName);
        modifyNameForCheck = modifyNameForCheck.filter(item=>{
            return item != policyId.name;
        })
        this.modifyProfileForm = this.fb.group({
            "id": [id],
            "name": [policyId.name,{validators:[Validators.required,Utils.isExisted(modifyNameForCheck)]}],
            "descript":  [policyId.description, Validators.maxLength(200)]
        })
        
    }

    copyProfileSuccess(id){
        this.msgs = [];
        this.msgs.push({severity: 'success', summary: "Profile ID copied!", detail: 'The profile ID <strong>' + id + '</strong> has been copied successfully.'});
        this.checkParam.emit(this.msgs);
    }
    copyProfileError(id){
        console.log("Profile ID could not be copied");
        this.msgs = [];
        this.msgs.push({severity: 'error', summary: "Error copying profile ID!", detail: 'Profile ID ' + id +' could not be copied.'});
        this.checkParam.emit(this.msgs);
    }

    submitPorfile(value){
        if(!this.modifyProfileForm.valid){
            for(let i in this.modifyProfileForm.controls){
                this.modifyProfileForm.controls[i].markAsTouched();
            }
            return;
        }
        let url = this.ProfileService.url + "/" + value.id;
        let param = {
            name: value.name,
            description: value.descript
        }
        this.http.put(url,param).subscribe((res)=>{
            this.checkParam.emit(false);
            this.showModifyProfile = false;
        })
    }
    showWarningDialogFun(profile) {
        let msg = "<div>Are you sure you want to delete the Profile?</div><div class='delete-profile-name'>["+ profile.name +"]</div>";
        let header ="Delete Profile";
        let acceptLabel = "Delete";
        let warming = true;
        this.confirmDialog([msg,header,acceptLabel,warming,profile.id])
    }
    deleteProfile(id) {
        this.ProfileService.deleteProfile(id).subscribe((res) => {
            this.checkParam.emit(false);
        }, (error) => {
            console.log("Error deleting profile", error.json().message);
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: "Error", detail: 'Profile could not be deleted.' + '<br />' + 'Code:' + error.json().code + '<br />' + 'Message:' + error.json().message});
            this.checkParam.emit(this.msgs);
        });
    }
    confirmDialog([msg,header,acceptLabel,warming=true,func]){
        this.confirmationService.confirm({
            message: msg,
            header: header,
            acceptLabel: acceptLabel,
            isWarning: warming,
            accept: ()=>{
                try {
                    this.deleteProfile(func);
                }
                catch (e) {
                    console.log(e);
                }
                finally {
                    
                }
            },
            reject:()=>{}
        })
    }
}
