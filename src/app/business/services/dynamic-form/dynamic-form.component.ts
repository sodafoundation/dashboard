import { Router,ActivatedRoute, NavigationExtras } from '@angular/router';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Message, I18N} from '../../../components/common/api';
import { I18NService, MsgBoxService, Utils, ParamStorService } from '../../../shared/api';
import { Validators, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { WorkflowService } from '../workflow.service';
import { ProfileService } from '../../profile/profile.service';
import { HostsService } from '../../block/hosts.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CreateClusterComponent } from '../create-cluster/create-cluster.component'
import * as _ from "underscore";

@Component({
  selector: 'dynamic-form',
  templateUrl: './dynamic-form.component.html',
  providers: [MsgBoxService],
  styleUrls: ['./dynamic-form.component.css']
})
export class DynamicFormComponent implements OnInit {
  @ViewChild('createCluster') createCluster: CreateClusterComponent;
  @Input() dataObject: any;
  @Input() serviceId: any;
  @Input() selectedService: any;

  msgs: Message[];
  profileOptions: any[] = [];
  allHosts;
  noHosts: boolean = false;
  hostOptions: any[] = [];
  objectProps: any;
  displayFormObject: any[];
  form: FormGroup;
  showAnalysis = false;
  requestBody : any = {
    "service_id": "",
    "user_id": "",
    "action": "",
    "name" : "",
    "description" : "",
    "parameters": {
        
    }
  };
  default_parameters: any = {
      "tenant_id" : "",
      "auth_token" : "",
      "user_id" : "",
      "userId" : "",
    };
  
  options = {
    headers: {
        'X-Auth-Token': localStorage['auth-token']
    } 
  };
  

  constructor(private router: Router,
    private ActivatedRoute:ActivatedRoute,
    public i18n: I18NService,
    private wfservice: WorkflowService,
    private profileService: ProfileService,
    private HostsService: HostsService,
    private paramStor: ParamStorService,
    private fb: FormBuilder) {
      this.default_parameters['auth_token'] = localStorage['auth-token'];
      this.default_parameters['user_id'] = this.default_parameters['userId'] = this.paramStor.CURRENT_USER().split("|")[1];
      this.default_parameters['tenant_id'] = this.paramStor.CURRENT_TENANT().split("|")[1];
    }

  ngOnInit() {
    let self = this;
    self.getProfiles();
    self.getAllHosts();
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
      
      // setup the form
      const formGroup = {};
      _.each(this.objectProps, function(item){
        item['showThis'] = true;
        item['label'] = self.i18n.keyID[item['key']] ? self.i18n.keyID[item['key']] : item['key'].replace(/_/g, '  ').replace(/(?: |\b)(\w)/g, function(key, p1) {
          return key.toUpperCase();    
    });
        if(item['key']=='timeout'){
          item['required'] = false;
        }
        
        if(item['type']=='object' || item['required'] == false || !_.has(item, 'required')){
          item['showThis'] = false;
        }
        /* Adding host info object for volume provisioning.  */
        if(item['key'] == 'host_id'){
          item['label'] = "Host";
          item['showThis'] = true;
          item['validation'] = {required: true};
          item['required'] = true;
          item['inputType'] = "select"; 
          item['options'] = self.hostOptions;
          
          formGroup[item['key']] = new FormControl(item['value'] || '', self.mapValidators(item['validation']));
        }

        if(item['key'] == 'port' || item['key']=='analysis_args'){
          item['showThis'] = false;
          item['required'] = false;
          item['validation'] = {required: false};
        }
        if(item['key'] == 'ip_addr'){
          item['showThis'] = false;
          item['required'] = false;
          item['validation'] = {required: false};
        }
        
        //Check if the key is a default parameter and can be passed from code. User need not enter.
        if(item['required'] == true){
          item['validation'] = {required: true};
          if(_.has(self.default_parameters, item['key'])){
            item['showThis'] = false;
            item['default'] = item['value'] = self.default_parameters[item['key']];
          }
          if(item['key'] == 'auth_token'){
            item['showThis'] = false;
            item['validation'] = {required: false};
          }
        }

        if(item['key']=='profile_id'){
          item['inputType'] = "select";        
          item['options'] = self.profileOptions;
          formGroup[item['key']] = new FormControl(item['value'] || '', self.mapValidators(item['validation']));
        }

        
        if(item['type'] == "string" && item['key'] != 'profile_id'){
          item['inputType'] = "text";
        } else if(item['type'] == "boolean"){
          item['inputType'] = "radio";
          item['options'] = [
            { label: "True", value: 'true'},
            { label: "False", value: 'false'}
          ];
        } else if(item['type'] == "integer"){
          item['inputType'] = "number";
        }
        if(item['required']==true){
          formGroup[item['key']] = new FormControl(item['value'] || '', self.mapValidators(item['validation']));
        }
        
      })
      this.form = new FormGroup(formGroup);
      if(this.selectedService.group == 'bigdata-analysis'){
        this.showAnalysis = true;
      }else{
        this.showAnalysis = false;
      }
    }
      
    getAllHosts(){
      let self = this;
        this.HostsService.getHosts().subscribe((res) => {
          this.allHosts = res.json();
            if(this.allHosts.length == 0){
              this.noHosts = true;
            }
            if(this.allHosts && this.allHosts.length){
              _.each(self.allHosts, function(item){
                let option = {
                    label: item['hostName'] + ' ' + '(' + item['ip'] + ')',
                    value: item['id']
                }
                self.hostOptions.push(option);
            })
            }
            console.log("Host Options", self.hostOptions);
        }, (error) =>{
            console.log(error);
        })
      
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
            if(profile.storageType=='block'){
              this.profileOptions.push({
                label: profile.name,
                value: profile.id
              });
            }
          });
        }, error =>{
          console.log("Something went wrong. Could not fetch profiles.", error);
          this.msgs = [];
          this.msgs.push({severity: 'error', summary: 'Error', detail: error._body});
        });
      }

      onSubmit(value) {
        let formObject = value;
        this.requestBody.service_id = this.serviceId;
        this.requestBody.action = this.selectedService.action;
        this.requestBody.user_id = this.default_parameters['user_id'];
        this.requestBody.name = formObject.instanceName;
        this.requestBody.description = formObject.instanceDescription;
        this.requestBody.parameters = _.omit(formObject, ['instanceName', 'instanceDescription']);
        if(this.showAnalysis){
          let analysisParam = this.checkAnalysisParameters();
          this.requestBody.parameters['analysis_args'] = analysisParam;
          this.requestBody.parameters['ip_addr'] = location.hostname;
          this.requestBody.parameters['port'] = location.port;
          this.requestBody.parameters['name'] = formObject.instanceName;
        }
        this.createInstance(this.requestBody);
      }

      checkAnalysisParameters(){
        if(!this.createCluster.clusterForm.valid){
          for(let i in this.createCluster.clusterForm.controls){
              this.createCluster.clusterForm.controls[i].markAsTouched();
          }
          return;
        }
        let formValue = this.createCluster.clusterForm.value;
        let configureValue = this.createCluster.setConfigureForm.value;
        let  actionOnFailure = configureValue['action'].toUpperCase();
        let analysis_args = {
          Name: formValue.clusterName,
          AK: formValue.ak,
          SK: formValue.sk,
          Region: formValue.region,
          ReleaseLabel: formValue.releaseLabel,
          Instances:{
            MasterInstanceType: formValue.masterInstanceType,
            InstanceCount: formValue.instanceCount,
            KeepJobFlowAliveWhenNoSteps: false,
            TerminationProtected: false
          },
          JobFlowRole: formValue.jobFlowRole,
          ServiceRole: formValue.serviceRole,
          VisibleToAllUsers: true,
          Applications:[
            {Name: formValue.application}
          ],
          Steps:[
            {
              Name: 'default boot',
              ActionOnFailure: "TERMINATE_CLUSTER",
              HadoopJarStep:{
                Args:["state-pusher-script"],
                Jar:"command-runner.jar"
              }
            },{
              Name: configureValue['name'],
              ActionOnFailure: actionOnFailure,
              HadoopJarStep:{
                Args: configureValue.arguments.split(' '),
                Jar: configureValue.location
              }
            }
          ]
        }
        if(this.createCluster.showSlaveType){
          analysis_args.Instances['SlaveInstanceType'] = formValue.slaveInstanceType;
        }
        return analysis_args;
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
