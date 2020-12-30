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
    selector: 'app-delfin-controllers',
    templateUrl: 'controllers.component.html',
    providers: [ConfirmationService],
    styleUrls: [],
    animations: []
})
export class ControllersComponent implements OnInit {
    @Input() selectedStorage;
    controllersArr = [];
    allPools: any = [];
    allStorages: any = [];
    selectedStorageId: any;
    selectedStorageDetails: any;
    items: any;
    capacityData: any;
    dataSource: any = [];
    totalRecords: number;
    controllerOverview: any;
    label = {
        name: this.i18n.keyID["sds_block_volume_name"],
        native_controller_id: "Native Controller ID",
        storage_id: "Storage ID",
        cpu_info: "CPU Info",
        soft_version: "Software Version",
        status: "Status",
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
        this.ds.getAllControllers(this.selectedStorage).subscribe((res)=>{
            this.dataSource = res.json().controllers;
            
            this.dataSource.forEach((element, index) => {
                element['displayMemory'] = Utils.formatBytes(element['memory_size']);
            });
            
            this.totalRecords = this.dataSource.length;
            this.controllersArr = this.dataSource.slice(0, 10);
            
        }, (error)=>{
            console.log("Something went wrong. Could not fetch Controllers.", error)
        });
    }

    loadControllersLazy(event: LazyLoadEvent){
        if(this.dataSource){
            this.controllersArr = this.dataSource.slice(event.first, (event.first + event.rows));
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

    showControllerOverview(event, controller, overlaypanel: OverlayPanel){
        this.controllerOverview = controller;
        overlaypanel.toggle(event);
    }
    
}