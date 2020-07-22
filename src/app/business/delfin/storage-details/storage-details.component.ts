import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService, Utils } from 'app/shared/api';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { AppService } from 'app/app.service';
import { I18nPluralPipe } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Message, MenuItem ,ConfirmationService} from '../../../components/common/api';
import { DelfinService } from '../delfin.service';


let _ = require("underscore");
@Component({
    selector: 'app-delfin-storage-details',
    templateUrl: 'storage-details.component.html',
    providers: [ConfirmationService],
    styleUrls: [],
    animations: []
})
export class StorageDetailsComponent implements OnInit {
    allStorages: any = [];
    selectedStorage: any;
    selectedStorageId: any;
    items: any;
    capacityData: any;

    label = {
        name: this.i18n.keyID["sds_block_volume_name"],
        description: this.i18n.keyID["sds_block_volume_descri"],
        vendor: "Vendor",
        model: "Model",
        status: "Status",
        host: "Host IP",
        port: "Port",
        username: "Username",
        password: "Password",
        extra_attributes: "Extra Attributes",
        created_at: "Created At",
        updated_at: "Updated At",
        firmware_version: "Firmware Version",
        serial_number : "Serial Number",
        location : "Location",
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
        this.ActivatedRoute.params.subscribe((params) => {
            this.selectedStorageId = params.storageId;
        });
        this.items = [
            { 
                label: "Storages", 
                url: '/delfin' 
            },
            { 
                label: "Storage Details", 
                url: '/storageDetails' 
            }
        ];
        this.getAllStorages();
        this.getStorageById(this.selectedStorageId);
    }

    getAllStorages(){
        this.ds.getAllStorages().subscribe((res)=>{
            console.log("All Storages", res.json().storages);
            this.allStorages = res.json().storages;
        }, (error)=>{
            console.log("Something went wrong. Could not fetch all storages", error);
        })
    }

    getStorageById(id){
        this.ds.getStorageById(id).subscribe((res)=>{
            console.log("Selected Storage", res.json());
            this.selectedStorage = res.json();
            this.capacityData = {
                labels: ['Used','Free'],
                datasets: [
                    {
                        data: [this.selectedStorage['used_capacity'], this.selectedStorage['free_capacity']],
                        backgroundColor: [
                            "#FF6384",
                            "#45e800"
                        ],
                        hoverBackgroundColor: [
                            "#FF6384",
                            "#45e800"
                        ]
                    }]    
            };
        }, (error)=>{
            console.log("Something went wrong. Could not fetch storage", error);
        })
    }
    
}