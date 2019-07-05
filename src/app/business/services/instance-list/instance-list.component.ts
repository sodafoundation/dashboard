import { Router,ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import {OverlayPanelModule, Message} from '../../../components/common/api';
import { I18NService, MsgBoxService } from '../../../shared/api';
import { WorkflowService } from '../workflow.service';
import { ConfirmationService,ConfirmDialogModule} from '../../../components/common/api';
import * as _ from "underscore";

@Component({
  selector: 'app-instance-list',
  templateUrl: './instance-list.component.html',
  providers: [MsgBoxService],
  styleUrls: ['./instance-list.component.css']
})
export class InstanceListComponent implements OnInit {
  

  msgs: Message[] = [];
  instances: any[] ;
  first: number = 0;
  serviceId: any;
  serviceName: any;
  loading: boolean;
  showWarningDialog = false;
  constructor( private router: Router,
    private ActivatedRoute:ActivatedRoute,
    public I18N: I18NService,
    public wfservice: WorkflowService,
    private confirmationService:ConfirmationService,
    ) {
        let self = this;
        this.ActivatedRoute.queryParamMap.subscribe(params => {
            this.serviceId = params.get('serviceId');
            let message = params.get('message');
            if(message != "undefined"){
                self.msgs.push(JSON.parse(message));
            }
        });
        
     }

  ngOnInit() {
    this.loading = true;
    this.getServiceDetails(this.serviceId);
    this.getInstances(this.serviceId);
    this.loading = false;
  }

  getServiceDetails(id){
      this.wfservice.getServiceById(id).subscribe(data =>{
        let service = data.json();
        this.serviceName = service.name;
      }, error => {
        console.log("Something went wrong.Could not fetch service details.", error);
      });
  }

  getInstances(serviceId){
      this.wfservice.getInstancesById(serviceId).subscribe(data=>{
        let service = data.json();
        if(service)
            this.instances = service;
        else
            this.instances = [];
      }, err => {
        this.instances = [];
        console.log("Something went wrong. Could not fetch instance list.", err);  
      })
  }
  getInstanceDetails(event){
      this.wfservice.getTasks(event.data.workflow_id).subscribe(data =>{
        let instanceDetails = data.json();
      }, error=>{
        console.log("Something went wrong. Tasks could not be fetched.");
      });
      this.wfservice.getInstanceDetails(event.data.workflow_id).subscribe(data =>{
      }, error=>{
        console.log("Something went wrong. Instance details could not be fetched.");
      });
  }
  refreshTable(){
    this.getInstances(this.serviceId);
  }

  startInstance(instanceId){
    console.log("Starting Instance:", instanceId);
  }

  restartInstance(instanceId){
    console.log("Restarting Instance:", instanceId);
  }

  pauseInstance(instanceId){
    console.log("Pausing Instance:", instanceId);
  }

  showWarningDialogFun(instance) {
    let msg = "<div>Are you sure you want to delete the Instance?</div><h3>[ "+ instance.name +" ]</h3>";
    let header ="Delete Instance";
    let acceptLabel = "Delete";
    let warning = true;
    this.confirmDialog([msg,header,acceptLabel,warning,instance.id])
  }

  confirmDialog([msg,header,acceptLabel,warning=true,func]){
      this.confirmationService.confirm({
          message: msg,
          header: header,
          acceptLabel: acceptLabel,
          isWarning: warning,
          accept: ()=>{
              try {
                  this.deleteInstance(func);
              }
              catch (e) {
                  console.log(e);
              }
              finally {
                  
              }
          },
          reject:()=>{}
      })
  }

  deleteInstance(instanceId){
    this.wfservice.deleteInstance(instanceId).subscribe(data=>{
        let instance = data.json();
        this.msgs = [];
        this.msgs.push({severity: 'success', summary: 'Success', detail: 'Instance Deleted Successfully.'});
        this.refreshTable();
    }, err =>{
        console.log("Something went wrong. The instance could not be deleted.", err);
        this.msgs = [];
        this.msgs.push({severity: 'error', summary: 'Error', detail: err.message});
    });
  }

}
