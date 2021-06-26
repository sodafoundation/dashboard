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
    selector: 'app-delfin-volumes',
    templateUrl: 'volumes.component.html',
    providers: [ConfirmationService],
    styleUrls: [],
    animations: []
})
export class StorageVolumesComponent implements OnInit {
    @Input() selectedStorage: any;
    @Input() selectedVolumes?: any;
    volumesArr = [];
    allVolumes: any = [];
    allStorages: any = [];
    selectedStorageId: any;
    selectedStorageDetails: any;
    items: any;
    capacityData: any;
    dataSource: any = [];
    totalRecords: number;
    volumeOverview: any;
    label = {
        name: this.i18n.keyID["sds_block_volume_name"],
        description: this.i18n.keyID["sds_block_volume_descri"],
        wwn: "WWN",
        native_volume_id: "Native Volume ID",
        storage_id: "Storage ID",
        compressed: "Compressed",
        deduplicated: "Deduplicated",
        status: "Status",
        created_at: "Created At",
        updated_at: "Updated At",
        free_capacity: "Free Capacity",
        used_capacity: "Used Capacity",
        total_capacity: "Total Capacity",
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
        this.ds.getAllVolumes(this.selectedStorage).subscribe((res)=>{
            let datasrc = res.json().volumes;
            if(this.selectedVolumes && this.selectedVolumes.length){
                this.selectedVolumes.forEach(element => {
                    datasrc.forEach(volElement => {
                        if(element == volElement['native_volume_id']){
                            this.dataSource.push(volElement);
                        }
                    });
                });
            } else{
                this.dataSource = datasrc;
            }           
            
            this.dataSource.forEach((element, index) => {
                //Calculate the capacities for the Widgets
                element['capacity'] = {};
                let percentUsage = Math.ceil((element['used_capacity']/element['total_capacity']) * 100);
                element['capacity'].used = Utils.formatBytes(element['used_capacity']);
                element['capacity'].free = Utils.formatBytes(element['free_capacity']);
                element['capacity'].total = Utils.formatBytes(element['total_capacity']);
                element['capacity'].usage = percentUsage;
            });
            
            this.totalRecords = this.dataSource.length;
            this.volumesArr = this.dataSource.slice(0, 10);
            
        }, (error)=>{
            console.log("Something went wrong. Could not fetch Volumes.", error)
        });
    }

    loadVolumesLazy(event: LazyLoadEvent){
        if(this.dataSource){
            this.volumesArr = this.dataSource.slice(event.first, (event.first + event.rows));
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

    showVolumeOverview(event, volume, overlaypanel: OverlayPanel){
        this.volumeOverview = volume;
        overlaypanel.toggle(event);
    }
    
}
