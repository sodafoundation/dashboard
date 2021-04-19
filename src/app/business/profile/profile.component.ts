import { Router } from '@angular/router';
import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { I18NService, ParamStorService } from 'app/shared/api';
import { AppService } from 'app/app.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { I18nPluralPipe } from '@angular/common';

import { ProfileService } from './profile.service';
import { PoolService } from './pool.service';
import { ConfirmationService,ConfirmDialogModule, Message} from '../../components/common/api';
let lodash = require('lodash');

@Component({
    templateUrl: './profile.component.html',
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
export class ProfileComponent implements OnInit {
    profileId;
    profiles;
    showWarningDialog = false;
    isAdministrator = true;
    allProfileNameForCheck = [];
    pools = [];
    msgs: Message[];
    constructor(
        public I18N: I18NService,
        // private router: Router
        private ProfileService: ProfileService,
        private confirmationService:ConfirmationService,
        private paramStor: ParamStorService,
        private PoolService: PoolService
    ) { }
    showCard = true;
    ngOnInit() {
        this.getProfiles();
        this.profiles = [];
        let username = this.paramStor.CURRENT_USER().split("|")[0];
        if(username == "admin"){
            this.isAdministrator = true;
        }else{
            this.isAdministrator = false;
        }
    }

    checkRep(message?){
        if(message){
            this.msgs = message;
        }
        this.getProfiles();
    }
    getProfiles() {
        this.ProfileService.getProfiles().subscribe((res) => {
            let str = res.json();
            this.allProfileNameForCheck = [];
            str.forEach(item=>{
                if(item.storageType && item.storageType == "file"){
                    delete item.replicationProperties;
                }
                this.allProfileNameForCheck.push(item.name);
            })
            this.getPools(str);
        });
    }
    getPools(str) {
        this.PoolService.getPools().subscribe((res) => {
            this.pools = res.json();
            str.forEach(item => {
                item.totalFreeCapacity = this.getSumCapacity(this.pools, 'free',item);
                item.totalCapacity = this.getSumCapacity(this.pools, 'total',item);
            });
            this.profiles = str;
        },
        err=>{
            this.profiles = str;
        });
    }
    getSumCapacity(pools, FreeOrTotal,data) {
        let SumCapacity: number = 0;
        let newPools = lodash.cloneDeep(pools);
        newPools = newPools.filter(item=>{
            return item.storageType == data.storageType;
        })
        let arrLength = newPools.length;
        for (let i = 0; i < arrLength; i++) {
            let valid = data && data["provisioningProperties"].ioConnectivity.accessProtocol && data["provisioningProperties"].ioConnectivity.accessProtocol.toLowerCase() 
            == newPools[i].extras.ioConnectivity.accessProtocol;
            let blockValid = data["provisioningProperties"].dataStorage.provisioningPolicy == newPools[i].extras.dataStorage.provisioningPolicy;
            if(valid && (data.storageType == "file" ||  (data.storageType == "block" && blockValid))){
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
}
