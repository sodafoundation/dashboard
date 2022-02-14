import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener, PipeTransform, Pipe, Input,  } from '@angular/core';
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


@Component({
    selector: "app-delfin-masking-views",
    templateUrl: "masking-views.component.html",
    providers: [ConfirmationService],
    styleUrls: [],
    animations: [],
})
export class MaskingViewsComponent implements OnInit {
    @Input() selectedStorage;

    selectedStorageId: any;
    showRightSidebar: boolean = false;
    showDetails: boolean = false;
    selectedMaskingView: any;
    allMaskingViews: any;
    msgs: Message[];
    detailsLabels = {
        heading: ""
    }
    detailSource: any;
    detailsObj: any;
    hostLabel = {
        name: "Name",
        description: "Description",
        createdAt: "Created At",
        updatedAt: "Updated At",
        hostName: "Name",
        ip: "IP Address",
        status: "Status",
        osType: "OS",
        accessMode: "Access Mode",
        availabilityZones: "Availability Zones",
        initiators: "Initiators",
        storage_id: "Storage ID",
        native_storage_host_id: "Native Host ID",
        native_storage_host_group_id: "Native Storage Host Group ID",
        id: "Delfin ID",
    };
    volumeLabel = {
        name: this.i18n.keyID["sds_block_volume_name"],
        description: this.i18n.keyID["sds_block_volume_descri"],
        wwn: "WWN",
        native_volume_id: "Native Volume ID",
        native_volume_group_id: "Native Volume Group ID",
        storage_id: "Storage ID",
        compressed: "Compressed",
        deduplicated: "Deduplicated",
        status: "Status",
        created_at: "Created At",
        updated_at: "Updated At",
        free_capacity: "Free Capacity",
        used_capacity: "Used Capacity",
        total_capacity: "Total Capacity",
        id: "Delfin ID",
    };
    portLabel = {
        name: this.i18n.keyID["sds_block_volume_name"],
        description: this.i18n.keyID["sds_block_volume_descri"],
        native_port_id: "Native Port ID",
        native_port_group_id:"Native Port Group ID",
        storage_id: "Storage ID",
        cpu_info: "CPU Info",
        soft_version: "Software Version",
        connection_status: "Connection Status",
        health_status: "Health Status",
        type: "Type",
        logical_type: "Logical Type",
        speed: "Speed",
        max_speed: "Max Speed",
        native_parent_id: "Native parent ID",
        wwn: "WWN",
        mac_address: "MAC Address",
        ipv4: "IPV4",
        ipv4_mask: "IPV4 Mask",
        ipv6: "IPV6",
        ipv6_mask: "IPV6 Mask",
        created_at: "Created At",
        updated_at: "Updated At",
        memory_size: "Memory Size",
        location: "Location",
        id: "Delfin ID",
    };

    constructor(
        public i18n: I18NService,
        public ds: DelfinService,
        private confirmationService: ConfirmationService,
        private fb: FormBuilder,
        private router: Router,
        private ActivatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.selectedStorageId = this.selectedStorage;
        this.getAllMaskingViews(this.selectedStorage);
    }

    getAllMaskingViews(storageId){
        this.ds.getAllMaskingViews(storageId).subscribe((res)=>{
            let allViews = res.json().masking_views
            
            
            allViews.forEach(view => {
                view['storageHostInitiatorsCount'] = 0;
                view['volumesCount'] = 0;
                view['storageHost'] = {};
                if(view['native_storage_host_group_id'] && view['native_storage_host_group_id'] != ""){
                    this.ds.getAllStorageHostGroups(storageId, view['native_storage_host_group_id']).subscribe((res)=>{
                        let storageHostGroup = res.json().storage_host_groups;
                        view['storageHostGroup'] = storageHostGroup[0];
                        if(storageHostGroup && storageHostGroup.length){
                            view['storageHostGroup'] = storageHostGroup[0];
                            view['storage_hosts'] = storageHostGroup[0].storage_hosts ? storageHostGroup[0].storage_hosts : [];
                        }  
                    }, (error)=>{
                        console.log("Something went wrong. Could not fetch storage host group.")
                    })
                } else if(view['native_storage_host_id'] && view['native_storage_host_id'] != ""){
                    this.ds.getAllStorageHosts(storageId, view['native_storage_host_id']).subscribe((res)=>{
                        let storageHost = res.json().storage_hosts;
                        view['storageHost'] = storageHost[0];
                    }, (error)=>{
                        console.log("Something went wrong. Could not fetch storage host.")
                    })
                } else if(view['storage_host_initiators'] && view['storage_host_initiators'].length){
                    view['storageHostInitiatorsCount'] = view['storage_host_initiators'].length;
                }


                if(view['native_volume_group_id'] && view['native_volume_group_id'] != ""){
                    this.ds.getAllVolumeGroups(storageId, view['native_volume_group_id']).subscribe((res)=>{
                        let volumeGroup = res.json().volume_groups;
                        if(volumeGroup && volumeGroup.length){
                            view['volumeGroup'] = volumeGroup[0];
                            view['volumes'] = volumeGroup[0].volumes ? volumeGroup[0].volumes : [];
                        }                        
                    }, (error)=>{
                        console.log("Something went wrong. Could not fetch volume groups.")
                    })
                } else if(view['native_volume_id'] && view['native_volume_id'] != ""){
                    //view['volumesCount'] = view['volumes'].length;
                    this.ds.getAllVolumes(storageId, view['native_volume_id']).subscribe((res)=>{
                        let volume = res.json().volumes[0];
                        //Calculate the capacities 
                        volume['capacity'] = {};
                        let percentUsage = Math.ceil((volume['used_capacity']/volume['total_capacity']) * 100);
                        volume['capacity'].used = Utils.formatBytes(volume['used_capacity']);
                        volume['capacity'].free = Utils.formatBytes(volume['free_capacity']);
                        volume['capacity'].total = Utils.formatBytes(volume['total_capacity']);
                        volume['capacity'].usage = percentUsage;
                        view['volume'] = volume;
                    }, (error)=>{   
                        console.log("Something went wrong. Could not fetch volume details.")
                    })
                }

                if(view['native_port_group_id'] && view['native_port_group_id'] != ""){
                    this.ds.getAllPortGroups(storageId, view['native_port_group_id']).subscribe((res)=>{
                        let portGroup = res.json().port_groups;
                        if(portGroup && portGroup.length){
                            view['portGroup'] = portGroup[0];
                            view['ports'] = portGroup[0].ports ? portGroup[0].ports : [];
                        }                        
                    }, (error)=>{
                        console.log("Something went wrong. Could not fetch port groups.")
                    })
                } 
            });
            this.allMaskingViews = allViews;
            
        }, (error)=>{
            console.log("Something went wrong. Could not fetch masking views.")
        });
    }

    refreshAllLists() {
        this.getAllMaskingViews(this.selectedStorage);
    }

    showDetailsView(item, src?){
      switch (src) {
            case 'maskingView': this.detailsLabels.heading = "Masking View Details";
              
              break;
            case 'storageHostGroup': this.detailsLabels.heading = "Storage Host Group Details";
              
              break;
            case 'volumeGroup': this.detailsLabels.heading = "Volume Group Details";
              
              break;
            case 'portGroup': this.detailsLabels.heading = "Port Group Details";
              
              break;
            case 'storageHost': this.detailsLabels.heading = "Storage Host Details";
              
              break;
            case 'volumesList': this.detailsLabels.heading = "Volume Details";
              
              break;
            case 'portsList': this.detailsLabels.heading = "Port Details";
              
              break;
            case 'maskingViewInitiatorsList': this.detailsLabels.heading = "Storage Host Initiators";
              
              break;
              
      
          default:
              break;
      }
      this.detailSource=src;
      this.showDetails = true;
      this.selectedMaskingView = item;
      this.detailsObj = item;
      this.showRightSidebar = true;
    }
    closeSidebar(){
      this.showDetails = false;
      this.showRightSidebar = false;
    }
    
}
