import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService, Utils } from 'app/shared/api';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { AppService } from 'app/app.service';
import { I18nPluralPipe } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Message, MenuItem ,ConfirmationService} from '../../components/common/api';

import { VolumeService } from './volume.service';
import { HostsService } from './hosts.service';
import { ProfileService } from './../profile/profile.service';
import { identifierModuleUrl } from '@angular/compiler';

let _ = require("underscore");
@Component({
    selector: 'app-hosts',
    templateUrl: 'hosts.component.html',
    providers: [ConfirmationService],
    styleUrls: [],
    animations: []
})
export class HostsComponent implements OnInit {
   
    capacityOptions = [
        {
            label: 'GB',
            value: 'gb'
        },
        {
            label: 'TB',
            value: 'tb'
        }

    ];
    profileOptions = [];
    snapProfileOptions = [];
    azOption=[{label:"Secondary",value:"secondary"}];
    selectedHosts = [];
    selectedHost;
    volumes = [];
    allVolumes;
    menuItems: MenuItem[];
    menuDeleDisableItems: MenuItem[];
    isVolumeAttached: boolean = false;
    msgs: Message[];
    allHosts = [];
    label = {
        hostName: "Name",
        ip: "IP Address",
        port: "Port",
        createdAt: "Created At",
        updatedAt: "Updated At",
        tenantId: "Tenant",
        status: "Status",
        osType: "OS",
        accessMode: "Access Mode",
        availabilityZones: "Availability Zones",
        initiators: "Initiators"
    };

    constructor(
        public I18N: I18NService,
        private router: Router,
        private VolumeService: VolumeService,
        private HostsService: HostsService,
        private confirmationService: ConfirmationService,
        private fb: FormBuilder
    ) {
       
    }

    

    returnSelectedHost(host){
        this.selectedHost = host;
    }

    ngOnInit() {
        this.getAllHosts();
        this.menuItems = [
           
            {
                "label": this.I18N.keyID['sds_block_volume_delete'], 
                command: () => {
                    if (this.selectedHost) {
                        this.batchDeleteHosts(this.selectedHost);
                    }
                },
                disabled:false
            }
        ];
        this.menuDeleDisableItems = [
           
            {
                "label": this.I18N.keyID['sds_block_volume_delete'], 
                command: () => {
                    if (this.selectedHost) {
                        this.batchDeleteHosts(this.selectedHost);
                    }
                },
                disabled:true
            }
        ];

    }

    getAllHosts(){
        this.HostsService.getHosts().subscribe((res) => {
            this.allHosts = res.json();
        }, (error) =>{
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: 'Error', detail: error.message});
        })
       
    }

    getVolumes() {
        this.VolumeService.getVolumes().subscribe((res) => {
            let volumes = res.json();
            this.allVolumes = volumes;
        }, (error) => {
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: 'Error', detail: error.message});
        });
    }

   deleteHost(id){
       console.log("Delete host", id);
       this.HostsService.deleteHost(id).subscribe((res)=>{
        this.msgs = [];
        this.msgs.push({severity: 'success', summary: 'Success', detail: 'Host Deleted Successfully.'});
        this.getAllHosts();
    }, (error) =>{
        this.msgs = [];
        this.msgs.push({severity: 'error', summary: 'Error', detail: error.json().message});
    });
   }

    batchDeleteHosts(hosts){
        let arr=[], msg;
        if(_.isArray(hosts)){
            hosts.forEach((item,index)=> {
                arr.push(item.id);
            })
            msg = "<div>Are you sure you want to delete the selected hosts?</div><h3>[ "+ hosts.length +" Hosts ]</h3>";
        }else{
            arr.push(hosts.id);
            msg = "<div>Are you sure you want to delete the host?</div><h3>[ "+ hosts.hostName +" ]</h3>";
        }

        this.confirmationService.confirm({
            message: msg,
            header: this.I18N.keyID['sds_block_host_delete'],
            acceptLabel: this.I18N.keyID['sds_block_volume_delete'],
            isWarning: true,
            accept: ()=>{
                arr.forEach((item,index)=> {
                    this.deleteHost(item)
                })

            },
            reject:()=>{}
        })

    }

    modifyHost(host){
        console.log("Host is being modified");
        this.isVolumeAttached = false;
        if(this.isVolumeAttached == false){
            this.router.navigate(['/modifyHost', host.id]);
        }
    }
    
    tablePaginate() {
        this.selectedHosts = [];
    }
}
