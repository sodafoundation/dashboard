import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService, Utils } from 'app/shared/api';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { AppService } from 'app/app.service';
import { I18nPluralPipe } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Message, MenuItem ,ConfirmationService} from '../../../components/common/api';
import { DelfinService } from '../../delfin/delfin.service';

let _ = require("underscore");
@Component({
    selector: 'app-delfin-storages',
    templateUrl: 'storages.component.html',
    providers: [ConfirmationService],
    styleUrls: [],
    animations: []
})
export class StoragesComponent implements OnInit {
    allStorages: any = [];
    selectedStorages: any = [];
    selectStorage;
    showListView: boolean = true;
    menuItems: MenuItem[];
    capacityData: any;
    chartOptions: any;
    msgs: Message[];

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
        public i18n: I18NService,
        public ds : DelfinService,
        private confirmationService: ConfirmationService,
        private fb: FormBuilder
    ) {
       
    }

    ngOnInit() {
        this.getAllStorages();
        this.menuItems = [
            {
                "label": this.i18n.keyID['sds_block_volume_delete'],
                command: () => {
                    this.batchDeleteStorages(this.selectStorage);
                },
                disabled:false
            }
        ];
    }

    toggleView(){
        this.showListView = this.showListView ? this.showListView : !this.showListView;
        console.log("ShowlistView", this.showListView);
    }

    getAllStorages(){
        this.ds.getAllStorages().subscribe((res)=>{
            
            this.allStorages = res.json().storages;
            this.allStorages.forEach((element, index) => {
                let capData = {
                    labels: ['Used','Free'],
                    datasets: [
                        {
                            data: [element['used_capacity'], element['free_capacity']],
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

                let opt = {
                    legend:{
                        position: 'right'
                    }
                }
                element['capacityData'] = capData;
                element['chartOptions'] = opt;
                /* FIXME REMOVE BEFORE MERGING FOR LOCAL TESTING ONLY */
                if(index%2){
                    element['status'] = 'abnormal';
                    element['description'] = "This is a test for a very long description. If this is truncated it will be visible in the info tooltip."
                }
                /* FIXME REMOVE BEFORE MERGING FOR LOCAL TESTING ONLY */
            });
            console.log("All Storages", this.allStorages);
        }, (error)=>{
            console.log("Something went wrong. Could not fetch all storages", error);
        })
    }

    returnSelectedStorage(selectedStorage){
        this.selectStorage = selectedStorage;
    }

    batchDeleteStorages(storages){
        console.log("Inside batch delete storages.")
        if(storages){
            let  msg, arr = [], selectedNames=[];
            if(_.isArray(storages)){
                storages.forEach((item,index)=> {
                    arr.push(item.id);
                    selectedNames.push(item['name']);
                })
                msg = "<h3>Are you sure you want to delete the selected " + storages.length + " Storages?</h3><h4>[ "+ selectedNames.join(',') +" Storage(s) ]</h4>";
            }else{
                arr.push(storages.id)
                msg = "<h3>Are you sure you want to delete the selected Storage?</h3><h4>[ "+ storages.name +" ]</h4>"; 
            }
            this.confirmationService.confirm({
                message: msg,
                header: this.i18n.keyID['sds_fileShare_delete'],
                acceptLabel: this.i18n.keyID['sds_block_volume_delete'],
                isWarning: true,
                accept: ()=>{
                    arr.forEach((item,index)=> {
                        this.deleteStorage(item)
                    })
                },
                reject:()=>{}
            })
        }
    }

    deleteStorage(storage){

        this.ds.deleteStorage(storage).subscribe(res=>{
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: 'Storage deleted successfully.'});
            this.getAllStorages();
        }, (error)=>{
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: 'Error', detail: 'Error deleting Storage'});
            console.log("Something went wrong. Could not delete storage", error);
        });
    }
}