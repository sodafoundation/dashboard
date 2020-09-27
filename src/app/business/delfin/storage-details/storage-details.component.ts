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
    allStorageVolumes: any = [];
    allVolumesCountAndCapacity;
    allStoragePools: any = [];
    allPoolsCountAndCapacity
    selectedStorage: any;
    selectedStorageId: any;
    items: any;
    usableCapacityChartData: any;
    usableCapacityChartOptions: any;
    rawCapacityChartData: any;
    rawCapacityChartOptions: any;
    volumesCapacityChartData: any;
    volumesCapacityChartOptions: any;
    poolsCapacityChartData: any;
    poolsCapacityChartOptions: any;
    allActiveAlerts: any = [];
    detailsTabIndex: number = 0;
    configTabIndex: number = 0;
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

    constructor(
        private ActivatedRoute: ActivatedRoute,
        public i18n: I18NService,
        private confirmationService: ConfirmationService,
        private fb: FormBuilder,
        private ds: DelfinService
    ) {
        this.ActivatedRoute.params.subscribe((params) => {
            this.selectedStorageId = params.storageId;
        });
        
    }

    ngOnInit() {
        this.getStorageById(this.selectedStorageId);
        
        this.items = [
            { 
                label: "Storages", 
                url: '/monitor' 
            },
            { 
                label: "Storage Details", 
                url: '/storageDetails' 
            }
        ];
        this.getStorageVolumes(this.selectedStorageId);
        this.getStoragePools(this.selectedStorageId);
        
    }
    changeDetailsTab(e){
        let index = e.index;
        switch (index) {
            case 0:
                this.detailsTabIndex = 0;
                this.configTabIndex = 0;
                this.getStorageById(this.selectedStorageId);
                break;
            case 1:
                this.detailsTabIndex = 1;
                this.refreshAllLists();
                this.prepareCapacityCharts(this.selectedStorage);
                break;
            case 2:
                this.detailsTabIndex = 2;
                this.getAllActiveAlerts(this.selectedStorageId);
                break;
            default:
                break;
        }
    }

    changeConfigTab(e){
        let index = e.index;
        switch (index) {
            case 0:
                this.configTabIndex = 0;
                break;
            case 1:
                this.configTabIndex = 1;
                break;
            default:
                break;
        }
    }

    refreshAllLists(){
        this.getStorageById(this.selectedStorageId);
        this.getStorageVolumes(this.selectedStorageId);
        this.getStoragePools(this.selectedStorageId);
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
            let storageDevice;
            storageDevice = res.json();
            storageDevice['capacity'] = {};
            let percentUsage = Math.ceil((storageDevice['used_capacity']/storageDevice['total_capacity']) * 100);
            storageDevice['capacity'].used = Utils.formatBytes(storageDevice['used_capacity']);
            storageDevice['capacity'].free = Utils.formatBytes(storageDevice['free_capacity']);
            storageDevice['capacity'].total = Utils.formatBytes(storageDevice['total_capacity']);
            storageDevice['capacity'].raw = Utils.formatBytes(storageDevice['raw_capacity']);
            storageDevice['capacity'].subscribed = Utils.formatBytes(storageDevice['subscribed_capacity']);
            let system_used = Math.ceil((storageDevice['raw_capacity'] - storageDevice['total_capacity']));
            storageDevice['system_used_capacity'] = system_used;
            storageDevice['capacity'].system_used = Utils.formatBytes(storageDevice['system_used_capacity']) ;
            storageDevice['capacity'].usage = percentUsage;

            this.selectedStorage = storageDevice;
        }, (error)=>{
            console.log("Something went wrong. Could not fetch storage", error);
        })
    }

    getStorageVolumes(id){
        let countAndCapacity = {
            'total' : 0,
            'total_capacity' : 0,
            'used_capacity' : 0,
            'free_capacity' : 0,
            'displayTotal' : null,
            'displayUsed' : null,
            'displayFree' : null
        };
        // Get all the volumes associated with the Storage device
        this.ds.getAllVolumes(id).subscribe((res)=>{
            let vols = res.json().volumes;
            _.each(vols, function(volItem){
                countAndCapacity['total_capacity'] += volItem['total_capacity'];
                countAndCapacity['used_capacity'] += volItem['used_capacity'];
                countAndCapacity['free_capacity'] += volItem['free_capacity'];
            })
            countAndCapacity['total'] = vols.length;
            countAndCapacity['displayTotal'] = Utils.formatBytes(countAndCapacity['total_capacity']);
            countAndCapacity['displayUsed'] = Utils.formatBytes(countAndCapacity['used_capacity']);
            countAndCapacity['displayFree'] = Utils.formatBytes(countAndCapacity['free_capacity']);
            this.allStorageVolumes = vols;
            this.allVolumesCountAndCapacity = countAndCapacity;
        }, (error)=>{
            console.log("Something went wrong. Could not fetch Volumes.", error)
        });
    }

    getStoragePools(id){
        let countAndCapacity = {
            'total' : 0,
            'total_capacity' : 0,
            'used_capacity' : 0,
            'free_capacity' : 0,
            'displayTotal' : null,
            'displayUsed' : null,
            'displayFree' : null
        };
        this.ds.getAllStoragePools(id).subscribe((res)=>{
            let pools = res.json().storage_pools;
            _.each(pools, function(poolItem){
                countAndCapacity['total_capacity'] += poolItem['total_capacity'];
                countAndCapacity['used_capacity'] += poolItem['used_capacity'];
                countAndCapacity['free_capacity'] += poolItem['free_capacity'];
            })
            countAndCapacity['total'] = pools.length;
            countAndCapacity['displayTotal'] = Utils.formatBytes(countAndCapacity['total_capacity']);
            countAndCapacity['displayUsed'] = Utils.formatBytes(countAndCapacity['used_capacity']);
            countAndCapacity['displayFree'] = Utils.formatBytes(countAndCapacity['free_capacity']);
            this.allStoragePools = pools;
            this.allPoolsCountAndCapacity = countAndCapacity;
        }, (error)=>{
            console.log("Something went wrong. Could not fetch Storage Pools.", error)
        });
    }
    prepareCapacityCharts(storage){
        this.usableCapacityChartData = {
            labels: ['Used: ' + storage['capacity'].used,'Free: ' + storage['capacity'].free],
            datasets: [
                {
                    data: [storage['used_capacity'], storage['free_capacity']],
                    backgroundColor: [
                        'rgba(219, 68, 55, 0.5)',
                        'rgba(103, 178, 20, 0.5)',
                      ],
                      borderColor: [
                        'rgba(219, 68, 55,1)',
                        'rgba(103, 178, 20, 1)',
                      ],
                    borderWidth: 1,
                    hoverBackgroundColor: [
                        'rgba(219, 68, 55, 1)',
                        'rgba(103, 178, 20, 1)'
                    ]
                }]    
        };
        this.usableCapacityChartOptions = {
            legend: {
                display: true,
                position: 'right',
                labels: {
                    fontColor: 'rgb(0,0,0)',
                    fontSize: 14
                }
            },
            tooltips: {
              callbacks: {
                title: function(tooltipItem, data) {
                  return data['labels'][tooltipItem[0]['index']];
                },
                label: function(tooltipItem, data) {
                },
                afterLabel: function(tooltipItem, data) {
                }
              },
              backgroundColor: '#ccc',
              titleFontSize: 14,
              titleFontColor: '#0066ff',
              bodyFontColor: '#000',
              bodyFontSize: 14,
              displayColors: false
            }
        };

        this.rawCapacityChartData = {
            labels: ['Total Capacity: ' + storage['capacity'].total,'System Used: ' + storage['capacity'].system_used],
            datasets: [
                {
                    data: [storage['total_capacity'], storage['system_used_capacity']],
                    backgroundColor: [
                        'rgba(0, 109, 226, 0.5)',
                        'rgba(68, 68, 68, 0.5)'
                    ],
                    borderColor : [
                        'rgba(0, 109, 226,1)',
                        'rgba(68, 68, 68, 1)'
                    ],
                    borderWidth: 1,
                    hoverBackgroundColor: [
                        'rgba(0, 109, 226, 1)',
                        'rgba(68, 68, 68, 1)'
                    ]
                }]    
        };
        this.rawCapacityChartOptions = {
            legend: {
                display: true,
                position: 'right',
                labels: {
                    fontColor: 'rgb(0,0,0)',
                    fontSize: 14
                }
            },
            tooltips: {
              callbacks: {
                title: function(tooltipItem, data) {
                  return data['labels'][tooltipItem[0]['index']];
                },
                label: function(tooltipItem, data) {
                  
                },
                afterLabel: function(tooltipItem, data) {
                   
                }
              },
              backgroundColor: '#ccc',
              titleFontSize: 14,
              titleFontColor: '#0066ff',
              bodyFontColor: '#000',
              bodyFontSize: 14,
              displayColors: false
            }
          };
          this.volumesCapacityChartData = {
            labels: ['Used: ' + this.allVolumesCountAndCapacity['displayUsed'], 'Free: ' + this.allVolumesCountAndCapacity['displayFree']],
            datasets: [
                {
                    data: [this.allVolumesCountAndCapacity['used_capacity'], this.allVolumesCountAndCapacity['free_capacity']],
                    backgroundColor: [
                        'rgba(219, 68, 55, 0.5)',
                        'rgba(94, 186, 204, 1)',
                      ],
                      borderColor: [
                        'rgba(219, 68, 55,1)',
                        'rgba(94, 186, 204, 1)',
                      ],
                    borderWidth: 1,
                    hoverBackgroundColor: [
                        'rgba(219, 68, 55, 1)',
                        'rgba(94, 186, 204, 1)'
                    ]
                }]    
        };
        this.volumesCapacityChartOptions = {
            legend: {
                display: true,
                position: 'right',
                labels: {
                    fontColor: 'rgb(0,0,0)',
                    fontSize: 14
                }
            },
            tooltips: {
              callbacks: {
                title: function(tooltipItem, data) {
                  return data['labels'][tooltipItem[0]['index']];
                },
                label: function(tooltipItem, data) {
                },
                afterLabel: function(tooltipItem, data) {
                }
              },
              backgroundColor: '#ccc',
              titleFontSize: 14,
              titleFontColor: '#0066ff',
              bodyFontColor: '#000',
              bodyFontSize: 14,
              displayColors: false
            }
        };

        this.poolsCapacityChartData = {
            labels: ['Used: ' + this.allPoolsCountAndCapacity['displayUsed'], 'Free: ' + this.allPoolsCountAndCapacity['displayFree']],
            datasets: [
                {
                    data: [this.allPoolsCountAndCapacity['used_capacity'], this.allPoolsCountAndCapacity['free_capacity']],
                    backgroundColor: [
                        'rgba(219, 68, 55, 0.5)',
                        'rgba(48, 210, 255, 1)',
                      ],
                      borderColor: [
                        'rgba(219, 68, 55,1)',
                        'rgba(48, 210, 255, 1)',
                      ],
                    borderWidth: 1,
                    hoverBackgroundColor: [
                        'rgba(219, 68, 55, 1)',
                        'rgba(48, 210, 255, 1)'
                    ]
                }]    
        };
        this.poolsCapacityChartOptions = {
            legend: {
                display: true,
                position: 'right',
                labels: {
                    fontColor: 'rgb(0,0,0)',
                    fontSize: 14
                }
            },
            tooltips: {
              callbacks: {
                title: function(tooltipItem, data) {
                  return data['labels'][tooltipItem[0]['index']];
                },
                label: function(tooltipItem, data) {
                },
                afterLabel: function(tooltipItem, data) {
                }
              },
              backgroundColor: '#ccc',
              titleFontSize: 14,
              titleFontColor: '#0066ff',
              bodyFontColor: '#000',
              bodyFontSize: 14,
              displayColors: false
            }
        };

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

    getAllActiveAlerts(storageId){
        this.ds.getAlertsByStorageId(storageId).subscribe((res)=>{
            this.allActiveAlerts = res.json().alerts;
        }, (error)=>{
            this.allActiveAlerts = [];
            console.log("Something went wrong. Could not fetch alerts.", error);
            this.msgs = [];
            let errorMsg = 'Error fetching alerts.' + error.error_msg;
            this.msgs.push({severity: 'error', summary: 'Error', detail: error});
        })
        // FIXME ALERTS DUMMY DATA
        /* this.allActiveAlerts.push(
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
        ); */
        // FIXME ALERTS DUMMY DATA
    }
}
