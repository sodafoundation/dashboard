import { Component, OnInit, Input } from '@angular/core';

let _ = require("underscore");

@Component({
  selector: 'app-suspension-frame',
  templateUrl: './suspension-frame.component.html',
  styleUrls: [

  ]
})
export class SuspensionFrameComponent implements OnInit {
    data=[];
    policyName:string;
  @Input()
    set policy(policy: any) {
        let extra = policy[1];
        this.policyName = policy[0];
        if(this.policyName === "Customization" && extra["customProperties"]){
          let self = this;
          let customProp = {};
          _.each(extra['customProperties'], function(value, key){
            customProp = {
                  'key' : key,
                  'value' : value
            }
            self.data.push(customProp);
            
          })
        }else if(this.policyName === "QoS" && extra["provisioningProperties"].ioConnectivity.maxIOPS){
            let maxIpos ="MaxIOPS = " + extra["provisioningProperties"].ioConnectivity.maxIOPS + " IOPS/TB";
            this.data.push(maxIpos);
            let maxBWS = "MaxBWS = " + extra["provisioningProperties"].ioConnectivity.maxBWS + " MBPS/TB";
            this.data.push(maxBWS);
        }else if(this.policyName === "Replication"){
            let type ="Type = " + extra["replicationProperties"].dataProtection.replicaType;
            this.data.push(type);
            let mode = "Mode = " + extra["replicationProperties"].replicaInfos.replicaUpdateMode;
            this.data.push(mode);
            let Period = "Period = " + extra["replicationProperties"].replicaInfos.replicationPeriod +" Minutes";
            this.data.push(Period);
            let Bandwidth = "Bandwidth = " + extra["replicationProperties"].replicaInfos.replicationBandwidth +" MBPS/TB";
            this.data.push(Bandwidth);
            let RGO = "RGO = " + extra["replicationProperties"].dataProtection.recoveryGeographicObjective;
            this.data.push(RGO);
            let RTO = "RTO = " + extra["replicationProperties"].dataProtection.recoveryTimeObjective;
            this.data.push(RTO);
            let RPO = "RPO = " + extra["replicationProperties"].dataProtection.recoveryPointObjectiveTime;
            this.data.push(RPO);
            let Consistency = "Consistency = " + extra["replicationProperties"].replicaInfos.consistencyEnabled;
            this.data.push(Consistency);
        }else{
            let schedule ="Schedule = " + extra["snapshotProperties"].schedule.occurrence;
            this.data.push(schedule);
            if(extra["snapshotProperties"].schedule){
                let execution = "Execution Time = " + extra["snapshotProperties"].schedule.datetime.split("T")[1] ;
                this.data.push(execution);
            }
            let Retention  = "Retention  = " + (extra["snapshotProperties"].retention["number"] ? extra["snapshotProperties"].retention["number"]: (extra["snapshotProperties"].retention.duration+" Days"));
            this.data.push(Retention );
        }
    };
  constructor() { }

  ngOnInit() {

  }
}
