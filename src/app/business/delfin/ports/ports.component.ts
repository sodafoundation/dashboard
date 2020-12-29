import { Component, OnInit, Input, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService, Utils } from 'app/shared/api';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { AppService } from 'app/app.service';
import { I18nPluralPipe } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Message, MenuItem ,ConfirmationService, LazyLoadEvent} from '../../../components/common/api';
import { DelfinService } from '../delfin.service';
import { OverlayPanel } from 'app/components/overlaypanel/overlaypanel';


let _ = require("underscore");
@Component({
    selector: 'app-delfin-ports',
    templateUrl: 'ports.component.html',
    providers: [ConfirmationService],
    styleUrls: [],
    animations: []
})
export class PortsComponent implements OnInit {
    @Input() selectedStorage;
    portsArr = [];
    allPools: any = [];
    allStorages: any = [];
    selectedStorageId: any;
    selectedStorageDetails: any;
    items: any;
    capacityData: any;
    dataSource: any = [];
    totalRecords: number;
    portOverview: any;
    label = {
        name: this.i18n.keyID["sds_block_volume_name"],
        native_port_id: "Native Port ID",
        storage_id: "Storage ID",
        cpu_info: "CPU Info",
        soft_version: "Software Version",
        connection_status: "Connection Status",
        health_status: "Health Status",
        type: "Type",
        logical_type: "Logical Type",
        speed: "Speed",
        max_speed: "Max Speed",
        native_parent_id: "Native parent ID",
        wwn: "WWN",
        mac_address: "MAC Address",
        ipv4: "IPV4",
        ipv4_mask: "IPV4 Mask",
        ipv6: "IPV6",
        ipv6_mask: "IPV6 Mask",
        created_at: "Created At",
        updated_at: "Updated At",
        memory_size: "Memory Size",
        location: "Location",
        id: "Delfin ID",
    };

    constructor(
        private ActivatedRoute: ActivatedRoute,
        public i18n: I18NService,
        private confirmationService: ConfirmationService,
        private fb: FormBuilder,
        private ds: DelfinService
    ) {
       
    }

    ngOnInit() {
        this.getStorageById(this.selectedStorage);
        this.ds.getAllPorts(this.selectedStorage).subscribe((res)=>{
            this.dataSource = res.json().ports;
            
            this.dataSource.forEach((element, index) => {
                //element['displayMemory'] = Utils.formatBytes(element['memory_size']);
            });
            
            this.totalRecords = this.dataSource.length;
            this.portsArr = this.dataSource.slice(0, 10);
            
        }, (error)=>{
            console.log("Something went wrong. Could not fetch Ports.", error)
        });
    }

    loadPortsLazy(event: LazyLoadEvent){
        if(this.dataSource){
            this.portsArr = this.dataSource.slice(event.first, (event.first + event.rows));
        }
    }
    
    getAllStorages(){
        this.ds.getAllStorages().subscribe((res)=>{
            let storages = res.json().storages;
            this.allStorages = storages;
        }, (error)=>{
            console.log("Something went wrong. Could not fetch all storages", error);
        })
    }

    getStorageById(id){
        this.ds.getStorageById(id).subscribe((res)=>{
            let storage = res.json();
            this.selectedStorageDetails  = storage;
        }, (error)=>{
            console.log("Something went wrong. Could not fetch storage", error);
        })
    }

    showPortOverview(event, port, overlaypanel: OverlayPanel){
        this.portOverview = port;
        overlaypanel.toggle(event);
    }
    
}