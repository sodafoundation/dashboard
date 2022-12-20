import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService, Utils ,Consts} from 'app/shared/api';
import { MigrationService } from '../migration.service';
import { Http } from '@angular/http';
import { interval } from 'rxjs/observable/interval';

@Component({
  selector: 'migration-detail',
  templateUrl: './migration-detail.component.html',
  styleUrls: [

  ]
})
export class MigrationDetailComponent implements OnInit {
  @Input() plan;

  detailInterval;
  migrationInstance = {
    "name": "--",
    "srcBucket": "--",
    "destBucket": "--",
    "rule": "--",
    "excutingTime":'--',
    "analysisCluster": "--",
    "deleteSrcObject": true,
    "id": "--",
    "status": "--",
    "endTime": "--",
    "srcBackend": "",
    "destBackend": "",
    "objectnum": "--",
    "totalsize":"--",
    "passedsize": "--",
    "passednum": "--",
    "percent":'0'
  }

  servicePlansEnabled: boolean;

  constructor(
    private ActivatedRoute: ActivatedRoute,
    public I18N: I18NService,
    private MigrationService: MigrationService,
    private http: Http
  ) { 
    this.servicePlansEnabled = Consts.STORAGE_SERVICE_PLAN_ENABLED;
  }


  ngOnInit() {
    this.getMigrationDetail(this.plan);
    this.detailInterval = setInterval(()=>{
      this.getMigrationDetail(this.plan);
    },5000)
    
  }

  getMigrationDetail(plan){
    let options: any = {};
    //Close the details page to refresh the busy waiting box
    options['mask'] = false;
    this.http.get('v1/{project_id}/jobs?planName='+this.plan.name,options).subscribe((res)=>{
      let job = res.json().jobs ? res.json().jobs :[];
      
      if(job.length > 0) {
        let curJob = job[job.length - 1];
        this.migrationInstance.excutingTime = curJob.createTime ? Utils.formatDate(curJob.createTime * 1000) : "--";
        this.migrationInstance.endTime = curJob.endTime > 0 ? Utils.formatDate(curJob.endTime * 1000) : "--";
        this.migrationInstance.totalsize = curJob.totalCapacity ? Utils.getDisplayCapacity(curJob.totalCapacity,2,'KB') : '0KB';
        this.migrationInstance.objectnum = curJob.totalCount ? curJob.totalCount : 0;
        this.migrationInstance.passedsize = curJob.passedCapacity ? Utils.getDisplayCapacity(curJob.passedCapacity,2,'KB') : '0KB';
        this.migrationInstance.passednum = curJob.passedCount ? curJob.passedCount : 0;
        this.migrationInstance.srcBucket = curJob.sourceLocation;
        this.migrationInstance.destBucket = curJob.destLocation;
        this.migrationInstance.srcBackend = Consts.BUCKET_BACKND.get(curJob.sourceLocation);
        this.migrationInstance.destBackend = Consts.BUCKET_BACKND.get(curJob.destLocation);
        this.migrationInstance.percent = curJob.progress ? curJob.progress : 0 ;
        this.migrationInstance.status = curJob.status;
      }else{
        this.migrationInstance.srcBucket = this.plan.srcBucket;
        this.migrationInstance.destBucket = this.plan.destBucket;
        this.migrationInstance.srcBackend = Consts.BUCKET_BACKND.get(this.plan.srcBucket);
        this.migrationInstance.destBackend = Consts.BUCKET_BACKND.get(this.plan.destBucket);
        this.migrationInstance.status = "waiting"
      }
    })
  }

  ngOnDestroy() {
    clearInterval(this.detailInterval);
  }
  
}
