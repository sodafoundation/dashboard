import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService, Utils ,Consts} from 'app/shared/api';
import { MigrationService } from '../migration.service';
import { Http } from '@angular/http';

@Component({
  selector: 'migration-detail',
  templateUrl: './migration-detail.component.html',
  styleUrls: [

  ]
})
export class MigrationDetailComponent implements OnInit {
  @Input() plan;

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

  constructor(
    private ActivatedRoute: ActivatedRoute,
    public I18N: I18NService,
    private MigrationService: MigrationService,
    private http: Http
  ) { }

  ngOnInit() {

    this.http.get('v1/{project_id}/jobs?planName='+this.plan.name).subscribe((res)=>{
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
}
