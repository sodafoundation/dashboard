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
    selector: 'app-delfin-qtrees',
    templateUrl: 'qtrees.component.html',
    providers: [ConfirmationService],
    styleUrls: [],
    animations: []
})
export class QtreesComponent implements OnInit {
    @Input() selectedStorage;
    qtreesArr = [];
    allPools: any = [];
    allStorages: any = [];
    selectedStorageId: any;
    selectedStorageDetails: any;
    items: any;
    capacityData: any;
    dataSource: any = [];
    totalRecords: number;
    qtreeOverview: any;
    label = {
        name: this.i18n.keyID["sds_block_volume_name"],
        native_qtree_id: "Native Qtree ID",
        native_filesystem_id: "Native Filesystem ID",
        storage_id: "Storage ID",
        status: "Status",
        created_at: "Created At",
        updated_at: "Updated At",
        path: "Path",
        quota_id: "Quota ID",
        security_mode : "Security Mode",
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
        this.ds.getAllQtrees(this.selectedStorage).subscribe((res)=>{
            this.dataSource = res.json().qtrees;
            
            this.dataSource.forEach((element, index) => {
               
            });
            
            this.totalRecords = this.dataSource.length;
            this.qtreesArr = this.dataSource.slice(0, 10);
            
        }, (error)=>{
            console.log("Something went wrong. Could not fetch Qtrees.", error)
        });
    }

    loadQtreesLazy(event: LazyLoadEvent){
        if(this.dataSource){
            this.qtreesArr = this.dataSource.slice(event.first, (event.first + event.rows));
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

    showQtreeOverview(event, qtree, overlaypanel: OverlayPanel){
        this.qtreeOverview = qtree;
        overlaypanel.toggle(event);
    }
    
}