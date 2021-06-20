import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener, PipeTransform, Pipe, Input,  } from '@angular/core';
import { DomSanitizer } from "@angular/platform-browser";
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService, Utils, Consts} from 'app/shared/api';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { AppService } from 'app/app.service';
import { I18nPluralPipe } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Message, MenuItem ,ConfirmationService} from '../../../../components/common/api';
import { DelfinService } from '../../delfin.service';


let _ = require("underscore");


@Component({
    selector: "app-delfin-masking-views-details",
    templateUrl: "masking-views-details.component.html",
    providers: [ConfirmationService],
    styleUrls: [],
    animations: [],
})
export class MaskingViewsDetailsComponent implements OnInit {
    @Input() selectedStorage;
    showRightSidebar: boolean = false;
    showDetails: boolean = false;
    selectedMaskingView: any;
    allMaskingViews: any;
    msgs: Message[];

    label = {
      name: "Name",
      description: "Description",
      createdAt: "Created At",
      updatedAt: "Updated At",
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
        // this.showGraph();
        this.getAllMaskingViews(this.selectedStorage);
    }

    getAllMaskingViews(storageId){
        this.ds.getAllMaskingViews(storageId).subscribe((res)=>{
            let allViews = res.json().masking_views
            
            
            allViews.forEach(view => {
                view['storageHostInitiatorsCount'] = 0;
                view['volumesCount'] = 0;
                if(view['native_storage_host_group_id']){
                    console.log("Native Host Group ID exists: ", view['native_storage_host_group_id']);
                    console.log("Fetch ")
                } else if(view['native_storage_host_id']){
                    console.log("Native Storage Host ID exists: ", view['native_storage_host_id']);
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

    showMaskingViewDetails(maskingView){
      console.log("Masking View Details:", maskingView);
      this.showDetails = true;
      this.selectedMaskingView = maskingView;
      this.showRightSidebar = true;
    }
    closeSidebar(){
      this.showDetails = false;
      
      this.showRightSidebar = false;
    }
    
}
