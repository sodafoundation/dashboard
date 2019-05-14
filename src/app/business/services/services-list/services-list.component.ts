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
    msgs: Message[];
    instanceListLink: any;
    serviceCatalog: any[];
    services: any[];
    instanceCount: number;
    constructor(private wfservice: WorkflowService){}
    
    ngOnInit() {
        this.getServicesList();    
        //this.getInstanceCount();  
        this.instanceCount = 10;
        
    }

    refreshList(){
        this.getServicesList();
    }
    getServicesList(){
        this.wfservice.getServices().subscribe(data=>{
            this.services = data.services;
            let count: number;
            _.each(this.services, function(item){
                console.log("Single Service", item);
                //count = this.getInstanceCount(item['id']);
                //item['instanceCount'] = count;
            })
        }, error => {
            console.log("Something went wrong with fetching services.", error);
        });
        
    }

    getInstanceCount(id){
        this.wfservice.getInstancesById(id).subscribe(data => {
            console.log("Get the list of instances:", data);
            return data.length;
        }, error => {
            return 0;
        });
        this.instanceCount = 10;
    }

    save() {
        this.msgs = [];
        this.msgs.push({severity:'info', summary:'Success', detail:'Data Saved'});
    }

    update() {
        this.msgs = [];
        this.msgs.push({severity:'info', summary:'Success', detail:'Data Updated'});
    }

    delete() {
        this.msgs = [];
        this.msgs.push({severity:'info', summary:'Success', detail:'Data Deleted'});
    }
    
}
