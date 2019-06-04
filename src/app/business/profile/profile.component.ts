import { Router } from '@angular/router';
import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { I18NService, ParamStorService } from 'app/shared/api';
import { AppService } from 'app/app.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { I18nPluralPipe } from '@angular/common';

import { ProfileService } from './profile.service';
import { ConfirmationService,ConfirmDialogModule} from '../../components/common/api';

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
    constructor(
        public I18N: I18NService,
        // private router: Router
        private ProfileService: ProfileService,
        private confirmationService:ConfirmationService,
        private paramStor: ParamStorService
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

    checkRep(){
        this.getProfiles();
    }
    getProfiles() {
        this.ProfileService.getProfiles().subscribe((res) => {
            this.profiles = res.json();
            this.profiles.forEach(item=>{
                if(item.storageType && item.storageType == "file"){
                    delete item.replicationProperties;
                }
            })
        });
    }

    showWarningDialogFun(profile) {
        let msg = "<div>Are you sure you want to delete the Profile?</div><h3>[ "+ profile.name +" ]</h3>";
        let header ="Delete Profile";
        let acceptLabel = "Delete";
        let warming = true;
        this.confirmDialog([msg,header,acceptLabel,warming,profile.id])
    }
    deleteProfile(id) {
        this.ProfileService.deleteProfile(id).subscribe((res) => {
            this.getProfiles();
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
