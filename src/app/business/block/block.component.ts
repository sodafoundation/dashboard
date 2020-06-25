import { Router,ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { I18NService } from 'app/shared/api';
import { AppService } from 'app/app.service';
import { trigger, state, style, transition, animate} from '@angular/animations';
import { I18nPluralPipe } from '@angular/common';

@Component({
    templateUrl: './block.html',
    styleUrls: [],
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
export class BlockComponent implements OnInit{
    fromGroup:boolean=false;
    fromBuckets:boolean = false;
    showDropDown:boolean = false;
    fromVolume:boolean = false;
    fromFileShare:boolean = false;
    fromCloudVolume: boolean = false;
    fromCloudFileShare:boolean = false;
    fromHosts: boolean = false;
    countItems = [];
    constructor(
        public I18N: I18NService,
        private router: Router,
        private ActivatedRoute:ActivatedRoute
    ){}

    ngOnInit() {
        this.ActivatedRoute.params.subscribe(
            (params) => {
                this.fromGroup = params.fromRoute === "fromGroup";
                this.fromBuckets = params.fromRoute === "fromBuckets";

                this.fromVolume = params.fromRoute === "fromVolume" || params.fromRoute === "fromCloudVolume";

                this.fromFileShare = params.fromRoute === "fromFileShare" || params.fromRoute === "fromCloudFileShare";

                this.fromHosts = params.fromRoute === "fromHosts";
            }
          );
    }

}