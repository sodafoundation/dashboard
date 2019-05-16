import { Router,ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';
import { I18NService, MsgBoxService, Utils, ParamStorService } from '../../../shared/api';
import { Validators, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { WorkflowService } from '../workflow.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import * as _ from "underscore";

@Component({
  selector: 'dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.css']
})
export class DynamicFormComponent implements OnInit {
  @Input() dataObject: any;
  objectProps: any;
  form: FormGroup;
  requestBody : any;
  default_parameters: any = {
    "profile_id": "",
    "tenant_id": "",
    "auth": "",
    "token": "",
    "user":""
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
    public paramStor: ParamStorService,
    private fb: FormBuilder) { }

  ngOnInit() {
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
      console.log("Updated Object:DataObject", this.objectProps, this.dataObject);

      this.requestBody = _.pick(this.objectProps, function(item){
          item['validation'] = {required: true};
          return item['required']==true;
      });
      console.log("Request Body:", this.requestBody);
      _.each(this.objectProps, function(item){
        item['label'] = item['key'].replace(/_/g, ' ').replace(/(?: |\b)(\w)/g, function(key, p1) {
              return key.toUpperCase();    
        });
        if(item['type']=='object' || item['key']=='auth' || item['key']=='token' || item['key']=='tenant_id' || item['key']=='profile_id' || item['required'] == false){
          item['showThis'] = false;
        } else{
          item['showThis'] = true;
        }
        if(item['type'] == "string" || item['type'] == "integer"){
          item['inputType'] = "text";
        } else if(item['type'] == "boolean"){
          item['inputType'] = "radio";
          item['options'] = [
            { label: "True", value: 'true'},
            { label: "False", value: 'false'}
          ];
        } 
        if(item['required'] == true){
          item['validation'] = {required: true};
        }
      })

      console.log("New fields added", this.objectProps);

      // setup the form
      const formGroup = {};

     /*  _.each(this.objectProps, function(item, key, val){
        formGroup[key] = new FormControl(val[key] || '', this.mapValidators(item['validation']))
        console.log("Interim formGroup:", formGroup);
      });
      this.form = new FormGroup(formGroup); */
      
      for(let prop of Object.keys(this.dataObject)) {
        formGroup[prop] = new FormControl(this.dataObject[prop].value || '', this.mapValidators(this.dataObject[prop].validation));
      }
      this.form = new FormGroup(formGroup);
      console.log("New FormGroup:", this.form);
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

      onSubmit(value) {
        let formObject = value;
        console.log("Form Submitted:", formObject);
      }

}
