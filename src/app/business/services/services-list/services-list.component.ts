import { Router } from '@angular/router';
import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { Message} from '../../../components/common/api';
import { I18NService, MsgBoxService } from 'app/shared/api';
import { trigger, state, style, transition, animate} from '@angular/animations';
import { WorkflowService } from '../workflow.service';
import * as _ from "underscore";

@Component({
  selector: 'app-service-list',
    templateUrl: './services-list.component.html',
    styleUrls: ['./services-list.component.css'],
    providers: [MsgBoxService],
    animations: [
        trigger('overlayState', [
            state('hidden', style({
                opacity: 0
            })),
            state('visible', style({
                opacity: 1
            })),
            transition('visible => hidden', animate('400ms ease-in')),
            transition('hidden => visible', animate('400ms ease-out'))
        ]),
    
        trigger('notificationTopbar', [
            state('hidden', style({
            height: '0',
            opacity: 0
            })),
            state('visible', style({
            height: '*',
            opacity: 1
            })),
            transition('visible => hidden', animate('400ms ease-in')),
            transition('hidden => visible', animate('400ms ease-out'))
        ])
    ]
})
export class ServicesListComponent implements OnInit{
    instanceListLink: any;
    serviceCatalog: any;
    services: any[];
    instanceCount: any[] = [{
        'serviceId' : '',
        'count': 0
    }];
    constructor(private wfservice: WorkflowService){}
    
    ngOnInit() {
        this.getServicesList();    
        
    }

    refreshList(){
        this.getServicesList();
    }
    getServicesList(){
        let self = this;
        // Get Instance count inside get service 
        this.instanceCount = [];
        this.wfservice.getInstances().subscribe(data => {
            let tempCount = _.countBy(data, 'service_id');
            _.each(tempCount, function(key, value){
                let counter = {
                    'serviceId' : value,
                    'count' : key
                }
                self.instanceCount.push(counter);
            })
            this.wfservice.getServices().subscribe(data=>{
                if(data){
                    this.services = data;
                    _.each(this.services, function(item){
                        item['action'] = item['workflows'][0].definition_source;
                        _.each(self.instanceCount, function(ele){
                            if(ele['serviceId'] == item['id']){
                                item['instanceCount'] = ele['count'];
                            }
                        })
                    })
                } else{
                    this.services = [];
                }
                if(this.services.length){
                    let groups = _.groupBy(this.services, 'group');
                    this.serviceCatalog = _.map(groups, function(item){
                        return {
                            groupName: item[0].group,
                            services: item
                        }
                    })
                } else{
                    this.serviceCatalog = []
                }
            }, error => {
                this.serviceCatalog = [];
                console.log("Something went wrong with fetching services.", error);
            });
        }, error => {
            console.log("Something went wrong. Instance count could not be fetched")
        });
        
    }

}
