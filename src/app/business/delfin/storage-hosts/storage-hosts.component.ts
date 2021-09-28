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
    selector: 'app-delfin-storage-hosts',
    templateUrl: 'storage-hosts.component.html',
    providers: [ConfirmationService],
    styleUrls: [],
    animations: []
})
export class StorageHostsComponent implements OnInit {
    @Input() selectedStorage;
    @Input() selectedStorageHosts?: any;
    storageHostsArr = [];
    allPools: any = [];
    allStorages: any = [];
    selectedStorageId: any;
    selectedStorageDetails: any;
    items: any;
    dataSource: any = [];
    totalRecords: number;
    storageHostOverview: any;
    label = {
        name: this.i18n.keyID["sds_block_volume_name"],
        ip_address: "IP Address",
        description : "Description",
        storage_id: "Storage ID",
        status: "Status",
        native_storage_host_id: "Native Host ID",
        created_at: "Created At",
        updated_at: "Updated At",
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
        this.ds.getAllStorageHosts(this.selectedStorage).subscribe((res)=>{
            let datasrc = res.json().storage_hosts;
            if(this.selectedStorageHosts && this.selectedStorageHosts.length){
                this.selectedStorageHosts.forEach(element => {
                    datasrc.forEach(storageHostsElement => {
                        if(element == storageHostsElement['native_storage_host_id']){
                            this.dataSource.push(storageHostsElement);
                        }
                    });
                });
            } else{
                this.dataSource = datasrc;
            }
            
            this.dataSource.forEach((element, index) => {
                //element['displayMemory'] = Utils.formatBytes(element['memory_size']);
            });
            
            this.totalRecords = this.dataSource.length;
            this.storageHostsArr = this.dataSource.slice(0, 10);
            
        }, (error)=>{
            console.log("Something went wrong. Could not fetch Storage Host Initiators.", error)
        });
    }

    loadInitiatorsLazy(event: LazyLoadEvent){
        if(this.dataSource){
            this.storageHostsArr = this.dataSource.slice(event.first, (event.first + event.rows));
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

    showStorageHostOverview(event, storageHost, overlaypanel: OverlayPanel){
        this.storageHostOverview = storageHost;
        overlaypanel.toggle(event);
    }
    
}