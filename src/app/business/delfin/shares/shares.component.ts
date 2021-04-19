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
    selector: 'app-delfin-shares',
    templateUrl: 'shares.component.html',
    providers: [ConfirmationService],
    styleUrls: [],
    animations: []
})
export class SharesComponent implements OnInit {
    @Input() selectedStorage;
    sharesArr = [];
    allPools: any = [];
    allStorages: any = [];
    selectedStorageId: any;
    selectedStorageDetails: any;
    items: any;
    capacityData: any;
    dataSource: any = [];
    totalRecords: number;
    shareOverview: any;
    label = {
        name: this.i18n.keyID["sds_block_volume_name"],
        native_share_id: "Native Share ID",
        native_qtree_id: "Native Qtree ID",
        native_filesystem_id: "Native Filesystem ID",
        storage_id: "Storage ID",
        status: "Status",
        created_at: "Created At",
        updated_at: "Updated At",
        path: "Path",
        protocol : "Protocol",
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
        this.ds.getAllShares(this.selectedStorage).subscribe((res)=>{
            this.dataSource = res.json().shares;
            
            this.dataSource.forEach((element, index) => {
               
            });
            
            this.totalRecords = this.dataSource.length;
            this.sharesArr = this.dataSource.slice(0, 10);
            
        }, (error)=>{
            console.log("Something went wrong. Could not fetch Shares.", error)
        });
    }

    loadSharesLazy(event: LazyLoadEvent){
        if(this.dataSource){
            this.sharesArr = this.dataSource.slice(event.first, (event.first + event.rows));
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

    showShareOverview(event, share, overlaypanel: OverlayPanel){
        this.shareOverview = share;
        overlaypanel.toggle(event);
    }
    
}