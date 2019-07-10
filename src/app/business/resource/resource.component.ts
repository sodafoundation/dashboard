import { Router } from '@angular/router';
import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { I18NService, ParamStorService, Consts} from 'app/shared/api';
import { Http } from '@angular/http';
import { trigger, state, style, transition, animate} from '@angular/animations';
import { I18nPluralPipe } from '@angular/common';
import { AvailabilityZonesService } from './resource.service';

@Component({
    templateUrl: './resource.html',
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
export class ResourceComponent implements OnInit{
    blockStorages = [];
    fileStorages = [];
    objectStorages = [];
    regions = [];
    zones = [];
    tabPrimary = "block";
    tabSecond = "storage";
    countStorage = 0;
    countRegion = 1;
    countAZ = 0;
    
    constructor(
        public I18N: I18NService,
        private http: Http,
        private paramStor: ParamStorService,
        private availabilityZonesService: AvailabilityZonesService
    ){}
    
    ngOnInit() {
        this.listStorage();
        this.listAZ();
        this.regions = [
            { "name": this.I18N.keyID['sds_resource_region_default'], "role": "Primary Region", }
        ];
    }
    
    listStorage(){
        this.blockStorages = [];
        this.fileStorages = [];
        this.objectStorages = [];
        let reqUser: any = { params:{} };
        let user_id = this.paramStor.CURRENT_USER().split("|")[1];
        this.http.get("/v3/users/"+ user_id +"/projects", reqUser).subscribe((objRES) => {
            let project_id;
            objRES.json().projects.forEach(element => {
                if(element.name == "admin"){
                    project_id = element.id;
                }
            })

            let reqPool: any = { params:{} };
            this.http.get("/v1beta/"+ project_id +"/pools", reqPool).subscribe((poolRES) => {
                let reqDock: any = { params:{} };
                this.http.get("/v1beta/"+ project_id +"/docks", reqDock).subscribe((result)=>{
                    result.json().forEach(ele => {

                        let pool = poolRES.json().filter((pool)=>{
                            return pool.dockId == ele.id;
                        })
                        if(pool && pool.length != 0){
                            let zone = pool[0].availabilityZone;
                            let [name,ip,status,description,region,az,type] = [ele.name, ele.endpoint.split(":")[0], "Enabled", ele.description, "default_region", zone, ele.storageType];
                            if(pool[0].storageType == "block"){
                                this.blockStorages.push({name,ip,status,description,region,az,type});
                            }else if(pool[0].storageType == "file"){
                                this.fileStorages.push({name,ip,status,description,region,az,type});
                            }
                        }
                        
                    });
                    this.countStorage = this.blockStorages.length != 0 ?this.blockStorages.length : (this.fileStorages.length != 0 ? this.fileStorages.length : 0 );
                });
            })
        })
    }

    listAZ(){
        this.zones = [];
        this.availabilityZonesService.getAZ().subscribe((azRes) => {
            let AZs=azRes.json();
            if(AZs && AZs.length !== 0){
                AZs.forEach(item =>{
                    let [name,region,description] = [item, "default_region", "--"];
                    this.zones.push({name,region,description});
                })
            }
            this.countAZ = AZs.length;
        })
    }

    tabChange(e) {
        if(e.index == 0){
            this.tabPrimary = "block";
            this.tabSecond = "storage";
        }else if(e.index == 1){
            this.tabPrimary = "object";
            this.http.get('v1/{project_id}/backends').subscribe((res)=>{
                this.objectStorages = res.json().backends ? res.json().backends :[];

                this.objectStorages.forEach(element => {
                    element.type = Consts.CLOUD_TYPE_NAME[element.type];
                    element['status'] = "Enable";
                })
            })
        }else{
            this.tabPrimary = "file";
            this.tabSecond = "storage";
        }
        if(e.index != 1){
            this.listAZ();
        }
    }

    tabSecondChange(e, dialog) {
        if(dialog == "block"){
            if(e.index == 0){
                this.tabSecond = "storage";
            }else if(e.index == 1){
                this.tabSecond = "region";
            }else if(e.index == 2){
                this.tabSecond = "az";
            }
        }else if(dialog == "file"){
            if(e.index == 0){
                this.tabSecond = "storage";
            }else if(e.index == 1){
                this.tabSecond = "az";
            }
        }
    }
}

