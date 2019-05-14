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
 
  action: any;
  services: any[];
  createInstanceForm: FormGroup;
  label: any;
  instanceInput: any;
  param = {
    hostIP: '',
    port: '',
    tenantId: '',
    userId: '',
    name: '',
    description: '',
    destBackend: '',
    srcBucketName: '',
    destBucketName: '',
    remainSource: true,
    auth: ''
  };

  errorMessage={
    "hostIP": {required: 'Host IP is required'},
    "port": {required: 'Port is required'},
    "name": { required: this.I18N.keyID['sds_profile_create_name_require']},
    "":{maxlength:this.I18N.keyID['sds_validate_max_length']},
    "destBackend" : {required: 'Destination Backend is required'},
    "srcBucketName" : {required: 'Source Bucket Name is required'},
    "destBucketName" : {required: 'Destination Bucket Name is required'},
    "remainSource" : {required: 'Remain Source is required'},
  };

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
    }

    

    createInstance(param){
      this.wfservice.createInstance(param).subscribe(res => {
        console.log("Create Instance Values", param);
        console.log("Return value", res);
      }, error => {
        console.log("Create Instance Error", error);
      })
      
    }

    ngOnInit() {
      this.action = this.ActivatedRoute.snapshot.params['action'];
      console.log("Sent action in Create is ", this.action);
      
      this.getServicesList(this.action);
      
      /* this.label = {
        hostIP: 'Host IP',
        port: 'Port',
        name: this.I18N.keyID['sds_block_volume_name'],
        description: this.I18N.keyID['sds_block_volume_descri'],
        destBackend: 'Destination Backend',
        srcBucketName: 'Source Bucket Name',
        destBucketName: "Destination Bucket Name",
        remainSource: "Remain Source",
      }; */
  
     /*  this.createInstanceForm = this.fb.group({
        'hostIP': new FormControl('', Validators.required),
        'port': new FormControl('', Validators.required),
        'name': new FormControl('', Validators.required),
        'description': new FormControl('',Validators.maxLength(200)),
        "destBackend":  new FormControl('', Validators.required),
        "srcBucketName":  new FormControl('', Validators.required),
        "destBucketName":  new FormControl('', Validators.required),
        "remainSource": new FormControl('true', Validators.required),
      }); */
    }

    getServicesList(action){
      let self = this;
      this.wfservice.getServices().subscribe(data=>{
          this.services = data.services;
          let count: number;
          _.each(this.services, function(item){
              _.find(item.service.workflows, function(ele){
                if(action==ele['action']){
                  console.log("Action Matched", ele);
                  self.createDynamicForm(ele['definition']);
                }
              });
          })
      }, error => {
          console.log("Something went wrong with fetching services.", error);
      });
      
    }

    createDynamicForm = (element) => {
      console.log("Selected Form Raw definition")
      this.instanceInput = element;
      console.log("Sending the defintion", this.instanceInput);
    }
    
    onSubmit(value) {
      let formObject = value;
      this.param.hostIP = value.hostIP;
      this.param.port = value.port;
      this.param.name = value.name;
      this.param.description = value.description;
      this.param.destBackend = value.destBackend;
      this.param.srcBucketName = value.srcBucketName;
      this.param.destBucketName = value.destBucketName;
      this.param.remainSource = value.remainSource;
      this.param.auth = this.options.headers['X-Auth-Token'];
      this.createInstance(this.param);
    }

 


}
