import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService, Utils } from 'app/shared/api';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { AppService } from 'app/app.service';
import { I18nPluralPipe } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Message, MenuItem ,ConfirmationService} from '../../../components/common/api';
import { DelfinService } from '../../delfin/delfin.service';
import { TreeNode } from '../../../components/common/api';
import { isArray } from 'underscore';
import { OverlayPanel } from 'app/components/overlaypanel/overlaypanel';

let _ = require("underscore");
@Component({
    selector: 'app-delfin-storages',
    templateUrl: 'storages.component.html',
    providers: [ConfirmationService],
    styleUrls: [],
    animations: []
})
export class StoragesComponent implements OnInit {
    allArrays: TreeNode[];
    arrayTreeData: TreeNode[];
    allStorages: any = [];
    selectedStorages: any = [];
    selectedStorageId: any;
    selectStorage;
    showListView: boolean = false;
    menuItems: MenuItem[];
    capacityData: any;
    chartOptions: any;
    vendorOptions;
    modelOptions;
    allStorageModels;
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
    volumesArr = [];
    allVolumes: any = [];
    poolsArr = [];
    allPools: any = [];
    dataSource: any = [];
    totalRecords: number;
    loading: boolean;
    storageOverview;
    volumeOverview;
    poolOverview;
    groupedByVendor;
    totalArrayRawCapacity: any;
    totalArrayUsableCapacity: any;
    totalArrayFreeCapacity: any;
    allActiveAlerts: any = [];
    scrollerData: any = [];
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
        free_capacity: "Free Capacity",
        used_capacity: "Used Capacity",
        total_capacity: "Total Capacity",
        raw_capacity: "Raw capacity",
        subscribed_capacity: "Subscribed Capacity",
        id: "ID",

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
        'validIp': '((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}' /* Validates IPv4 address */
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
        this.loading = true;
        this.getAllStorages();
        this.getAllActiveAlerts();
        
        this.menuItems = [
            {
                "label": "Register Alert Source",
                command: () => {
                    this.showAlertSourceDialog(this.selectStorage);
                },
                disabled:false
            },
            {
                "label": "Remove Alert Source",
                command: () => {
                    console.log("Alert Source removed");
                    //TODO: Add remove alert source
                },
                disabled:false
            },
            {
                "label": "Sync Storage Device",
                command: () => {
                    this.syncStorage(this.selectStorage.id);
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
        this.vendorOptions = [
            {
                label: "Dell EMC",
                value: 'dellemc'
            },
            {
                label: "Huawei",
                value: 'huawei'
            },
            {
                label: "Fake Storage",
                value: 'fake_storage'
            }
        ];

        this.allStorageModels = {
            'dellemc' : [
                {
                    label: "VMAX3",
                    value: 'vmax'
                },
                {
                    label: "VMAX4",
                    value: 'vmax4'
                }
            ],
            'huawei' : [
                {
                    label: "OceanStor V3",
                    value: 'oceanstor'
                }
            ],
            'fake_storage' : [
                {
                    label: "Fake Driver",
                    value: 'fake_driver'
                }
            ]
        };
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

    getAllActiveAlerts(){
       this.allActiveAlerts = [];
    }

    toggleView(){
        this.showListView = this.showListView ? this.showListView : !this.showListView;
    }
    
    getAllStorages(){
        this.allStorages = [];
        
        this.ds.getAllStorages().subscribe((res)=>{
            
            let storages = res.json().storages;
            
            this.allStorages = storages;

            this.allStorages.forEach((element, index) => {
                //Calculate the capacities for the Widgets
                element['capacity'] = {};
                let percentUsage = Math.ceil((element['used_capacity']/element['total_capacity']) * 100);
                element['capacity'].used = Utils.formatBytes(element['used_capacity']);
                element['capacity'].free = Utils.formatBytes(element['free_capacity']);
                element['capacity'].total = Utils.formatBytes(element['total_capacity']);
                element['capacity'].raw = Utils.formatBytes(element['raw_capacity']);
                element['capacity'].subscribed = Utils.formatBytes(element['subscribed_capacity']);
                let system_used = Math.ceil((element['raw_capacity'] - element['total_capacity']));
                element['system_used_capacity'] = system_used;
                element['capacity'].system_used = Utils.formatBytes(element['system_used_capacity']) ;
                element['capacity'].usage = percentUsage;
                
                element['volumes'] = [];
                element['storagePools'] = [];
                let vols = [];
                let pools = [];
                this.ds.getAllVolumes().subscribe((res)=>{
                    this.allVolumes = res.json().volumes;
                    this.allVolumes.forEach(volElement => {
                        if(volElement['storage_id'] == element['id']){
                            vols.push(volElement);
                        }
                    });
                }, (error)=>{
                    console.log("Something went wrong. Could not fetch Volumes.", element['id'], error)
                });
                
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
                element['volumes'] = vols;
                element['storagePools'] = pools;
            });

            // Invoke prepareTree() to prepare the tree structure for the widget
            this.prepareTree(this.allStorages);
            this.loading = false;

        }, (error)=>{
            console.log("Something went wrong. Could not fetch all storages", error);
            this.loading = false;
        })
        
    }

    showChart(){
        
    }

    getStorageArrayRawCapacity(storages){

    }

    getStorageArrayUsableCapacity(){

    }

    syncAllStorages(){

    }

    syncStorage(storageId){
        this.ds.syncStorageById(storageId).subscribe((res)=>{
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: 'Sync request has been sent. Please check back in some time.'});
            this.getAllStorages();
        }, (error)=>{
            this.msgs = [];
            let errorMsg = 'Error Syncing device.' + error.error_msg;
            this.msgs.push({severity: 'error', summary: 'Error', detail: error});
            console.log("Something went wrong. Could not initiate the sync.", error);
        });
    }
    getVolumesByStorage(storageId){
        this.ds.getAllVolumes().subscribe((res)=>{
            this.allVolumes = res.json().volumes;
            this.allVolumes.forEach(element => {
                if(element['storage_id'] == storageId){
                    this.volumesArr.push(element);
                }
            });
            this.totalRecords = this.dataSource.length;
            this.volumesArr = this.dataSource.slice(0, 10);
            
            return this.volumesArr;
        }, (error)=>{
            console.log("Something went wrong. Could not fetch Volumes.", error)
            this.volumesArr = [];
            return this.volumesArr;
        });
    }

    getPoolsByStorage(storageId){
        this.ds.getAllStoragePools().subscribe((res)=>{
            this.allPools  = res.json().storage_pools;
            this.allPools.forEach(element => {
                if(element['storage_id'] == storageId){
                    this.poolsArr.push(element);
                }
            });
            this.totalRecords = this.dataSource.length;
            this.poolsArr = this.dataSource.slice(0, 10);
            
            return this.poolsArr;
        }, (error)=>{
            console.log("Something went wrong. Could not fetch pools.", error)
            this.poolsArr = [];
            return this.poolsArr;
        });
    }

    groupStorageByVendor(storages){
        let group = _.groupBy(storages, 'vendor');
        return group;
    }

    prepareTree(storages){
        let self = this;
        let treeData = [];
        // Group the Storage Devices by Vendors
        let groupedData = this.groupStorageByVendor(storages);
        // Prepare the tree object with Top level Vendors as the first nodes
        _.each(groupedData, function(value, key){
            let parentTreeNode = {
                label: key,
                collapsedIcon: 'fa-folder',
                expandedIcon: 'fa-folder-open',
                type: 'array'
            }
            // Check if if the grouped devices exist and prepare the second level of nodes as children.
            if(isArray(value) && value.length){
                parentTreeNode['children'] = [];
                _.each(value, function(storageDevice){
                    let parentTreeNodeChild = {
                        label: storageDevice['name'],
                        collapsedIcon: 'fa-hdd-o',
                        expandedIcon: 'fa-hdd-o',
                        children: [],
                        type: 'device',
                        details: storageDevice
                    }
                    // Populate Volumes children
                    let parentVolNode = {};
                    if(storageDevice['volumes'] && storageDevice['volumes'].length){
                        parentVolNode = {
                            label : "Volumes",
                            collapsedIcon: 'fa-database',
                            expandedIcon: 'fa-database',
                            type: 'volParent',
                            children: []
                        }
                        parentTreeNodeChild['children'].push(parentVolNode);
                    }
                    
                    // Push each storage device as a child of the vendor node
                    parentTreeNode['children'].push(parentTreeNodeChild);
                });
            }
            // Push each Vendor as a node in the Tree
            treeData.push(parentTreeNode);
        })
        this.arrayTreeData = treeData;
        
    }

    lazyLoadTreeChildren(event){

    }

    //Show the overview panel when hovering on device in the tree.
    showOverview(event, storage, overlaypanel: OverlayPanel){
        this.storageOverview = storage;
        overlaypanel.toggle(event);
    }

    getModelsByVendor(vendor){
        let self =this;
        _.each(this.allStorageModels, function(value, key){
            if(key==vendor){
                self.modelOptions = value;
            }
        })
    }

    returnSelectedStorage(selectedStorage){
        this.selectStorage = selectedStorage;
    }

    batchDeleteStorages(storages){
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