import { Router } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';
import { I18NService } from 'app/shared/api';
import { AppService } from 'app/app.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { I18nPluralPipe } from '@angular/common';
import { HttpService } from './../../../shared/api';

import { ButtonModule } from './../../../components/common/api';

// import {CardModule} from 'primeng/card';

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
    policys = [];
    data:any;
    storageAclFlag = false;
    @Input() 
    set cardData(data: any) {
        this.data = data;
        this.policys = [];
        if(data){
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
        
    };

    chartDatas: any;
    constructor(
        public I18N: I18NService,
        // private router: Router
        private http: HttpService
    ) { }
    option = {};
    pools = [];
    totalFreeCapacity = 0;
    totalCapacity = 0;
    ngOnInit() {
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
        let arrLength = pools.length;
        for (let i = 0; i < arrLength; i++) {
            if(this.data && this.data["provisioningProperties"].ioConnectivity.accessProtocol && this.data["provisioningProperties"].ioConnectivity.accessProtocol.toLowerCase() == pools[i].extras.ioConnectivity.accessProtocol &&  this.data["provisioningProperties"].dataStorage.provisioningPolicy == pools[i].extras.dataStorage.provisioningPolicy){
                if (FreeOrTotal === 'free') {
                    SumCapacity += pools[i].freeCapacity;
                } else {
                    SumCapacity += pools[i].totalCapacity;
                }
            }else{
                SumCapacity = 0;
            }
        }
        return SumCapacity;
    }
}
