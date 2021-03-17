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
    selector: 'app-delfin-quotas',
    templateUrl: 'quotas.component.html',
    providers: [ConfirmationService],
    styleUrls: [],
    animations: []
})
export class QuotasComponent implements OnInit {
    @Input() selectedStorage;
    quotasArr = [];
    allQuotas: any = [];
    allStorages: any = [];
    selectedStorageId: any;
    selectedStorageDetails: any;
    items: any;
    capacityData: any;
    dataSource: any = [];
    totalRecords: number;
    quotaOverview: any;
    label = {
        name: this.i18n.keyID["sds_block_volume_name"],
        description: this.i18n.keyID["sds_block_volume_descri"],
        native_quota_id: "Native Quota ID",
        native_filesystem_id: "Native Filesystem ID",        
        native_qtree_id: "Native Qtree ID",
        storage_id: "Storage ID",
        type: "Type",
        created_at: "Created At",
        updated_at: "Updated At",
        capacity_hard_limit: "Capacity Hard Limit",
        capacity_soft_limit: "Capacity Soft Limit",
        file_hard_limit: "File Hard Limit",
        file_soft_limit: "File Soft Limit",
        used_capacity: "Used Capacity",
        file_count: "File Count",
        user_group_name: "User Group Name",
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
        this.ds.getAllQuotas(this.selectedStorage).subscribe((res)=>{
            this.dataSource = res.json().quotas;
            
            this.dataSource.forEach((element, index) => {
                //Calculate the capacities for the Widgets
                element['capacity'] = {};
                element['capacity'].display_hard_limit = Utils.formatBytes(element['capacity_hard_limit']);
                element['capacity'].display_soft_limit = Utils.formatBytes(element['capacity_soft_limit']);
                element['capacity'].display_used = Utils.formatBytes(element['used_capacity']);
                element['capacity'].display_free = Utils.formatBytes(element['capacity_hard_limit'] - element['used_capacity']);
                let percentUsage = Math.ceil((element['used_capacity']/element['capacity_hard_limit']) * 100);
                element['capacity'].usage = percentUsage;
            });
            
            this.totalRecords = this.dataSource.length;
            this.quotasArr = this.dataSource.slice(0, 10);
            
        }, (error)=>{
            console.log("Something went wrong. Could not fetch Quotas.", error)
        });
    }

    loadQuotasLazy(event: LazyLoadEvent){
        if(this.dataSource){
            this.quotasArr = this.dataSource.slice(event.first, (event.first + event.rows));
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

    showQuotaOverview(event, quota, overlaypanel: OverlayPanel){
        this.quotaOverview = quota;
        overlaypanel.toggle(event);
    }
    
}