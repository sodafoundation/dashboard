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
    showListView: boolean = true;
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
        this.loading = true;
        this.getAllStorages();
        this.getAllActiveAlerts();
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
        this.allActiveAlerts.push(
            {
                'alert_id' : '255911',
                'alert_name' : 'TP VV allocation failure',
                'severity' : 'Critical',
                'category' : 'Fault',
                'type' : 'EquipmentAlarm',
                'sequence_number' : 657,
                'occur_time' : 1514140673000,
                'description' : 'Thin provisioned VV LUN_performance_test.531 unable to allocate SD space from CPG cpg_zhu',
                'resource_type' : 'Storage',
                'location' : 'sw_vv:20656:LUN_performance_test.899',
                'storage_id' : '4ec28b27-0d3d-4876-8da7-a16876ea489c',
                'storage_name' : 'HPEDevice',
                'vendor' : 'HPE',
                'model' : 'HP_3PAR 8450',
                'serial_number' : 'XXYYZZ1234'
            },
            {
                'alert_id' : '255912',
                'alert_name' : 'Storage Array Usable Free Space is less than 20%',
                'severity' : 'Critical',
                'category' : 'Fault',
                'type' : 'EquipmentAlarm',
                'sequence_number' : 658,
                'occur_time' : 1514140673010,
                'description' : 'Storage Array Usable Free Space is less than 20% was triggered.',
                'resource_type' : 'Storage',
                'location' : 'sw_vv:20656:LUN_performance_test.900',
                'storage_id' : '4ec28b27-0d3d-4876-8da7-a16876ea479c',
                'storage_name' : 'DellVMAX250F',
                'vendor' : 'Dell EMC',
                'model' : 'VMAX250F',
                'serial_number' : 'XXYY5678'
            },
            {
                'alert_id' : '255915',
                'alert_name' : 'Pool Usable Free Space is less than 20%',
                'severity' : 'Warning',
                'category' : 'Fault',
                'type' : 'EquipmentAlarm',
                'sequence_number' : 659,
                'occur_time' : 1514140674050,
                'description' : 'Pool Usable Free Space is less than 20% was triggered.',
                'resource_type' : 'Storage',
                'location' : 'sw_vv:20656:LUN_performance_test.900',
                'storage_id' : '4ec28b27-0d3d-4876-8da7-a16876ea479c',
                'storage_name' : 'OceanStorV3',
                'vendor' : 'Huawei',
                'model' : 'OceanStor V3',
                'serial_number' : 'XXYY9101'
            },
            {
                'alert_id' : '255811',
                'alert_name' : 'TP VV allocation failure',
                'severity' : 'Critical',
                'category' : 'Fault',
                'type' : 'EquipmentAlarm',
                'sequence_number' : 657,
                'occur_time' : 1514140673000,
                'description' : 'Thin provisioned VV LUN_performance_test.531 unable to allocate SD space from CPG cpg_zhu',
                'resource_type' : 'Storage',
                'location' : 'sw_vv:20656:LUN_performance_test.899',
                'storage_id' : '4ec28b27-0d3d-4876-8da7-a16876ea489c',
                'storage_name' : 'HPEDevice',
                'vendor' : 'HPE',
                'model' : 'HP_3PAR 8450',
                'serial_number' : 'XXYYZZ1234'
            },
            {
                'alert_id' : '255812',
                'alert_name' : 'Storage Array Usable Free Space is less than 20%',
                'severity' : 'Critical',
                'category' : 'Fault',
                'type' : 'EquipmentAlarm',
                'sequence_number' : 658,
                'occur_time' : 1514140673010,
                'description' : 'Storage Array Usable Free Space is less than 20% was triggered.',
                'resource_type' : 'Storage',
                'location' : 'sw_vv:20656:LUN_performance_test.900',
                'storage_id' : '4ec28b27-0d3d-4876-8da7-a16876ea479c',
                'storage_name' : 'DellVMAX250F',
                'vendor' : 'Dell EMC',
                'model' : 'VMAX250F',
                'serial_number' : 'XXYY5678'
            },
            {
                'alert_id' : '255815',
                'alert_name' : 'Pool Usable Free Space is less than 20%',
                'severity' : 'Warning',
                'category' : 'Fault',
                'type' : 'EquipmentAlarm',
                'sequence_number' : 659,
                'occur_time' : 1514140674050,
                'description' : 'Pool Usable Free Space is less than 20% was triggered.',
                'resource_type' : 'Storage',
                'location' : 'sw_vv:20656:LUN_performance_test.900',
                'storage_id' : '4ec28b27-0d3d-4876-8da7-a16876ea479c',
                'storage_name' : 'OceanStorV3',
                'vendor' : 'Huawei',
                'model' : 'OceanStor V3',
                'serial_number' : 'XXYY9101'
            }
        );
    }

    toggleView(){
        this.showListView = this.showListView ? this.showListView : !this.showListView;
        console.log("ShowlistView", this.showListView);
    }
    
    getAllStorages(){
        this.ds.getAllStorages().subscribe((res)=>{
            
            this.allStorages = res.json().storages;
            
            this.allStorages.forEach((element, index) => {
                //console.log("Used Capacity", Utils.formatBytes(element['used_capacity']));
                //console.log("Free Capacity", Utils.formatBytes(element['free_capacity']));
                element['volumes'] = [];
                element['storagePools'] = [];
                let vols = [];
                let pools = [];
                /* this.ds.getAllVolumes().subscribe((res)=>{
                    this.allVolumes = res.json().volumes;
                    this.allVolumes.forEach(volElement => {
                        if(volElement['storage_id'] == element['id']){
                            vols.push(volElement);
                        }
                    });
                }, (error)=>{
                    console.log("Something went wrong. Could not fetch Volumes.", element['id'], error)
                });
                this.ds.getAllStoragePools().subscribe((res)=>{
                    this.allPools = res.json().storage_pools;
                    this.allPools.forEach(poolElement => {
                        if(poolElement['storage_id'] == element['id']){
                            pools.push(poolElement);
                        }
                    });
                }, (error)=>{
                    console.log("Something went wrong. Could not fetch Pools.", element['id'], error)
                }); */
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
                //element['pools'] = poolsInStorage;
                /* FIXME REMOVE BEFORE MERGING FOR LOCAL TESTING ONLY */
                
                if(index%2){
                    element['status'] = 'abnormal';
                    element['description'] = "This is a test for a very long description. If this is truncated it will be visible in the info tooltip."
                }
                /* FIXME REMOVE BEFORE MERGING FOR LOCAL TESTING ONLY */
            });
            this.allStorages.push(
                {
                    "created_at": "2020-07-20T06:12:18.882671",
                    "updated_at": "2020-07-20T06:12:19.906748",
                    "deleted_at": null,
                    "deleted": 0,
                    "id": "4ec28b27-0d3d-4876-8da7-a16876ea489c",
                    "name": "DellVMAX250F",
                    "vendor": "Dell EMC",
                    "description": "",
                    "model": "VMAX250F",
                    "status": "normal",
                    "serial_number": "000297801855",
                    "firmware_version": null,
                    "location": "",
                    "total_capacity": 26300318136401,
                    "used_capacity": 19835189765079,
                    "free_capacity": 6465128371322,
                    "sync_status": "SYNCED"
                },
                {
                    "created_at": "2020-07-20T06:12:18.882671",
                    "updated_at": "2020-07-20T06:12:19.906748",
                    "deleted_at": null,
                    "deleted": 0,
                    "id": "4ec28b27-0d3d-4876-8da7-a16876ea479c",
                    "name": "EMC-VMAX-123456",
                    "vendor": "Dell EMC",
                    "description": "",
                    "model": "VMAX250F",
                    "status": "normal",
                    "serial_number": "000297801856",
                    "firmware_version": null,
                    "location": "",
                    "total_capacity": 26300318136401,
                    "used_capacity": 19835189765079,
                    "free_capacity": 6465128371322,
                    "sync_status": "SYNCED"
                },
                {
                    "created_at": "2020-07-20T06:12:18.882671",
                    "updated_at": "2020-07-20T06:12:19.906748",
                    "deleted_at": null,
                    "deleted": 0,
                    "id": "4ec28b27-0d3d-4876-8da7-a16876ea469c",
                    "name": "OceanStor Dorado",
                    "vendor": "Huawei",
                    "description": "",
                    "model": "OceanStor V3",
                    "status": "normal",
                    "serial_number": "000297801856",
                    "firmware_version": null,
                    "location": "",
                    "total_capacity": 26300318136401,
                    "used_capacity": 19835189765079,
                    "free_capacity": 6465128371322,
                    "sync_status": "SYNCED"
                },
                {
                    "created_at": "2020-07-20T06:12:18.882671",
                    "updated_at": "2020-07-20T06:12:19.906748",
                    "deleted_at": null,
                    "deleted": 0,
                    "id": "4ec28b27-0d3d-4876-8da7-a16876ea459c",
                    "name": "OceanStor Dorado V3",
                    "vendor": "Huawei",
                    "description": "",
                    "model": "OceanStor V3",
                    "status": "normal",
                    "serial_number": "000297801856",
                    "firmware_version": null,
                    "location": "",
                    "total_capacity": 26300318136401,
                    "used_capacity": 19835189765079,
                    "free_capacity": 6465128371322,
                    "sync_status": "SYNCED"
                }
            );
            console.log("All Storages", this.allStorages);
            this.prepareTree(this.allStorages);
            this.loading = false;
        }, (error)=>{
            console.log("Something went wrong. Could not fetch all storages", error);
            this.loading = false;
        })
        
    }

    getStorageArrayRawCapacity(storages){

    }

    getStorageArrayUsableCapacity(){

    }

    getVolumesByStorage(storageId){
        this.ds.getAllVolumes().subscribe((res)=>{
            this.allVolumes = res.json().volumes;
            this.allVolumes.forEach(element => {
                if(element['storage_id'] == storageId){
                    this.volumesArr.push(element);
                }
            });
            //this.totalRecords = this.dataSource.length;
            //this.volumesArr = this.dataSource.slice(0, 10);
            console.log("Selected Volumes", this.volumesArr);
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
            //this.totalRecords = this.dataSource.length;
            //this.volumesArr = this.dataSource.slice(0, 10);
            console.log("Selected Pools", this.poolsArr);
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
        console.log("All Storage Arrays in preparing Tree", storages);
        
        // Group the Storage Devices by Vendors
        let groupedData = this.groupStorageByVendor(storages);
        
        console.log("Grouped Data", groupedData);
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
                console.log("Storage devices", value);
                _.each(value, function(storageDevice){
                    let parentTreeNodeChild = {
                        label: storageDevice['name'],
                        collapsedIcon: 'fa-hdd-o',
                        expandedIcon: 'fa-hdd-o',
                        children: [],
                        type: 'device'
                    }
                    // Populate Volumes children
                    let parentVolNode = {};
                    if(storageDevice['volumes'] && storageDevice['volumes'].length){
                        parentVolNode = {
                            label : "Volumes",
                            collapsedIcon: 'fa-database',
                            expandedIcon: 'fa-database',
                            type: 'volParent'
                        }
                        parentTreeNodeChild['children'].push(parentVolNode);
                    }
                    
                    
                    // Populate Storage Pool children
                    // let parentPoolNode;
                    //if(storageDevice['storagePools'] && storageDevice['storagePools'].length){
                        /* let parentPoolNode = {
                            label : "Pools",
                            collapsedIcon: 'fa-cubes',
                            expandedIcon: 'fa-cubes',
                            type: 'poolParent'
                        } */
                    //}
                    //parentTreeNodeChild['children'].push(parentPoolNode);
                    
                    /* // Populate Storage Pool children
                    if(storageDevice['storagePools'] && storageDevice['storagePools'].length){
                        parentTreeNodeChild['children'] = [];
                        _.each(storageDevice['storagePools'], function(poolItem){
                            let storageNode = {
                                label : poolItem['name'],
                                collapsedIcon: 'fa-cubes',
                                expandedIcon: 'fa-cubes'
                            }
                            parentTreeNodeChild['children'].push(storageNode)
                        });
                        
                    } */
                    // Push each storage device as a child of the vendor node
                    parentTreeNode['children'].push(parentTreeNodeChild);
                });
            }
            // Push each Vendor as a node in the Tree
            treeData.push(parentTreeNode);
        })
        this.arrayTreeData = treeData;
        console.log("Final Tree Data: ", this.arrayTreeData);
        this.allArrays = [
            {
                label: 'Folder 1',
                collapsedIcon: 'fa-folder',
                expandedIcon: 'fa-folder-open',
                children: [
                    {
                        label: 'Pool 1',
                        collapsedIcon: 'fa-hdd-o',
                        expandedIcon: 'fa-hdd-o',
                            children: [
                                {
                                    label: 'File 2',
                                    icon: 'fa-file-o'
                                }
                            ]
                    },
                    {
                        label: 'Folder 2',
                        collapsedIcon: 'fa-folder',
                        expandedIcon: 'fa-folder-open'
                    },
                    {
                        label: 'File 1',
                        icon: 'fa-file-o'
                    }
                ]
            },
            {
                label: 'Folder 2',
                collapsedIcon: 'fa-folder',
                expandedIcon: 'fa-folder-open',
                children: [
                    {
                        label: 'Pool 1',
                        collapsedIcon: 'fa-hdd-o',
                        expandedIcon: 'fa-hdd-o',
                        children: [
                            {
                                label: 'File 2',
                                icon: 'fa-file-o'
                            }
                        ]   
                    },
                    {
                        label: 'Folder 2',
                        collapsedIcon: 'fa-folder',
                        expandedIcon: 'fa-folder-open'
                    },
                    {
                        label: 'File 1',
                        icon: 'fa-file-o'
                    }
                ]
            },
            {
                label: 'Folder 3',
                collapsedIcon: 'fa-folder',
                expandedIcon: 'fa-folder-open',
                children: [
                    {
                        label: 'Pool 1',
                        collapsedIcon: 'fa-hdd-o',
                        expandedIcon: 'fa-hdd-o',
                        children: [
                            {
                                label: 'File 2',
                                icon: 'fa-file-o'
                            }
                        ]
                    },
                    {
                        label: 'Folder 2',
                        collapsedIcon: 'fa-folder',
                        expandedIcon: 'fa-folder-open'
                    },
                    {
                        label: 'File 1',
                        icon: 'fa-file-o'
                    }
                ]
            }
        ];
    }

    lazyLoadTreeChildren(event){

    }

    showOverview(event, storage, overlaypanel: OverlayPanel){
        this.storageOverview = storage;
        console.log("Overlayshown", this.storageOverview);
        overlaypanel.toggle(event);
    }
    overviewNode(event, node){
        console.log("Event", event);
        console.log("Node", node);
    }
    /* showVolumeOverview(event, volume, overlaypanel: OverlayPanel){
        this.volumeOverview = volume;
        console.log("Overlayshown", this.volumeOverview);
        overlaypanel.toggle(event);
    } */

    /* showPoolOverview(event, pool, overlaypanel: OverlayPanel){
        this.poolOverview = pool;
        console.log("Overlayshown", this.poolOverview);
        overlaypanel.toggle(event);
    } */

    getModelsByVendor(vendor){
        let self =this;
        _.each(this.allStorageModels, function(value, key){
            console.log("storage models value", value);
            console.log("storage models key", key);
            if(key==vendor){
                self.modelOptions = value;
            }
        })
        console.log("modeloptions", self.modelOptions);
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