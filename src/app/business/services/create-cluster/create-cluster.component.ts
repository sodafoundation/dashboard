import { Router,ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input} from '@angular/core';
import { Message} from '../../../components/common/api';
import { I18NService, MsgBoxService, ParamStorService } from '../../../shared/api';
import { WorkflowService } from '../workflow.service';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import * as _ from "underscore";

@Component({
  selector: 'create-cluster',
  templateUrl: './create-cluster.component.html',
  providers: [MsgBoxService],
  styleUrls: ['./create-cluster.component.css']
})
export class CreateClusterComponent implements OnInit{
  @Input() dataObject: any;
  @Input() serviceId: any;
  @Input() selectedService: any;
  msgs : Message[];
  serviceName;
  clusterForm;
  showFolder = false;
  showCluster = false;
  configureDisabled = true;
  showSetConfigure = false;
  showConfigure = false;
  setConfigureForm;
  stepName;
  stepTypes = [{
    label: "Select a step",
    value: "Select a step"
  },{
    label: "Custome JAR",
    value: "Custome JAR"
  }];
  releases =[];
  showSlaveType = true;
  releaseValue = [
  "emr-5.24.1","emr-5.24.0","emr-5.23.0","emr-5.22.0",
  "emr-5.21.0","emr-5.20.0","emr-5.19.0","emr-5.18.0",
  "emr-5.17.0","emr-5.16.0","emr-5.15.0","emr-5.14.1",
  "emr-5.14.0","emr-5.13.0","emr-5.12.2","emr-5.12.1",
  "emr-5.12.0","emr-5.11.2","emr-5.11.1","emr-5.11.0",
  "emr-5.10.0","emr-5.9.0","emr-5.8.2","emr-5.8.1",
  "emr-5.8.0","emr-5.7.0","emr-5.6.0","emr-5.5.3",
  "emr-5.5.2","emr-5.5.1","emr-5.5.0","emr-5.4.0",
  "emr-5.3.1","emr-5.3.0","emr-5.2.2","emr-5.2.1",
  "emr-5.2.0","emr-5.1.0","emr-5.0.3","emr-5.0.0",
  "emr-4.9.5","emr-4.9.4","emr-4.9.3","emr-4.9.2",
  "emr-4.9.1","emr-4.8.4","emr-4.8.3","emr-4.8.2",
  "emr-4.8.0","emr-4.7.2","emr-4.7.1","emr-4.7.0",
  "emr-4.6.0","emr-4.5.0","emr-4.4.0","emr-4.3.0",
  "emr-4.2.0","emr-4.1.0","emr-4.0.0"];
  masterInstanceTypes = [];
  masterInstanceValues =[
    "c1.medium","c1.xlarge","cc2.8xlarge","c3.xlarge",
    "c3.2xlarge","c3.4xlarge","c3.8xlarge","c4.large",
    "c4.xlarge","c4.2xlarge","c4.4xlarge","c4.8xlarge",
    "c5.xlarge","c5.2xlarge","c5.4xlarge","c5.9xlarge",
    "c5.18xlarge","c5d.xlarge","c5d.2xlarge","c5d.4xlarge",
    "c5d.9xlarge","c5d.18xlarge","c5n.xlarge","c5n.2xlarge",
    "c5n.4xlarge","c5n.9xlarge","c5n.18xlarge","cr1.8xlarge",
    "m2.xlarge","m2.2xlarge","m2.4xlarge","d2.xlarge",
    "d2.2xlarge","d2.4xlarge","d2.8xlarge","h1.2xlarge",
    "h1.4xlarge","h1.8xlarge","h1.16xlarge","hs1.8xlarge",
    "i3.xlarge","i3.2xlarge","i3.4xlarge","i3.8xlarge",
    "i3.16xlarge","g2.2xlarge","g3.4xlarge","g3.8xlarge",
    "g3.16xlarge","g3s.xlarge","p2.xlarge","p2.8xlarge",
    "p2.16xlarge","p3.2xlarge","p3.8xlarge","p3.16xlarge",
    "i2.xlarge","i2.2xlarge","i2.4xlarge","i2.8xlarge",
    "m1.medium","m1.large","m1.xlarge","m3.xlarge",
    "m3.2xlarge","m4.large","m4.xlarge","m4.2xlarge",
    "m4.4xlarge","m4.10xlarge","m4.16xlarge","m5.xlarge",
    "m5.2xlarge","m5.4xlarge","m5.12xlarge","m5.24xlarge",
    "m5a.xlarge","m5a.2xlarge","m5a.4xlarge","m5a.12xlarge",
    "m5a.24xlarge","m5d.xlarge","m5d.2xlarge","m5d.4xlarge",
    "m5d.12xlarge","m5d.24xlarge","r3.xlarge","r3.2xlarge",
    "r3.4xlarge","r3.8xlarge","r4.xlarge","r4.2xlarge",
    "r4.4xlarge","r4.8xlarge","r4.16xlarge","r5.xlarge",
    "r5.2xlarge","r5.4xlarge","r5.12xlarge","r5.24xlarge",
    "r5a.xlarge","r5a.2xlarge","r5a.4xlarge","r5a.12xlarge",
    "r5a.24xlarge","r5d.xlarge","r5d.2xlarge","r5d.4xlarge",
    "r5d.12xlarge","r5d.24xlarge","z1d.xlarge","z1d.2xlarge",
    "z1d.3xlarge","z1d.6xlarge","z1d.12xlarge"]
  slaveInstanceTypes = [];
  actions = [{
    label: "continue",
    value: "continue"
  },{
    label: "cancel_and_wait",
    value: "cancel_and_wait"
  },{
    label: "terminate_cluster",
    value: "terminate_cluster"
  }]
  nodesCount = 0;
  keyOptions = [];
  showDefaultPermission = true;
  jobFlowRoles = [{
    label: "EMR_EC2_DefaultRole",
    value: "EMR_EC2_DefaultRole"
  }];
  serviceRoles = [{
    label: "EMR_DefaultRole",
    value: "EMR_DefaultRole"
  }];
  applicationsLabel = {
    "hadoop": "Core Hadoop: Hadoop 2.8.5 with Ganglia 3.7.2, Hive 2.3.4, Hue 4.4.0, Mahout 0.13.0, Pig 0.17.0, and Tez 0.9.1",
    "hbase": "HBase: HBase 1.4.9 with Ganglia 3.7.2, Hadoop 2.8.5, Hive 2.3.4, Hue 4.4.0, Phoenix 4.14.1, and ZooKeeper 3.4.13",
    "presto": "Presto: Presto 0.219 with Hadoop 2.8.5 HDFS and Hive 2.3.4 Metastore",
    "spark": "Spark: Spark 2.4.2 on Hadoop 2.8.5 YARN with Ganglia 3.7.2 and Zeppelin 0.8.1",
  };
  jobFlowRole = "";
  errorMessage = {
    "clusterName": {required: this.I18N.keyID['sds_profile_create_name_require']},
    "ak":{required: "Access Key is required."},
    "sk":{required: "Secret Key is required."},
    "region":{required: "Region is required."},
    "releaseLabel":{required: "Release is required."},
    "masterInstanceType":{required: "Master type is required."},
    "jobFlowRole":{required: "instance is required."},
    "serviceRole":{required: "EMR role is required."},
    "location":{required: "location is required."}
  }
  constructor(private router: Router,
    private ActivatedRoute:ActivatedRoute,
    public I18N: I18NService,
    public wfservice: WorkflowService,
    private fb: FormBuilder,
    private paramStor: ParamStorService
    ){}

    ngOnInit(){
      this.dataObject;
      this.serviceId;
      this.selectedService;
      this.clusterForm = this.fb.group({
        "clusterName": new FormControl('',Validators.required),
        "logChecked": new FormControl([]),
        "ak": new FormControl('',Validators.required),
        "sk": new FormControl('',Validators.required),
        "region": new FormControl('',Validators.required),
        "launchMode": new FormControl('execution',Validators.required),
        "stepType": new FormControl('Select a step'),
        "releaseLabel": new FormControl('',Validators.required),
        "application": new FormControl('Hadoop',Validators.required),
        "masterInstanceType": new FormControl('',Validators.required),
        "slaveInstanceType": new FormControl(''),
        "instanceCount": new FormControl(3),
        "keyPair": new FormControl(''),
        "permission": new FormControl('Default',Validators.required),
        "jobFlowRole": new FormControl('',Validators.required),
        "serviceRole": new FormControl('',Validators.required)
      });
      this.clusterForm.get("launchMode").valueChanges.subscribe((value: string)=>{
        if(value == "Cluster"){
          this.showCluster = true;
        }else{
          this.showCluster = false;
        }
      });
      this.clusterForm.get("permission").valueChanges.subscribe((value: string)=>{
        if(value == "Default"){
          this.showDefaultPermission = true;
        }else{
          this.showDefaultPermission = false;
        }
      });
      this.setConfigureForm = this.fb.group({
        "stepType": new FormControl(''),
        "name": new FormControl('',Validators.required),
        "location": new FormControl('',Validators.required),
        "arguments": new FormControl(''),
        "action": new FormControl('')
      })
      this.nodesCount = 2;
      this.releaseValue.forEach(item=>{
        this.releases.push({label:item,value:item});
      })
      this.masterInstanceValues.forEach(item=>{
        this.masterInstanceTypes.push({label:item,value:item});
        this.slaveInstanceTypes.push({label:item,value:item});
      })
    }
    checkLog(){
      if(this.clusterForm.value['logChecked']){
        this.showFolder = true;
      }else{
        this.showFolder = false;
      }
    }
    selectedFileOnChanged(){
      this.showConfigure = true;
      this.setConfigureForm.reset();
      this.setConfigureForm.patchValue({
        stepType: this.stepName,
        name: this.stepName,
        action: 'Continue'
      })
    }
    instanceCountChange(){
      let count = this.clusterForm.value['instanceCount'];
      this.nodesCount = count -1;
      this.showSlaveType = count > 1? true : false;
    }
    typeChange(){
      if(this.clusterForm.value['stepType'] =="Select a step"){
        this.configureDisabled = true;
      }else{
        this.configureDisabled = false;
      }
      this.stepName = this.clusterForm.value['stepType'];
    }
    onSubmitConfigure(){
      if(!this.setConfigureForm.valid){
        for(let i in this.setConfigureForm.controls){
            this.setConfigureForm.controls[i].markAsTouched();
        }
        return;
      }
      this.showConfigure = false;
    }
}