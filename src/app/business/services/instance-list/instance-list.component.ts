import { Router,ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import {OverlayPanelModule, Message} from '../../../components/common/api';
import { I18NService, MsgBoxService } from '../../../shared/api';
import { WorkflowService } from '../workflow.service';
import * as _ from "underscore";

@Component({
  selector: 'app-instance-list',
  templateUrl: './instance-list.component.html',
  providers: [MsgBoxService],
  styleUrls: ['./instance-list.component.css']
})
export class InstanceListComponent implements OnInit {
  

    msgs: Message[];
  instances: any[] ;
  first: number = 0;
  serviceId: any;
  loading: boolean;
  constructor( private router: Router,
    private ActivatedRoute:ActivatedRoute,
    public I18N: I18NService,
    public wfservice: WorkflowService
    ) { }

  ngOnInit() {
    this.loading = true;
    this.serviceId = this.ActivatedRoute.snapshot.params['serviceId'];
    console.log("Sent id in Instance list is ", this.serviceId);
    this.getInstances(this.serviceId);
    this.loading = false;
  }

  getInstances(serviceId){
      this.wfservice.getInstancesById(serviceId).subscribe(data=>{
        console.log("Instance list in Instance list page:", data);
        this.instances = data;
      }, err => {
        console.log("Something went wrong. Could not fetch instance list.", err);  
      })
  }
  getInstanceDetails(event){
      console.log("Get instance Details for:", event.data);
      this.wfservice.getTasks(event.data.workflow_id).subscribe(data =>{
        console.log("The executed tasks are:", data);
      }, error=>{
        console.log("Something went wrong. Tasks could not be fetched.");
      });
      this.wfservice.getInstanceDetails(event.data.workflow_id).subscribe(data =>{
        console.log("The instance details are:", data);
      }, error=>{
        console.log("Something went wrong. Instance details could not be fetched.");
      });
  }
  refreshTable(){
    this.getInstances(this.serviceId);
    console.log("Table REfreshed");
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

  deleteInstance(instanceId){
    this.wfservice.deleteInstance(instanceId).subscribe(data=>{
        console.log("The instance has been deleted.", data);
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
