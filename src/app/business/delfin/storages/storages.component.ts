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
    selectedStorageId: any;
    selectStorage;
    showListView: boolean = true;
    menuItems: MenuItem[];
    capacityData: any;
    chartOptions: any;
    versionOptions: any;
    selectedVersion: any;
    securityLeveloptions: any;
    selectedSecurityLevel: any;
    authProtocolOptions: any;
    selectedAuthProtocol: any;
    privacyProtocolOptions: any;
    selectedPrivacyProtocol: any;
    registerAlertSourceForm: any;
    showRegisterAlertSourceForm: boolean = false;
    v2cFields: boolean = false;
    v3Fields: boolean = false;
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

    alertSourceFormlabel = {
        "version": "Version",
        "community_string": "Community String",
        "username": "Username",
        "engine_id": "Engine ID",
        "security_level": "Security Level",
        "auth_protocol": "Auth Protocol",
        "auth_key": "Auth Key",
        "privacy_protocol": "Privacy Protocol",
        "privacy_key": "Privacy Key",
        "host": "Host"
    }

    errorMessage = {
        "version" : {
            required: "Version is required"
        },
        "host" : {
            required: "Host IP address is required",
            pattern: "Enter valid IPv4 address"
        }
    };
    validRule= {
        'validIp': '([0-9]{1,3})[.]([0-9]{1,3})[.]([0-9]{1,3})[.]([0-9]{1,3})' /* Validates IPv4 address */
    };
    
    constructor(
        public i18n: I18NService,
        public ds : DelfinService,
        private confirmationService: ConfirmationService,
        private fb: FormBuilder,
        private router: Router,
    ) {
       
    }

    ngOnInit() {
        this.getAllStorages();
        this.menuItems = [
            {
                "label": "Register Alert Source",
                command: () => {
                    console.log("Alert Source registered");
                    this.showAlertSourceDialog(this.selectStorage);
                },
                disabled:false
            },
            {
                "label": "Remove Alert Source",
                command: () => {
                    console.log("Alert Source removed");
                },
                disabled:false
            },
            {
                "label": this.i18n.keyID['sds_block_volume_delete'],
                command: () => {
                    this.batchDeleteStorages(this.selectStorage);
                },
                disabled:false
            }
        ];
        this.versionOptions = [
            {
                label: "SNMPV2C",
                value: 'SNMPv2v'
            },
            {
              label: "SNMPV3",
              value: 'SNMPv3'
            }
        ];

        this.securityLeveloptions = [
            {
                label: "NoAuthnoPriv",
                value: "NoAuthnoPriv"
            },
            {
                label: "AuthNoPriv",
                value: "AuthNoPriv"
            },
            {
                label: "AuthPriv",
                value: "AuthPriv"
            }
        ];

        this.authProtocolOptions = [
            {
                label: "MD5",
                value: "MD5"
            },
            {
                label: "SHA",
                value: "SHA"
            }
        ];

        this.privacyProtocolOptions = [
            {
                label: "3DES",
                value: "3DES"
            },
            {
                label: "DES",
                value: "DES"
            },
            {
                label: "AES",
                value: "AES"
            }
        ];

        this.registerAlertSourceForm = this.fb.group({
            'version': new FormControl('', Validators.required),
            'community_string': new FormControl(''),
            'username': new FormControl('', Validators.required),
            'engine_id': new FormControl(''),
            'security_level': new FormControl(''),
            'auth_protocol': new FormControl(''),
            'auth_key': new FormControl(''),
            'privacy_protocol': new FormControl(''),
            'privacy_key': new FormControl(''),
            'host': new FormControl('', {validators:[Validators.required, Validators.pattern(this.validRule.validIp)]})
        });
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

    showAlertSourceDialog(storage){
        this.showRegisterAlertSourceForm = true;
        this.v2cFields = false;
        this.v3Fields = false;
        this.selectedStorageId = storage['id']
        this.registerAlertSourceForm.reset();
    }

    prepareFormDataArray(value){
        let dataArr = {
            version: value['version'],
            username: value['username'],
            engine_id: value['engine_id'],
            security_level: value['security_level'],
            auth_protocol: value['auth_protocol'],
            auth_key: value['auth_key'],
            privacy_protocol: value['privacy_protocol'],
            privacy_key: value['privacy_key'],
            host: value['host'],
        };

        if(value['community_string']){
            dataArr['community_string'] = value['community_string'];
        }

        return dataArr;
    }
    setFormByVersion(version){
        switch (version) {
            case 'SNMPv2c':
                    this.v2cFields = true;
                    this.v3Fields = false;
                break;
            case 'SNMPv3':
                    this.v2cFields = false;
                    this.v3Fields = true;
                break;

            default:
                break;
        }
    }

    registerAlertSource(value){
        if(!this.registerAlertSourceForm.valid){
            for(let i in this.registerAlertSourceForm.controls){
                this.registerAlertSourceForm.controls[i].markAsTouched();
            }
            return;
        }
        let dataArr = this.prepareFormDataArray(value);

        this.ds.registerAlertSource(this.selectedStorageId, dataArr).subscribe((res)=>{
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: 'Storage device registered successfully.'});
            let queryParams = {
                "message": JSON.stringify({severity: 'success', summary: 'Success', detail: 'Storage device registered successfully.'})
            };
            this.router.navigate(['/delfin'], {queryParams: queryParams});
        }, (error) =>{
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: "Error", detail:"Something went wrong. Storage device could not be registered."});
            console.log("Something went wrong. Storage device could not be registered.", error);
        })
    }
}