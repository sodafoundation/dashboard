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
    selector: 'app-delfin-disks',
    templateUrl: 'disks.component.html',
    providers: [ConfirmationService],
    styleUrls: [],
    animations: []
})
export class DisksComponent implements OnInit {
    @Input() selectedStorage;
    disksArr = [];
    allDisks: any = [];
    allStorages: any = [];
    selectedStorageId: any;
    selectedStorageDetails: any;
    items: any;
    capacityData: any;
    dataSource: any = [];
    totalRecords: number;
    diskOverview: any;
    label = {
        name: this.i18n.keyID["sds_block_volume_name"],
        native_disk_id: "Native Disk ID",
        storage_id: "Storage ID",
        serial_number: "Serial Number",
        manufacturer: "Manufacturer",
        model: "Model",
        firmware: "Firmware",
        speed: "Speed",
        capacity: "Capacity",
        status: "Status",
        physical_type: "Physical Type",
        logical_type: "Logical Type",
        health_score: "Health Score",
        native_disk_group_id: "Native Disk Group ID",
        created_at: "Created At",
        updated_at: "Updated At",
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
        this.ds.getAllDisks(this.selectedStorage).subscribe((res)=>{
            this.dataSource = res.json().disks;
            
            this.dataSource.forEach((element, index) => {
                element['displayCapacity'] = Utils.formatBytes(element['capacity']);
            });
            
            this.totalRecords = this.dataSource.length;
            this.disksArr = this.dataSource.slice(0, 10);
            
        }, (error)=>{
            console.log("Something went wrong. Could not fetch Storage Pools.", error)
        });
    }

    loadDisksLazy(event: LazyLoadEvent){
        if(this.dataSource){
            this.disksArr = this.dataSource.slice(event.first, (event.first + event.rows));
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

    showDiskOverview(event, disk, overlaypanel: OverlayPanel){
        this.diskOverview = disk;
        overlaypanel.toggle(event);
    }
    
}