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
    label = {
        name: "Name",
        description: "Description",
        createdAt: "Created At",
        updatedAt: "Updated At",
        hostName: "Name",
        ip: "IP Address",
        port: "Port",
        status: "Status",
        osType: "OS",
        accessMode: "Access Mode",
        availabilityZones: "Availability Zones",
        initiators: "Initiators",
        storage_id: "Storage ID",
        native_storage_host_id: "Native Storage Host ID"
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
                if(view['native_storage_host_group_id']){
                    console.log("Native Host Group ID exists: ", view['native_storage_host_group_id']);
                    console.log("Fetch ")
                } else if(view['native_storage_host_id']){
                    console.log("Native Storage Host ID exists: ", view['native_storage_host_id']);
                    this.ds.getAllStorageHosts(storageId, view['native_storage_host_id']).subscribe((res)=>{
                        let storageHost = res.json().storage_hosts;
                        view['storageHost'] = storageHost[0];
                        console.log("Storage Host Details:", storageHost);
                    }, (error)=>{
                        console.log("Something went wrong. Could not fetch storage host.")
                    })
                } else if(view['storage_host_initiators'] && view['storage_host_initiators'].length){
                    console.log("Storage Host Initiators List: ", view['storage_host_initiators']);
                    view['storageHostInitiatorsCount'] = view['storage_host_initiators'].length;
                }


                if(view['native_volume_group_id']){
                    console.log("Native Volume Group ID exists: ", view['native_volume_group_id']);
                    console.log("Fetch ")
                } else if(view['volumes'] && view['volumes'].length){
                    console.log("Volumes List: ", view['volumes']);
                    view['volumesCount'] = view['volumes'].length;
                }

                if(view['native_port_group_id']){
                    console.log("Native Port Group ID exists: ", view['native_port_group_id']);
                    console.log("Fetch ")
                } else if(view['ports'] && view['ports'].length){
                    console.log("Ports List: ", view['ports']);
                    view['portsCount'] = view['ports'].length;
                }
            });
            console.log("All Masking views", allViews);
            this.allMaskingViews = allViews;
            
        }, (error)=>{
            console.log("Something went wrong. Could not fetch masking views.")
        });
    }

    refreshAllLists() {
        this.getAllMaskingViews(this.selectedStorage);
    }

    showDetailsView(item, src?){
      console.log("Masking View Details:", item);
      switch (src) {
            case 'maskingView': this.detailsLabels.heading = "Masking View Details";
              
              break;
            case 'storageHost': this.detailsLabels.heading = "Storage Host Details";
              
              break;
            case 'volumesList': this.detailsLabels.heading = "Volumes List";
              
              break;
            case 'portsList': this.detailsLabels.heading = "Ports List";
              
              break;
            case 'initiatorsList': this.detailsLabels.heading = "Initiators List";
              
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
      this.detailsObj = [];
      this.showRightSidebar = false;
    }
    
}
