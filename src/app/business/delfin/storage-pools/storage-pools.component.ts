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
    selector: 'app-delfin-storage-pools',
    templateUrl: 'storage-pools.component.html',
    providers: [ConfirmationService],
    styleUrls: [],
    animations: []
})
export class StoragePoolsComponent implements OnInit {
    @Input() selectedStorage;
    poolsArr = [];
    allPools: any = [];
    allStorages: any = [];
    selectedStorageId: any;
    selectedStorageDetails: any;
    items: any;
    capacityData: any;
    dataSource: any = [];
    totalRecords: number;
    poolOverview: any;
    label = {
        name: this.i18n.keyID["sds_block_volume_name"],
        description: this.i18n.keyID["sds_block_volume_descri"],
        native_storage_pool_id: "Native Storage Pool ID",
        storage_id: "Storage ID",
        storage_type: "Storage Type",
        status: "Status",
        created_at: "Created At",
        updated_at: "Updated At",
        free_capacity: "Free Capacity",
        used_capacity: "Used Capacity",
        total_capacity: "Total Capacity",
        subscribed_capacity: "Subscribed Capacity",
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
        this.ds.getAllStoragePools(this.selectedStorage).subscribe((res)=>{
            this.dataSource = res.json().storage_pools;
            
            this.dataSource.forEach((element, index) => {
                //Calculate the capacities for the Widgets
                element['capacity'] = {};
                let percentUsage = Math.ceil((element['used_capacity']/element['total_capacity']) * 100);
                element['capacity'].used = Utils.formatBytes(element['used_capacity']);
                element['capacity'].free = Utils.formatBytes(element['free_capacity']);
                element['capacity'].total = Utils.formatBytes(element['total_capacity']);
                if(element['subscribed_capacity']){
                    element['capacity'].subscribed = Utils.formatBytes(element['subscribed_capacity']);
                }
                element['capacity'].usage = percentUsage;
            });
            
            this.totalRecords = this.dataSource.length;
            this.poolsArr = this.dataSource.slice(0, 10);
            
        }, (error)=>{
            console.log("Something went wrong. Could not fetch Storage Pools.", error)
        });
    }

    loadPoolsLazy(event: LazyLoadEvent){
        if(this.dataSource){
            this.poolsArr = this.dataSource.slice(event.first, (event.first + event.rows));
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

    showPoolOverview(event, pool, overlaypanel: OverlayPanel){
        this.poolOverview = pool;
        //this.poolOverview['storageDetails'] = this.selectedStorageDetails;
        //console.log("This is pooloverview", this.poolOverview);
        overlaypanel.toggle(event);
    }
    
}