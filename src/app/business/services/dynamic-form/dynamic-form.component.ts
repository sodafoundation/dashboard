import { Router,ActivatedRoute, NavigationExtras } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';
import { Message} from '../../../components/common/api';
import { I18NService, MsgBoxService, Utils, ParamStorService } from '../../../shared/api';
import { Validators, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { WorkflowService } from '../workflow.service';
import { ProfileService } from '../../profile/profile.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import * as _ from "underscore";

@Component({
  selector: 'dynamic-form',
  templateUrl: './dynamic-form.component.html',
  providers: [MsgBoxService],
  styleUrls: ['./dynamic-form.component.css']
})
export class DynamicFormComponent implements OnInit {
  @Input() dataObject: any;
  @Input() serviceId: any;
  @Input() selectedService: any;

  msgs: Message[];
  profileOptions: any[] = [];
  objectProps: any;
  displayFormObject: any[];
  form: FormGroup;
  requestBody : any = {
    "service_definition_id": "",
    "user_id": "",
    "action": "",
    "name" : "",
    "description" : "",
    "parameters": {
        
    }
  };
  default_parameters: any[] = [    
    "tenant_id",
    "auth_token",
    "user_id",
    "userId"
  ];
  
  options = {
    headers: {
        'X-Auth-Token': localStorage['auth-token']
    } 
  };
  auth_token = localStorage['auth-token'];
  user_id = this.paramStor.CURRENT_USER().split("|")[1];
  project_id = this.paramStor.CURRENT_TENANT().split("|")[1];

  constructor(private router: Router,
    private ActivatedRoute:ActivatedRoute,
    public i18n: I18NService,
    private wfservice: WorkflowService,
    private profileService: ProfileService,
    private paramStor: ParamStorService,
    private fb: FormBuilder) { }

  ngOnInit() {
    let self = this;

    this.dataObject['instanceName'] = {
      "description": "Name of the Instance",
      "required": true,
      "type": "string",
      "validation": {
        "required": true
      },
      "instanceInfo" : true
    };

    this.dataObject['instanceDescription'] = {
      "description": "Description of the Instance",
      "required": true,
      "type": "string",
      "validation": {
        "required": true
      },
      "instanceInfo" : true
    };
    // remap the API to be suitable for iterating over it
    this.objectProps =
      Object.keys(this.dataObject)
        .map(prop => {
          return Object.assign({}, { key: prop} , this.dataObject[prop]);
        });
      
        _.each(this.dataObject, function(item){
          if(item['required']==true){
            item['validation'] = {"required": true};
          }
        })
      
      // setup the form
      const formGroup = {};

      _.each(this.objectProps, function(item){
        item['showThis'] = true;
        item['label'] = item['key'].replace(/_/g, ' ').replace(/(?: |\b)(\w)/g, function(key, p1) {
              return key.toUpperCase();    
        });

        if(item['type']=='object'){
          item['showThis'] = false;
        }
        //Check if the key is a default parameter and can be passed from code. User need not enter.
        if(item['required'] == true){
          item['validation'] = {required: true};
          if(_.contains(self.default_parameters, item['key'])){
            item['showThis'] = false;
            if(item['key']=='auth_token'){
              item['default'] = item['value'] = self.auth_token;
            }
            if(item['key']=='tenant_id'){
              item['default'] = item['value'] = self.project_id;
            }
            if(item['key']=='user_id' || item['key']=='userId'){
              item['default'] = item['value'] = self.user_id;
            }
          }
        }

        if(item['key']=='profile_id'){
          self.getProfiles();
          item['inputType'] = "select";
          item['options'] = self.profileOptions;
        }
        
        if((item['type'] == "string" || item['type'] == "integer") && item['key'] != 'profile_id'){
          item['inputType'] = "text";
        } else if(item['type'] == "boolean"){
          item['inputType'] = "radio";
          item['options'] = [
            { label: "True", value: 'true'},
            { label: "False", value: 'false'}
          ];
        } 
        formGroup[item['key']] = new FormControl(item['value'] || '', self.mapValidators(item['validation']));
      })

      this.form = new FormGroup(formGroup);
    }
      

      mapValidators(validators) {
        const formValidators = [];

        if(validators) {
          for(const validation of Object.keys(validators)) {
            if(validation === 'required') {
              formValidators.push(Validators.required);
            } else if(validation === 'min') {
              formValidators.push(Validators.min(validators[validation]));
            }
          }
        }
      
        return formValidators;
      }
      getProfiles() {
        this.profileService.getProfiles().subscribe((res) => {
          let profiles = res.json();
          profiles.forEach(profile => {
            this.profileOptions.push({
              label: profile.name,
              value: profile.id
            });
          });
        });
      }

      onSubmit(value) {
        let formObject = value;
        this.requestBody.service_definition_id = this.serviceId;
        this.requestBody.action = this.selectedService.action;
        this.requestBody.user_id = this.user_id;
        this.requestBody.name = formObject.instanceName;
        this.requestBody.description = formObject.instanceDescription;
        this.requestBody.parameters = _.omit(formObject, ['instanceName', 'instanceDescription']);
        this.createInstance(this.requestBody);
      }

      createInstance(param){
        this.wfservice.createInstance(param).subscribe(res => {
          this.msgs = [];
          this.msgs.push({severity: 'success', summary: 'Success', detail: 'Instance Created Successfully.'});
          let queryParams = {
                "serviceId": this.serviceId,
                "message": JSON.stringify({severity: 'success', summary: 'Success', detail: 'Instance Created Successfully.'})
          };
          this.router.navigate(['services/instanceList'], {queryParams: queryParams});

        }, error => {
          this.msgs = [];
          this.msgs.push({severity: 'error', summary: 'Error', detail: error.message});
        })
        
      }

}
