import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Consts, I18NService, Utils } from 'app/shared/api';
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
    perfMetricsConfigForm: any;
    showperfMetricsConfigForm: boolean = false;
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
    controllerOverview;
    portOverview;
    diskOverview;
    parentOverview;
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

    perfMetricsConfigFormLabel = {
        "perf_collection": "Enable Performance collection?",
        "interval" : "Polling Interval (seconds)",
        "is_historic": "Enable Historic metric collection?"
    }

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
        this.getAllActiveAlerts();
        
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
                "label": "Configure Metric Collection",

                command: () => {
                    this.showPerfConfigDialog(this.selectStorage);
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
        //All Supported storage vendors
        this.vendorOptions = Consts.STORAGES.vendors;

        //All supported storage models based on vendors
        this.allStorageModels = Consts.STORAGES.models;

        // Alert Source Version options
        this.versionOptions = Consts.STORAGES.alertSourceVersionOptions;

        // Supported security levels
        // ['authPriv', 'authNoPriv', 'noAuthnoPriv']
        this.securityLeveloptions = Consts.STORAGES.securityLevelOptions;

        // Supported Auth Protocols
        //['HMACSHA', 'HMACMD5', 'HMCSHA2224', 'HMCSHA2256', 'HMCSHA2384', 'HMCSHA2512']
        this.authProtocolOptions = Consts.STORAGES.authProtocolOptions;
        
        //Supported Types
        //['DES', 'AES', 'AES192', 'AES256', '3DES']
        this.privacyProtocolOptions = Consts.STORAGES.privacyProtocolOptions;

        this.registerAlertSourceForm = this.fb.group({});
        this.perfMetricsConfigForm = this.fb.group({
            'perf_collection': new FormControl(true, Validators.required),
            'interval': new FormControl(10, Validators.required),
            "is_historic": new FormControl(true, Validators.required)            
        });
           
    }
    updateAccessInfo(storage){
        this.router.navigate(['/modifyStorage', storage['id']]);
    }
    getAllActiveAlerts(){
        this.allActiveAlerts = [];
        this.ds.getAllAlerts().subscribe((res)=>{
            let alertsFromAlertManager = res.json().data;
            let alertsArr = [];
            alertsFromAlertManager.forEach((element) => {
                let alert = {
                    'alert_id' : '',
                    'alert_name' : '',
                    'severity' : '',
                    'category' : '',
                    'type' : '',
                    'sequence_number' : 0,
                    'occur_time' : 0,
                    'description' : '',
                    'resource_type' : '',
                    'location' : '',
                    'storage_id' : '',
                    'storage_name' : '',
                    'vendor' : '',
                    'model' : '',
                    'serial_number' : '',
                    'recovery_advice' : ''
                };
                alert['alert_id'] = element.labels.alert_id ? element.labels.alert_id : '';
                if(element.labels.alert_name){
                    alert.alert_name = element.labels.alert_name ? element.labels.alert_name : '';
                } else if(element.labels.alertname){
                    alert.alert_name = element.labels.alertname ? element.labels.alertname : '';
                }
                alert['severity'] = element.labels.severity ? element.labels.severity : 'warning';
                alert['category'] = element.labels.category ? element.labels.category : 'Fault';
                alert['type'] = element.labels.type ? element.labels.type : '';
                alert['occur_time'] = element.startsAt ? element.startsAt : '';
                alert['description'] = element.annotations.description ? element.annotations.description : '-';
                alert['resource_type'] = element.labels.resource_type ? element.labels.resource_type : '';
                alert['sequence_number'] = element.labels.sequence_number ? element.labels.sequence_number : '-';
                alert['location'] = element.labels.location ? element.labels.location : '-';
                alert['storage_id'] = element.labels.storage_id ? element.labels.storage_id : '';
                alert['storage_name'] = element.labels.storage_name ? element.labels.storage_name : '-';
                alert['vendor'] = element.labels.vendor ? element.labels.vendor : '-';
                alert['model'] = element.labels.model ? element.labels.model : '-';
                alert['serial_number'] = element.labels.serial_number ? element.labels.serial_number : element.labels.storage_sn;
                alert['recovery_advice'] = element.labels.recovery_advice ? element.labels.recovery_advice : '-';
                alertsArr.push(alert);
            });
            this.allActiveAlerts = alertsArr;
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
                element['controllers'] = [];
                element['ports'] = [];
                element['disks'] = [];
                let vols = [];
                let pools = [];
                let controllers = [];
                let ports = [];
                let disks = [];

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

                // Get all the Controllers associated with the Storage device
                this.ds.getAllControllers(element['id']).subscribe((res)=>{
                    controllers = res.json().controllers;
                    element['controllers'] = controllers;
                }, (error)=>{
                    console.log("Something went wrong. Could not fetch Controllers.", error)
                });

                // Get all the Ports associated with the Storage device
                this.ds.getAllPorts(element['id']).subscribe((res)=>{
                    ports = res.json().ports;
                    element['ports'] = ports;
                }, (error)=>{
                    console.log("Something went wrong. Could not fetch Ports.", error)
                });
                
                // Get all the Disks associated with the Storage device
                this.ds.getAllDisks(element['id']).subscribe((res)=>{
                    disks = res.json().disks;
                    element['disks'] = disks;
                }, (error)=>{
                    console.log("Something went wrong. Could not fetch Disks.", error)
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
                element['controllers'] = controllers;
                element['ports'] = ports;
                element['disks'] = disks;
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
                styleClass: 'vendor-node',
                type: 'array',
                expanded: true
            }

            // Populate the vendor tree node with children grouped by models.
            if(isArray(value) && value.length){
                vendorTreeNode['children'] = [];
                _.each(groupedByModelData, function(modelValue, modelKey){
                    let modelGroupNode = {
                        label: modelKey,
                        collapsedIcon: 'fa-folder',
                        expandedIcon: 'fa-folder-open',
                        styleClass: 'model-node',
                        type: 'modelGroup',
                        expanded: true,
                        children: [],
                        details: {
                            totalUsableCapacity: 0,
                            totalFreeCapacity: 0,
                            totalUsedCapacity: 0,
                            totalUsagePercent: 0,
                            totalRawCapacity: 0,
                            totalSubscribedCapacity: 0,
                            totalSystemUsedCapacity: 0,
                            displayTotal: null,
                            displayFree: null,
                            displayUsed: null,
                            displayRaw: null,
                            displaySubscribed: null,
                            displaySystemUsed: null
                        }
                    }
                    if(isArray(modelValue) && modelValue.length){
                        _.each(modelValue, function(storageDevice){
                            let modelTreeNode = {
                                label: storageDevice['name'],
                                collapsedIcon: 'fa-hdd-o',
                                expandedIcon: 'fa-hdd-o',
                                styleClass: 'device-node',
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
                            
                            modelGroupNode.details.totalSystemUsedCapacity = Math.ceil((storageDevice['raw_capacity'] - storageDevice['total_capacity']));
                            
                            // Create the Volume parent Node
                            
                            let parentVolNode = {};
                            if(storageDevice['volumes'] ){
                                parentVolNode = {
                                    label : "Volumes",
                                    collapsedIcon: 'fa-database',
                                    expandedIcon: 'fa-database',
                                    type: 'volParent',
                                    styleClass: 'volume-parent-node',
                                    leaf: false,
                                    details: {
                                        totalUsableCapacity: 0,
                                        totalFreeCapacity: 0,
                                        totalUsedCapacity: 0,
                                        totalUsagePercent: 0,
                                        totalRawCapacity: 0,
                                        totalSubscribedCapacity: 0,
                                        totalSystemUsedCapacity: 0,
                                        displayTotal: null,
                                        displayFree: null,
                                        displayUsed: null,
                                        displayRaw: null,
                                        displaySubscribed: null,
                                        displaySystemUsed: null
                                    }
                                }
                                modelTreeNode['children'].push(parentVolNode);
                            }
                            // Create the Storage Pool parent Node
                            let parentPoolNode = {};
                            if(storageDevice['storagePools']){
                                parentPoolNode = {
                                    label : "Storage Pools",
                                    collapsedIcon: 'fa-cubes',
                                    expandedIcon: 'fa-cubes',
                                    styleClass: 'pool-parent-node',
                                    type: 'poolParent',
                                    leaf: false,
                                    details: {
                                        totalUsableCapacity: 0,
                                        totalFreeCapacity: 0,
                                        totalUsedCapacity: 0,
                                        totalUsagePercent: 0,
                                        totalRawCapacity: 0,
                                        totalSubscribedCapacity: 0,
                                        totalSystemUsedCapacity: 0,
                                        displayTotal: null,
                                        displayFree: null,
                                        displayUsed: null,
                                        displayRaw: null,
                                        displaySubscribed: null,
                                        displaySystemUsed: null
                                    }
                                }
                                modelTreeNode['children'].push(parentPoolNode);
                            }

                            // Create the Controller parent Node
                            let parentControllerNode = {};
                            if(storageDevice['controllers']){
                                parentControllerNode = {
                                    label : "Controllers",
                                    collapsedIcon: 'fa-microchip',
                                    expandedIcon: 'fa-microchip',
                                    styleClass: 'controller-parent-node',
                                    type: 'controllerParent',
                                    leaf: false
                                }
                                modelTreeNode['children'].push(parentControllerNode);
                            }

                            // Create the Port parent Node
                            let parentPortNode = {};
                            if(storageDevice['ports']){
                                parentPortNode = {
                                    label : "ports",
                                    collapsedIcon: 'fa-plug',
                                    expandedIcon: 'fa-plug',
                                    styleClass: 'port-parent-node',
                                    type: 'portParent',
                                    leaf: false
                                }
                                modelTreeNode['children'].push(parentPortNode);
                            }

                            // Create the Port parent Node
                            let parentDiskNode = {};
                            if(storageDevice['disks']){
                                parentDiskNode = {
                                    label : "Disks",
                                    collapsedIcon: 'fa-floppy-o',
                                    expandedIcon: 'fa-floppy-o',
                                    styleClass: 'disk-parent-node',
                                    type: 'diskParent',
                                    leaf: false
                                }
                                modelTreeNode['children'].push(parentDiskNode);
                            }

                            // Push each storage device as a child of the model node
                            modelGroupNode['children'].push(modelTreeNode);
                        });
                    }
                    modelGroupNode.details.totalUsagePercent = Math.ceil((modelGroupNode.details.totalUsedCapacity/modelGroupNode.details.totalUsableCapacity) * 100);
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

    // Invoked on expanding a parent node in the tree above
    
    loadNode(event){
        let self =this;
        //Check if the expanded node is a device

        if(event.node.type == 'device'){
            let device = event.node;

            //check each child if it is a Volume parent or Pool Parent
            _.each(device['children'], function(devChild){
                if(devChild['type']=='volParent'){
                    devChild['children'] = [];

                    // If Volume parent then iterate through all volumes and calculate the capacities and stats for 
                    // each volume parent and volume node

                    if(device['details'].volumes && device['details'].volumes.length){
                        let volChildNode ={};
                        _.each(device['details'].volumes, function(volItem){
                            //Calculate the capacities for the Volume
                            volItem['capacity'] = {};
                            let percentUsage = Math.ceil((volItem['used_capacity']/volItem['total_capacity']) * 100);
                            volItem['capacity'].used = Utils.formatBytes(volItem['used_capacity']);
                            volItem['capacity'].free = Utils.formatBytes(volItem['free_capacity']);
                            volItem['capacity'].total = Utils.formatBytes(volItem['total_capacity']);
                            volItem['capacity'].system_used = Utils.formatBytes(volItem['system_used_capacity']) ;
                            volItem['capacity'].usage = percentUsage;

                            //Create the capacity stats for each volume group by summing together the capacity of each device
                            devChild['details'].totalUsableCapacity+=volItem['total_capacity'];
                            devChild['details'].totalUsedCapacity+=volItem['used_capacity'];
                            devChild['details'].totalFreeCapacity+=volItem['free_capacity'];
                            
                            volChildNode = {
                                label : volItem['name'],
                                collapsedIcon: 'fa-database',
                                expandedIcon: 'fa-database',
                                styleClass: 'volume-node',
                                type: 'volNode',
                                details: volItem,
                            }
                            devChild['children'].push(volChildNode);
                        })

                        //Populate the display values
                        devChild['details'].totalUsagePercent = Math.ceil((devChild['details'].totalUsedCapacity/devChild['details'].totalUsableCapacity) * 100);
                        devChild['details'].displayTotal = Utils.formatBytes(devChild['details'].totalUsableCapacity);
                        devChild['details'].displayFree = Utils.formatBytes(devChild['details'].totalFreeCapacity);
                        devChild['details'].displayUsed = Utils.formatBytes(devChild['details'].totalUsedCapacity);
                        devChild['label'] = "Volumes " + "(" + devChild['children'].length + ")";
                    }
                } else if(devChild['type']=='poolParent'){
                    devChild['children'] = [];

                    // If pool parent then iterate through all storage pools and calculate the capacities and stats for 
                    // each pool parent and pool node

                    if(device['details'].storagePools && device['details'].storagePools.length){
                        let poolChildNode ={};
                        _.each(device['details'].storagePools, function(poolItem){
                            //Calculate the capacities for the Volume
                            poolItem['capacity'] = {};
                            let percentUsage = Math.ceil((poolItem['used_capacity']/poolItem['total_capacity']) * 100);
                            poolItem['capacity'].used = Utils.formatBytes(poolItem['used_capacity']);
                            poolItem['capacity'].free = Utils.formatBytes(poolItem['free_capacity']);
                            poolItem['capacity'].total = Utils.formatBytes(poolItem['total_capacity']);
                            poolItem['capacity'].usage = percentUsage;

                            //Create the capacity stats for each pool group by summing together the capacity of each device
                            devChild['details'].totalUsableCapacity+=poolItem['total_capacity'];
                            devChild['details'].totalUsedCapacity+=poolItem['used_capacity'];
                            devChild['details'].totalFreeCapacity+=poolItem['free_capacity'];
                            
                            poolChildNode = {
                                label : poolItem['name'],
                                collapsedIcon: 'fa-cubes',
                                expandedIcon: 'fa-cubes',
                                styleClass: 'pool-node',
                                type: 'poolNode',
                                details: poolItem,
                            }
                            devChild['children'].push(poolChildNode);
                        })
                        
                        //Populate the display values
                        devChild['details'].totalUsagePercent = Math.ceil((devChild['details'].totalUsedCapacity/devChild['details'].totalUsableCapacity) * 100);
                        devChild['details'].displayTotal = Utils.formatBytes(devChild['details'].totalUsableCapacity);
                        devChild['details'].displayFree = Utils.formatBytes(devChild['details'].totalFreeCapacity);
                        devChild['details'].displayUsed = Utils.formatBytes(devChild['details'].totalUsedCapacity);
                        devChild['label'] = "Storage Pools " + "(" + devChild['children'].length + ")";
                    }
                } else if(devChild['type']=='controllerParent'){
                    devChild['children']=[];

                    if(device['details'].controllers && device['details'].controllers.length){
                        let controllerChildNode = {};
                        _.each(device['details'].controllers, function(controllerItem){

                            controllerItem['displayMemory'] = Utils.formatBytes(controllerItem['memory_size']);
                            controllerChildNode = {
                                label: controllerItem['name'],
                                collapsedIcon: 'fa-microchip',
                                expandedIcon: 'fa-microchip',
                                styleClass: 'controller-node',
                                type: 'controllerNode',
                                details: controllerItem
                            }
                            devChild['children'].push(controllerChildNode);
                        });
                        devChild['label'] = "Controllers " + "(" + devChild['children'].length + ")";
                    }
                } else if(devChild['type']=='portParent'){
                    devChild['children']=[];

                    if(device['details'].ports && device['details'].ports.length){
                        let portChildNode = {};
                        _.each(device['details'].ports, function(portItem){

                            portItem['displayMemory'] = Utils.formatBytes(portItem['memory_size']);
                            portChildNode = {
                                label: portItem['name'],
                                collapsedIcon: 'fa-plug',
                                expandedIcon: 'fa-plug',
                                styleClass: 'port-node',
                                type: 'portNode',
                                details: portItem
                            }
                            devChild['children'].push(portChildNode);
                        });
                        devChild['label'] = "Ports " + "(" + devChild['children'].length + ")";
                    }
                } else if(devChild['type']=='diskParent'){
                    devChild['children']=[];

                    if(device['details'].disks && device['details'].disks.length){
                        let diskChildNode = {};
                        _.each(device['details'].disks, function(diskItem){

                            diskItem['displayCapacity'] = Utils.formatBytes(diskItem['capacity']);
                            diskChildNode = {
                                label: diskItem['name'],
                                collapsedIcon: 'fa-floppy-o',
                                expandedIcon: 'fa-floppy-o',
                                styleClass: 'port-node',
                                type: 'diskNode',
                                details: diskItem
                            }
                            devChild['children'].push(diskChildNode);
                        });
                        devChild['label'] = "Disks " + "(" + devChild['children'].length + ")";
                    }
                }
            })
        }
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
                    "label": "Configure Metric Collection",
    
                    command: () => {
                        this.showPerfConfigDialog(node['details']);
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
        this.getAllActiveAlerts();
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
        let deviceOverlaypanel, modelOverlayPanel, volumeParentOverlayPanel, poolParentOverlayPanel, controllerOverlayPanel, portOverlayPanel, diskOverlayPanel, volumeOverlayPanel, poolOverlayPanel;
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
            
            case "volParent":
                    this.parentOverview = node;
                    volumeParentOverlayPanel = overlaypanel;
                    volumeParentOverlayPanel.toggle(event);
                break;
            case "poolParent":
                    this.parentOverview = node;
                    poolParentOverlayPanel = overlaypanel;
                    poolParentOverlayPanel.toggle(event);
                break;
            case "volNode":
                    this.volumeOverview = node;
                    volumeOverlayPanel = overlaypanel;
                    volumeOverlayPanel.toggle(event);
                break;
            case "poolNode":
                    this.poolOverview = node;
                    poolOverlayPanel = overlaypanel;
                    poolOverlayPanel.toggle(event);
                break;
            case "controllerNode":
                    this.controllerOverview = node;
                    controllerOverlayPanel = overlaypanel;
                    controllerOverlayPanel.toggle(event);
                break;
            case "portNode":
                    this.portOverview = node;
                    portOverlayPanel = overlaypanel;
                    portOverlayPanel.toggle(event);
                break;
            case "diskNode":
                    this.diskOverview = node;
                    diskOverlayPanel = overlaypanel;
                    diskOverlayPanel.toggle(event);
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
    
    showPerfConfigDialog(storage){
        this.selectedStorageId = storage['id'];
        this.showperfMetricsConfigForm = true;
    }

    closePerfConfigDialog(){
        this.showperfMetricsConfigForm = false;
        this.perfMetricsConfigForm.reset({
            'perf_collection': true,
            'interval': 10,
            'is_historic': true
        });
    }

    configurePerformanceMetrics(value){
        if(!this.perfMetricsConfigForm.valid){
            for(let i in this.perfMetricsConfigForm.controls){
                this.perfMetricsConfigForm.controls[i].markAsTouched();
            }
            return;
        }
        let perfParam = {
            "array_polling":{
                "perf_collection" : value['perf_collection'],
                "interval": value['interval'],
                "is_historic": value['is_historic']
            }
        }

        this.ds.metricsConfig(this.selectedStorageId, perfParam).subscribe((res)=>{
            this.showperfMetricsConfigForm=false;
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: 'Performance metrics collection configured successfully.'});
            this.perfMetricsConfigForm.reset({
                'perf_collection': true,
                'interval': 10,
                'is_historic': true
            });
        }, (error) =>{
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: "Error", detail:"Something went wrong. Performance metrics collection could not be configured."});
            console.log("Something went wrong. Performance metrics collection could not be configured.", error);
            this.perfMetricsConfigForm.reset({
                'perf_collection': true,
                'interval': 10,
                'is_historic': true
            });
        })
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
            if(this.registerAlertSourceForm.get('privacy_protocol')){
                this.registerAlertSourceForm.removeControl('privacy_protocol');
            }
            if(this.registerAlertSourceForm.get('privacy_key')){
                this.registerAlertSourceForm.removeControl('privacy_key');
            }
        }
        if(this.selectedSecurityLevel=='authPriv'){
            if(!this.registerAlertSourceForm.get('privacy_protocol')){
                this.registerAlertSourceForm.addControl('privacy_protocol', this.fb.control(this.selectedAlertSource && this.selectedAlertSource['privacy_protocol'] ? this.selectedAlertSource['privacy_protocol'] : '', Validators.required));
                
            }
            if(!this.registerAlertSourceForm.get('privacy_key')){
                this.registerAlertSourceForm.addControl('privacy_key', this.fb.control('', Validators.required));
            }
            if(!this.registerAlertSourceForm.get('auth_protocol')){
                this.registerAlertSourceForm.addControl('auth_protocol', this.fb.control(this.selectedAlertSource && this.selectedAlertSource['auth_protocol'] ? this.selectedAlertSource['auth_protocol'] : '', Validators.required));
            }
            if(!this.registerAlertSourceForm.get('auth_key')){
                this.registerAlertSourceForm.addControl('auth_key', this.fb.control('', Validators.required));
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
            this.msgs.push({severity: 'error', summary: "Error", detail:"Something went wrong. Alert source could not be registered. \n" + error.json().error_msg});
            console.log("Something went wrong. Alert source could not be registered.", error.json().error_msg);
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

