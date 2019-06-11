import { Router,ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { I18NService, MsgBoxService, Utils } from '../../../shared/api';
import { Validators, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { WorkflowService } from '../workflow.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import {DynamicFormComponent} from '../dynamic-form/dynamic-form.component';
import * as _ from "underscore";

@Component({
  selector: 'app-create-instance',
  templateUrl: './create-instance.component.html',
  providers: [WorkflowService],
  styleUrls: ['./create-instance.component.css'],
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
export class CreateInstanceComponent implements OnInit {
 
  serviceId: any;
  services: any[];
  createInstanceForm: FormGroup;
  label: any;
  instanceInput: any;
  selectedService: any;
  serviceName: string;
  options = {
    headers: {
        'X-Auth-Token': localStorage['auth-token']
    } 
  };

  constructor(private router: Router,
    private ActivatedRoute:ActivatedRoute,
    public I18N: I18NService,
    public wfservice: WorkflowService,
    private fb: FormBuilder
    ) { 
      let self = this;
        this.ActivatedRoute.queryParamMap.subscribe(params => {
            self.serviceId = params.get('serviceId');
            self.serviceName = params.get('serviceName');
        });
    }

    

    

    ngOnInit() {
      this.getServicesList(this.serviceId);
    }

    getServicesList(serviceId){
      let self = this;
      this.wfservice.getServices().subscribe(data=>{
          this.services = data;
          _.each(this.services, function(item){
            item['action'] = item['workflows'][0].definition_source;
          })
          _.find(this.services, function(item){
            if(serviceId==item['id']){
              self.selectedService = item;
              self.createDynamicForm(item['input'], item);
            }
          })
      }, error => {
          console.log("Something went wrong with fetching services.", error);
      });
      
    }

    createDynamicForm = (element, service) => {
      this.instanceInput = element;
    }
    
}
