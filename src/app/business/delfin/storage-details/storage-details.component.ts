import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener, PipeTransform, Pipe,  } from '@angular/core';
import { DomSanitizer } from "@angular/platform-browser";
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService, Utils, Consts} from 'app/shared/api';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { AppService } from 'app/app.service';
import { I18nPluralPipe } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Message, MenuItem ,ConfirmationService} from '../../../components/common/api';
import { DelfinService } from '../delfin.service';


let _ = require("underscore");

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }
  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

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
    perfMetricsConfigForm: any;
    showperfMetricsConfigForm: boolean = false;
    performanceMonitorURL: any = "";
    volumesExist: boolean = false;
    poolsExist: boolean = false;
    controllersExist: boolean = false;
    portsExist: boolean = false;
    disksExist: boolean = false;
    qtreesExist: boolean = false;
    filesystemsExist: boolean = false;
    sharesExist: boolean = false;
    quotasExist: boolean = false;
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
                url: '/resource-monitor' 
            }
        ];
        this.getStorageVolumes(this.selectedStorageId);
        this.getStoragePools(this.selectedStorageId);
        this.perfMetricsConfigForm = this.fb.group({
            'perf_collection': new FormControl(true, Validators.required),
            'interval': new FormControl(10, Validators.required),
            "is_historic": new FormControl(true, Validators.required)            
        });
        this.performanceMonitorURL = "http://" + Consts.SODA_HOST_IP + ":" + Consts.SODA_GRAFANA_PORT + "/d/Tut2q3AMk/performance-monitor-storage-details?orgId=1&refresh=30s&var-filters=storage_id%7C%3D%7C" + this.selectedStorageId + "&kiosk";
        
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
            case 3:
                this.detailsTabIndex = 3;
                break;
            case 4:
                this.detailsTabIndex = 4;
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
            case 2:
                this.configTabIndex = 2;
                break;
            case 3:
                this.configTabIndex = 3;
                break;
            case 4:
                this.configTabIndex = 4;
                break;
            case 5:
                this.configTabIndex = 5;
                break;
            case 6:
                this.configTabIndex = 6;
                break;
            case 7:
                this.configTabIndex = 7;
                break;
            case 8:
                this.configTabIndex = 8;
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
        this.ds.getStorageById(id).subscribe((storageRes)=>{
            let storageDevice;
            storageDevice = storageRes.json();
            this.ds.getAccessinfoByStorageId(this.selectedStorageId).subscribe((res)=>{
                let accessInfo = res.json();
                storageDevice['delfin_model'] = accessInfo['model'];
                this.volumesExist = _.contains(Consts.STORAGES.resources.volumes, accessInfo['model']);
                this.poolsExist = _.contains(Consts.STORAGES.resources.pools, accessInfo['model']);
                this.controllersExist = _.contains(Consts.STORAGES.resources.controllers, accessInfo['model']);
                this.portsExist = _.contains(Consts.STORAGES.resources.ports, accessInfo['model']);
                this.disksExist = _.contains(Consts.STORAGES.resources.disks, accessInfo['model']);
                this.qtreesExist = _.contains(Consts.STORAGES.resources.qtrees, accessInfo['model']);
                this.filesystemsExist = _.contains(Consts.STORAGES.resources.filesystems, accessInfo['model']);
                this.sharesExist = _.contains(Consts.STORAGES.resources.shares, accessInfo['model']);
                this.quotasExist = _.contains(Consts.STORAGES.resources.quotas, accessInfo['model']);
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
            },(error)=>{
    
            });
            
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
        this.allActiveAlerts = [];
        this.ds.getAllAlerts().subscribe((res)=>{
            let alertsFromAlertManager = res.json().data;
            alertsFromAlertManager.forEach(element => {
                if(element.labels.storage_id == storageId){
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
                    this.allActiveAlerts.push(alert);
                }
            });
        }, (error)=>{
            this.allActiveAlerts = [];
            console.log("Something went wrong. Could not fetch alerts.", error);
            this.msgs = [];
            let errorMsg = 'Error fetching alerts.' + error.error_msg;
            this.msgs.push({severity: 'error', summary: 'Error', detail: error});
        })
        
    }
    showPerfConfigDialog(){
        
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
}
