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
    selector: 'app-delfin-storage-host-initiators',
    templateUrl: 'initiators.component.html',
    providers: [ConfirmationService],
    styleUrls: [],
    animations: []
})
export class StorageHostInitiatorsComponent implements OnInit {
    @Input() selectedStorage;
    @Input() selectedInitiators?: any;
    initiatorsArr = [];
    allPools: any = [];
    allStorages: any = [];
    selectedStorageId: any;
    selectedStorageDetails: any;
    items: any;
    dataSource: any = [];
    totalRecords: number;
    initiatorOverview: any;
    label = {
        name: this.i18n.keyID["sds_block_volume_name"],
        alias: "Alias",
        description : "Description",
        native_storage_host_initiator_id: "Native Host Initiator ID",
        storage_id: "Storage ID",
        status: "Status",
        native_storage_host_id: "Native Host ID",
        wwn: "WWN",
        created_at: "Created At",
        updated_at: "Updated At",
        id: "Delfin ID",
        type: "Type"
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
        this.ds.getAllStorageHostInitiators(this.selectedStorage).subscribe((res)=>{
            let datasrc = res.json().storage_host_initiators;
            if(this.selectedInitiators && this.selectedInitiators.length){
                this.selectedInitiators.forEach(element => {
                    datasrc.forEach(initiatorElement => {
                        if(element == initiatorElement['native_storage_host_initiator_id']){
                            this.dataSource.push(initiatorElement);
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
            this.initiatorsArr = this.dataSource.slice(0, 10);
            
        }, (error)=>{
            console.log("Something went wrong. Could not fetch Storage Host Initiators.", error)
        });
    }

    loadInitiatorsLazy(event: LazyLoadEvent){
        if(this.dataSource){
            this.initiatorsArr = this.dataSource.slice(event.first, (event.first + event.rows));
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

    showInitiatorOverview(event, initiator, overlaypanel: OverlayPanel){
        this.initiatorOverview = initiator;
        overlaypanel.toggle(event);
    }
    
}
