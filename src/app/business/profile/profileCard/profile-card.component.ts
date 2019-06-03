import { Router } from '@angular/router';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { I18NService, MsgBoxService, Utils } from 'app/shared/api';
import { AppService } from 'app/app.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { I18nPluralPipe } from '@angular/common';
import { HttpService } from './../../../shared/api';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

import { ButtonModule } from './../../../components/common/api';
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
    allProfileNameForCheck = [];
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
            if(data['replicationProperties'] && data['replicationProperties'].dataProtection && Object.keys(data['replicationProperties'].dataProtection).length !== 0){
                this.policys.push("Replication");
            }
            if(data['provisioningProperties'].dataStorage.storageAccessCapability){
                this.storageAclFlag = true;
            }else{
                this.storageAclFlag = false;
            }
        }
        
        this.map["Qos"] = "50px";
        this.map["Replication"] = "114px";     
    };

    chartDatas: any;
    errorMessage={
        "name": { 
            required: this.I18N.keyID['sds_profile_create_name_require'],
            isExisted:this.I18N.keyID['sds_isExisted'],
        }
    };
    constructor(
        public I18N: I18NService,
        private router: Router,
        private http: HttpService,
        private fb: FormBuilder,
        private ProfileService: ProfileService
    ) { }
    option = {};
    pools = [];
    totalFreeCapacity = 0;
    totalCapacity = 0;
    ngOnInit() {
        this.getProfiles();
        this.getPools();
        this.option = {
            cutoutPercentage: 80,
            // rotation: (0.5 * Math.PI),
            // circumference: (Math.PI),
            title: {
                display: false,
                text: 'My Title',
                fontSize: 12
            },
            legend: {
                labels: {
                    boxWidth: 12
                },
                display: false,
                width: '5px',
                position: 'right',
                fontSize: 12
            }
        };
    }

    index;
    isHover;

    getProfiles() {
        this.allProfileNameForCheck = [];
        this.ProfileService.getProfiles().subscribe((res) => {
            let profiles = res.json();
            profiles.forEach(item=>{
                this.allProfileNameForCheck.push(item.name);
            })
        });
    }
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
    getPools() {
        let url = 'v1beta/{project_id}/pools';
        this.http.get(url).subscribe((res) => {
            this.pools = res.json();
            this.totalFreeCapacity = this.getSumCapacity(this.pools, 'free');
            this.totalCapacity = this.getSumCapacity(this.pools, 'total');
            this.chartDatas = {
                labels: ['Unused Capacity', 'Used Capacity'],
                datasets: [
                    {
                        data: [this.totalFreeCapacity,this.totalCapacity-this.totalFreeCapacity],
                        backgroundColor: [
                            "rgba(224, 224, 224, .5)",
                            "#438bd3"
                        ]
                    }]
            };
        });
    }

    getSumCapacity(pools, FreeOrTotal) {
        let SumCapacity: number = 0;
        let newPools = lodash.cloneDeep(pools);
        newPools = newPools.filter(item=>{
            return item.storageType == this.data.storageType;
        })
        let arrLength = newPools.length;
        for (let i = 0; i < arrLength; i++) {
            let valid = this.data && this.data["provisioningProperties"].ioConnectivity.accessProtocol && this.data["provisioningProperties"].ioConnectivity.accessProtocol.toLowerCase() 
            == newPools[i].extras.ioConnectivity.accessProtocol;
            let blockValid = this.data["provisioningProperties"].dataStorage.provisioningPolicy == newPools[i].extras.dataStorage.provisioningPolicy;
            if(valid && (this.data.storageType == "file" ||  (this.data.storageType == "block" && blockValid))){
                if (FreeOrTotal === 'free') {
                    SumCapacity += newPools[i].freeCapacity;
                } else {
                    SumCapacity += newPools[i].totalCapacity;
                }
            }else{
                SumCapacity = 0;
            }
        }
        return SumCapacity;
    }

    modifyPorfile(policyId){
        let id = policyId.id;
        this.showModifyProfile = true;
        this.modifyProfileForm = this.fb.group({
            "id": [id],
            "name": [policyId.name,{validators:[Validators.required,Utils.isExisted(this.allProfileNameForCheck)]}],
            "descript":  [policyId.descript, Validators.maxLength(200)]
        })
        
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
             this.getProfiles();
            this.checkParam.emit(false);
            this.showModifyProfile = false;
        })
    }
}
