import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
    selectedAlertSource;
    showListView: boolean = false;
    menuItems: MenuItem[];
    contextMenuItems: MenuItem[];
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
    vendorOverView;
    modelOverview;
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
        extra_attributes: "Extra Attributes",
        created_at: "Registered At",
        updated_at: "Updated At",
        firmware_version: "Firmware Version",
        serial_number : "Serial Number",
        location : "Location",
        free_capacity: "Free Capacity",
        used_capacity: "Used Capacity",
        total_capacity: "Total Capacity",
        raw_capacity: "Raw capacity",
        subscribed_capacity: "Subscribed Capacity",
        system_used: "System Used",
        id: "Delfin ID",
        sync_status : "Sync Status"

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
        "host": "Host",
        "port": "Port",
        "context_name" : "Context Name",
        "retry_num" : "Max Retries",
        "expiration" : "Expiration time (sec)"
    }

    errorMessage = {
        "version" : {
            required: "Version is required"
        },
        "community_string" : {
            required: "Community String is required"
        },
        "username" : {
            required: "Username is required"
        },
        "engine_id" : {
            required: "Engine ID is required"
        },
        "security_level" : {
            required: "Security Level is required"
        },
        "auth_protocol" : {
            required: "Auth Protocol is required"
        },
        "auth_key" : {
            required: "Auth key is required"
        },
        "privacy_protocol" : {
            required: "Privacy Protocol is required"
        },
        "privacy_key" : {
            required: "Privacy key is required"
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
        private ActivatedRoute: ActivatedRoute,
    ) {
        this.msgs = [];
            this.ActivatedRoute.queryParamMap.subscribe(params => {
                let message = params.get('message');
                if(message){
                    this.msgs.push(JSON.parse(message));
                }
            });
    }

    ngOnInit() {
        this.loading = true;
        this.getAllStorages();
        
        
        this.menuItems = [
            {
                "label": "Update Access Info",
                command: () => {
                    this.updateAccessInfo(this.selectStorage);
                },
                disabled:false
            },
            {
                "label": "Configure Alert Source",

                command: () => {
                    this.showAlertSourceDialog(this.selectStorage);
                },
                disabled:false
            },
            {
                "label": "Remove Alert Source",
                command: () => {
                    
                    this.showDeleteAlertSource(this.selectStorage);
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
                label: "HPE",
                value: 'hpe'
            },
            {
                label: "Fake Storage",
                value: 'fake_storage'
            }
        ];

        this.allStorageModels = {
            'dellemc' : [
                {
                    label: "VMAX",
                    value: 'vmax'
                }
            ],
            'huawei' : [
                {
                    label: "OceanStor",
                    value: 'oceanstor'
                }
            ],
            'hpe' : [
                {
                    label: "3PAR",
                    value: '3par'
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
                value: 'SNMPv2c'
            },
            {
              label: "SNMPV3",
              value: 'SNMPv3'
            }
        ];
        // Supported security levels
        // ['authPriv', 'authNoPriv', 'noAuthnoPriv']
        this.securityLeveloptions = [
            {
                label: "noAuthnoPriv",
                value: "noAuthnoPriv"
            },
            {
                label: "authNoPriv",
                value: "authNoPriv"
            },
            {
                label: "authPriv",
                value: "authPriv"
            }
        ];
        // Supported Auth Protocols
        //['HMACSHA', 'HMACMD5', 'HMCSHA2224', 'HMCSHA2256', 'HMCSHA2384', 'HMCSHA2512']
        this.authProtocolOptions = [
            {
                label: "HMACSHA",
                value: "HMACSHA"
            },
            {
                label: "HMACMD5",
                value: "HMACMD5"
            },
            {
                label: "HMCSHA2224",
                value: "HMCSHA2224"
            },
            {
                label: "HMCSHA2256",
                value: "HMCSHA2256"
            },
            {
                label: "HMCSHA2384",
                value: "HMCSHA2384"
            },
            {
                label: "HMCSHA2512",
                value: "HMCSHA2512"
            }
        
        ];
        //Supported Types
        //['DES', 'AES', 'AES192', 'AES256', '3DES']
        this.privacyProtocolOptions = [
            {
                label: "DES",
                value: "DES"
            },
            {
                label: "AES",
                value: "AES"
            },
            {
                label: "AES192",
                value: "AES192"
            },
            {
                label: "AES256",
                value: "AES256"
            },
            {
                label: "3DES",
                value: "3DES"
            },
            
            
        ];

        this.registerAlertSourceForm = this.fb.group({});
           
    }
    updateAccessInfo(storage){
        this.router.navigate(['/modifyStorage', storage['id']]);
    }
    getAllActiveAlerts(){
        this.ds.getAllAlerts().subscribe((res)=>{
            this.allActiveAlerts = res.json().alerts;
        }, (error)=>{
            this.allActiveAlerts = [];
            console.log("Something went wrong. Could not fetch alerts.", error);
            this.msgs = [];
            let errorMsg = 'Error fetching alerts.' + error.error_msg;
            this.msgs.push({severity: 'error', summary: 'Error', detail: error});
        })
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
                let alerts = [];

                //Get all Alerts for the storage
                this.ds.getAlertsByStorageId(element['id']).subscribe((res)=>{
                    alerts = res.json().alerts;
                    element['alerts'] = alerts;
                }, (error)=>{
                    console.log("Something went wrong. Could not fetch Alerts for storage.", error)
                });

                // Get all the Storage pools associated with the Storage device
                this.ds.getAllStoragePools(element['id']).subscribe((res)=>{
                    pools = res.json().storage_pools;
                    element['storagePools'] = pools;
                }, (error)=>{
                    console.log("Something went wrong. Could not fetch Storage Pools.", error)
                });

                // Get all the volumes associated with the Storage device
                this.ds.getAllVolumes(element['id']).subscribe((res)=>{
                    vols = res.json().volumes;
                    element['volumes'] = vols;
                }, (error)=>{
                    console.log("Something went wrong. Could not fetch Volumes.", error)
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
                        position: 'bottom'
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

    groupStorageByVendor(storages){
        let group = _.groupBy(storages, 'vendor');
        return group;
    }
    groupStorageByModel(storages){
        let group = _.groupBy(storages, function(item){
            return item.model.toLowerCase();
        });
        return group;
    }

    // This method
    prepareTree(storages){
        let self = this;
        let treeData = [];
        // Group the Storage Devices by Vendors
        let groupedByVendorData = this.groupStorageByVendor(storages);

        
        // Prepare the tree object with Top level Vendors as the first nodes
        _.each(groupedByVendorData, function(value, key){
            
            // Group the devices by models.
            let groupedByModelData = self.groupStorageByModel(value);
            

            let vendorTreeNode = {
                label: key,
                collapsedIcon: 'fa-folder',
                expandedIcon: 'fa-folder-open',
                type: 'array'
            }

            // Populate the vendor tree node with children grouped by models.
            if(isArray(value) && value.length){
                vendorTreeNode['children'] = [];
                _.each(groupedByModelData, function(modelValue, modelKey){
                    let modelGroupNode = {
                        label: modelKey,
                        collapsedIcon: 'fa-folder',
                        expandedIcon: 'fa-folder-open',
                        type: 'modelGroup',
                        children: [],
                        details: {
                            totalUsableCapacity: 0,
                            totalFreeCapacity: 0,
                            totalUsedCapacity: 0,
                            totalUsagePercent: 0,
                            totalRawCapacity: 0,
                            totalSubscribedCapacity: 0,
                            totalSystemUsedCapacity: 0,
                            displayTotal: "",
                            displayFree: "",
                            displayUsed: "",
                            displayRaw: "",
                            displaySubscribed: "",
                            displaySystemUsed: ""
                        }
                    }
                    if(isArray(modelValue) && modelValue.length){
                        _.each(modelValue, function(storageDevice){
                            let modelTreeNode = {
                                label: storageDevice['name'],
                                collapsedIcon: 'fa-hdd-o',
                                expandedIcon: 'fa-hdd-o',
                                children: [],
                                type: 'device',
                                details: storageDevice
                            }
                            //Create the capacity stats for each model group by summing together the capacity of each device
                            modelGroupNode.details.totalUsableCapacity+=storageDevice['total_capacity'];
                            modelGroupNode.details.totalUsedCapacity+=storageDevice['used_capacity'];
                            modelGroupNode.details.totalFreeCapacity+=storageDevice['free_capacity'];
                            modelGroupNode.details.totalRawCapacity+=storageDevice['raw_capacity'];
                            modelGroupNode.details.totalSubscribedCapacity+=storageDevice['subscribed_capacity'];
                            modelGroupNode.details.totalUsagePercent = Math.ceil((storageDevice['used_capacity']/storageDevice['total_capacity']) * 100);
                            modelGroupNode.details.totalSystemUsedCapacity = Math.ceil((storageDevice['raw_capacity'] - storageDevice['total_capacity']));
                            
                            // Create the Volume parent Node
                            
                            let parentVolNode = {};
                            if(storageDevice['volumes'] ){
                                parentVolNode = {
                                    label : "Volumes",
                                    collapsedIcon: 'fa-database',
                                    expandedIcon: 'fa-database',
                                    type: 'volParent',
                                    children: []
                                }
                                modelTreeNode['children'].push(parentVolNode);
                            }
                            let volChildNode ={};
                            if(storageDevice['volumes'].length){
                                _.each(storageDevice['volumes'], function(volItem){
                                    volChildNode = {
                                        label : volItem['name'],
                                        collapsedIcon: 'fa-database',
                                        expandedIcon: 'fa-database',
                                        type: 'volNode',
                                        details: volItem
                                    }
                                })
                                
                            }
                            // Create the Storage Pool parent Node
                            let parentPoolNode = {};
                            if(storageDevice['storagePools']){
                                parentPoolNode = {
                                    label : "Storage Pools",
                                    collapsedIcon: 'fa-cubes',
                                    expandedIcon: 'fa-cubes',
                                    type: 'poolParent',
                                    children: []
                                }
                                modelTreeNode['children'].push(parentPoolNode);
                            }

                            // Push each storage device as a child of the model node
                            modelGroupNode['children'].push(modelTreeNode);
                        });
                    }
                    
                    modelGroupNode.details.displayTotal = Utils.formatBytes(modelGroupNode.details.totalUsableCapacity);
                    modelGroupNode.details.displayFree = Utils.formatBytes(modelGroupNode.details.totalFreeCapacity);
                    modelGroupNode.details.displayUsed = Utils.formatBytes(modelGroupNode.details.totalUsedCapacity);
                    modelGroupNode.details.displayRaw = Utils.formatBytes(modelGroupNode.details.totalRawCapacity);
                    modelGroupNode.details.displaySubscribed = Utils.formatBytes(modelGroupNode.details.totalSubscribedCapacity);
                    modelGroupNode.details.displaySystemUsed = Utils.formatBytes(modelGroupNode.details.totalSystemUsedCapacity);
                    
                    vendorTreeNode['children'].push(modelGroupNode);
                });
            }
            
            // Push each Vendor as a node in the Tree
            treeData.push(vendorTreeNode);
        })
        this.arrayTreeData = treeData;
        
    }
    public deviceNodeMenu(event, node, overlaypanel: OverlayPanel) {
       overlaypanel.hide();
       this.getAlertSourcebyStorage(node['details'].id);
        if(node['type']='device'){
            this.contextMenuItems = [
                {
                    "label": "Update Access Info",
                    command: () => {
                        this.updateAccessInfo(node['details']);
                    },
                    disabled:false
                },
                {
                    "label": "Configure Alert Source",
                    command: () => {
                        this.showAlertSourceDialog(node['details']);
                    },
                    disabled:false
                },
                {
                    "label": "Remove Alert Source",
                    command: () => {
                        
                        this.showDeleteAlertSource(node['details']);
                    },
                    disabled:false
                },
                {
                    "label": "Sync Storage Device",
                    command: () => {
                        this.syncStorage(node['details'].id);
                    },
                    disabled:false
                },
                {
                    "label": this.i18n.keyID['sds_block_volume_delete'],
                    command: () => {
                        this.batchDeleteStorages(node['details']);
                    },
                    disabled:false
                }
            ];
        } else{
            this.contextMenuItems = [];
        }
        
        return false;
    }



    showChart(){
        
    }

    refreshAllLists(){
        this.getAllStorages();

    }

    syncAllStorageDevices(){
        this.ds.syncAllStorages() .subscribe((res)=>{
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: 'Sync request has been sent. Please check back in some time.'});
            this.getAllStorages();
        }, (error)=>{
            this.msgs = [];
            let errorMsg = 'Error Syncing devices.' + error.error_msg;
            this.msgs.push({severity: 'error', summary: 'Error', detail: error});
            console.log("Something went wrong. Could not initiate the sync.", error);
        });
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
        // Get all the volumes associated with the Storage device
        this.ds.getAllVolumes(storageId).subscribe((res)=>{
            let vols = res.json().volumes;
           return vols;
        }, (error)=>{
            console.log("Something went wrong. Could not fetch Volumes.", error)
        });
       
    }

    getPoolsByStorage(storageId){
       // Get all the Storage pools associated with the Storage device
       this.ds.getAllStoragePools(storageId).subscribe((res)=>{
            let pools = res.json().storage_pools;
            return pools;
        }, (error)=>{
            console.log("Something went wrong. Could not fetch Storage Pools.", error)
        });
       
    } 

    //Show the overview panel when hovering on device in the tree.
    showOverview(event, node, overlaypanel: OverlayPanel){
        let deviceOverlaypanel, modelOverlayPanel;
        switch (node.type) {
            case "device":
                this.storageOverview = node.details;
                deviceOverlaypanel = overlaypanel;
                deviceOverlaypanel.toggle(event);
                break;

            case "modelGroup":
                    this.modelOverview = node;
                    modelOverlayPanel = overlaypanel;
                    modelOverlayPanel.toggle(event);
                break;
        
            default:
                this.storageOverview = node;
                overlaypanel.toggle(event);
                break;
        }
        
    }

    getModelsByVendor(vendor){
        let self =this;
        _.each(this.allStorageModels, function(value, key){
            if(key==vendor){
                self.modelOptions = value;
            }
        })
    }

    onClickOperationMenu(selectedStorage){
        this.selectStorage = selectedStorage;
        this.ds.getAlertSource(selectedStorage['id']).subscribe((res)=>{
            let alertSource = res.json();
            
            this.selectedAlertSource = alertSource;
        }, (error)=>{
            console.log("Something went wrong. Could not fetch Alert source for storage.", error)
        });
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
                header: this.i18n.keyID['sds_common_delete'] + " Storage(s)",
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

    getAlertSourcebyStorage(storageId){
        if(storageId){
            this.ds.getAlertSource(storageId).subscribe((res)=>{
               let alertSource = res.json();
                this.selectedAlertSource = alertSource;
            }, (error)=>{
               console.log("Something went wrong. Could not fetch alert source.");
            })
        }
        
    }

    showAlertSourceDialog(storage){
        this.registerAlertSourceForm.addControl('version', this.fb.control(this.selectedAlertSource && this.selectedAlertSource['version'] ? this.selectedAlertSource['version'] : '', Validators.required))
        if(this.selectedAlertSource && this.selectedAlertSource['version']=='SNMPv2c'){
            this.selectedVersion = this.selectedAlertSource['version'];
            this.v2cFields = true;
        } else if(this.selectedAlertSource && this.selectedAlertSource['version']=='SNMPv3'){
            this.selectedVersion = this.selectedAlertSource['version'];
            this.v3Fields = true;
        } else{
            this.v2cFields = false;
            this.v3Fields = false;
        }
        this.registerAlertSourceForm.addControl('host', this.fb.control(this.selectedAlertSource && this.selectedAlertSource['host'] ? this.selectedAlertSource['host'] : '', Validators.required))
        this.registerAlertSourceForm.addControl('context_name', this.fb.control(this.selectedAlertSource && this.selectedAlertSource['context_name'] ? this.selectedAlertSource['context_name'] : ''))
        this.registerAlertSourceForm.addControl('retry_num', this.fb.control(this.selectedAlertSource && this.selectedAlertSource['retry_num'] ? this.selectedAlertSource['retry_num'] : 1))
        this.registerAlertSourceForm.addControl('expiration', this.fb.control(this.selectedAlertSource && this.selectedAlertSource['expiration'] ? this.selectedAlertSource['expiration'] : 2))
        this.registerAlertSourceForm.addControl('port', this.fb.control(this.selectedAlertSource && this.selectedAlertSource['port'] ? this.selectedAlertSource['port'] : 161))

        this.showRegisterAlertSourceForm = true;
        this.selectedStorageId = storage['id']
        this.setFormByVersion();
    }

    closeAlertSourceDialog(){
        this.selectedAlertSource = {};
        this.v2cFields = false;
        this.v3Fields = false;
        this.showRegisterAlertSourceForm = false;
    }
    

    setFormByVersion(){
        if(this.selectedVersion == 'SNMPv2c'){
            this.v2cFields = true;
            this.v3Fields = false;
            this.registerAlertSourceForm.addControl('community_string', this.fb.control(this.selectedAlertSource && this.selectedAlertSource['community_string'] ? this.selectedAlertSource['community_string'] : '', Validators.required));
            this.registerAlertSourceForm.removeControl('username');
            this.registerAlertSourceForm.removeControl('engine_id');
            this.registerAlertSourceForm.removeControl('security_level');
            this.registerAlertSourceForm.removeControl('auth_protocol');
            this.registerAlertSourceForm.removeControl('auth_key');
            this.registerAlertSourceForm.removeControl('privacy_protocol');
            this.registerAlertSourceForm.removeControl('privacy_key');
            
        }
        if(this.selectedVersion == 'SNMPv3'){
            this.v2cFields = false;
            this.v3Fields = true;
            this.registerAlertSourceForm.removeControl('community_string');
            this.registerAlertSourceForm.addControl('username', this.fb.control(this.selectedAlertSource && this.selectedAlertSource['username'] ? this.selectedAlertSource['username'] : '', Validators.required));
            this.registerAlertSourceForm.addControl('engine_id', this.fb.control(this.selectedAlertSource && this.selectedAlertSource['engine_id'] ? this.selectedAlertSource['engine_id'] : '', Validators.required));
            if(this.selectedAlertSource && this.selectedAlertSource['security_level']){
                this.selectedSecurityLevel = this.selectedAlertSource['security_level'];
            }
            this.registerAlertSourceForm.addControl('security_level', this.fb.control(this.selectedAlertSource && this.selectedAlertSource['security_level'] ? this.selectedAlertSource['security_level'] : '', Validators.required));
            this.registerAlertSourceForm.addControl('auth_protocol', this.fb.control(this.selectedAlertSource && this.selectedAlertSource['auth_protocol'] ? this.selectedAlertSource['auth_protocol'] : ''));
            this.registerAlertSourceForm.addControl('auth_key', this.fb.control(''));
            this.registerAlertSourceForm.addControl('privacy_protocol', this.fb.control(this.selectedAlertSource && this.selectedAlertSource['privacy_protocol'] ? this.selectedAlertSource['privacy_protocol'] : ''));
            this.registerAlertSourceForm.addControl('privacy_key', this.fb.control(''));
            this.onSelectSecuritylevel();
            if(this.selectedAlertSource && this.selectedAlertSource['auth_protocol']){
                this.selectedAuthProtocol = this.selectedAlertSource['auth_protocol'];
            }
            if(this.selectedAlertSource && this.selectedAlertSource['privacy_protocol']){
                this.selectedPrivacyProtocol = this.selectedAlertSource['privacy_protocol'];
            }
            
        }
    }
    onSelectSecuritylevel(){
        if(this.selectedSecurityLevel=='noAuthNoPriv'){
            this.registerAlertSourceForm.removeControl('auth_protocol');
            this.registerAlertSourceForm.removeControl('auth_key');
            this.registerAlertSourceForm.removeControl('privacy_protocol');
            this.registerAlertSourceForm.removeControl('privacy_key');
        }
        if(this.selectedSecurityLevel=='authNoPriv'){
            if(!this.registerAlertSourceForm.get('auth_protocol')){
                this.registerAlertSourceForm.addControl('auth_protocol', this.fb.control(this.selectedAlertSource && this.selectedAlertSource['auth_protocol'] ? this.selectedAlertSource['auth_protocol'] : '', Validators.required));
            }
            if(!this.registerAlertSourceForm.get('auth_key')){
                this.registerAlertSourceForm.addControl('auth_key', this.fb.control('', Validators.required));
            }
            this.registerAlertSourceForm.removeControl('privacy_protocol');
            this.registerAlertSourceForm.removeControl('privacy_key');
        }
        if(this.selectedSecurityLevel=='authPriv'){
            if(!this.registerAlertSourceForm.get('auth_protocol')){
                this.registerAlertSourceForm.addControl('auth_protocol', this.fb.control(this.selectedAlertSource && this.selectedAlertSource['auth_protocol'] ? this.selectedAlertSource['auth_protocol'] : '', Validators.required));
            }
            if(!this.registerAlertSourceForm.get('auth_key')){
                this.registerAlertSourceForm.addControl('auth_key', this.fb.control('', Validators.required));
            }
            if(!this.registerAlertSourceForm.get('privacy_protocol')){
                this.registerAlertSourceForm.addControl('privacy_protocol', this.fb.control(this.selectedAlertSource && this.selectedAlertSource['privacy_protocol'] ? this.selectedAlertSource['privacy_protocol'] : '', Validators.required));
                
            }
            if(!this.registerAlertSourceForm.get('privacy_key')){
                this.registerAlertSourceForm.addControl('privacy_key', this.fb.control('', Validators.required));
            }
            
        }
    }

    
    prepareFormDataArray(value){
        let dataArr = {
            version: value['version'],
            host: value['host'],
            port: value['port'],
            retry_num: value['retry_num'],
            expiration: value['expiration'],
            context_name: value['context_name'],
        };

        if(this.v3Fields){
            dataArr['username'] = value['username'];
            dataArr['engine_id'] = value['engine_id'];
            dataArr['security_level'] = value['security_level'];
            dataArr['auth_protocol'] = value['auth_protocol'];
            dataArr['auth_key'] = value['auth_key'];
            dataArr['privacy_protocol'] = value['privacy_protocol'];
            dataArr['privacy_key'] = value['privacy_key'];
        }
        if(this.v2cFields && value['community_string']){
            dataArr['community_string'] = value['community_string'];
        }

        return dataArr;
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
            this.showRegisterAlertSourceForm=false;
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: 'Alert source registered successfully.'});
        }, (error) =>{
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: "Error", detail:"Something went wrong. Alert source could not be registered."});
            console.log("Something went wrong. Alert source could not be registered.", error);
        })
    }

    showDeleteAlertSource(storage){
        let  msg = "<h3>Are you sure you want to delete the alert source?</h3>"; 
        this.confirmationService.confirm({
            message: msg,
            header: this.i18n.keyID['sds_common_delete'] + " Alert source",
            acceptLabel: this.i18n.keyID['sds_block_volume_delete'],
            isWarning: true,
            accept: ()=>{
                    this.deleteAlertSource(storage.id)
            },
            reject:()=>{}
        })
    }

    deleteAlertSource(storageId){
        this.ds.deleteAlertSource(storageId).subscribe((res)=>{
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: 'Alert source deleted successfully.'});
            this.registerAlertSourceForm.reset();
            this.selectedAuthProtocol = '';
        }, (error)=>{
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: "Error", detail:"Something went wrong. Alert source could not be deleted."});
            console.log("Something went wrong. Alert source could not be deleted.", error);
        })
    }
}

