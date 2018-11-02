import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService, Utils ,Consts} from 'app/shared/api';
import { MigrationService } from '../migration.service';

@Component({
  selector: 'migration-detail',
  templateUrl: './migration-detail.component.html',
  styleUrls: [

  ]
})
export class MigrationDetailComponent implements OnInit {
  @Input() job;

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
    "objectnum":0,
    "totalsize":"0 MB",
    "percent":'0'
  }

  constructor(
    private ActivatedRoute: ActivatedRoute,
    public I18N: I18NService,
    private MigrationService: MigrationService,
  ) { }

  ngOnInit() {
    if(this.job){
      this.migrationInstance.excutingTime = Utils.formatDate(this.job.createTime * 1000);
      this.migrationInstance.endTime = this.job.endTime > 0 ? Utils.formatDate(this.job.endTime * 1000) : "--";
      this.migrationInstance.totalsize = Utils.getDisplayCapacity(this.job.totalCapacity,2,'KB');
      this.migrationInstance.objectnum = this.job.totalCount ? this.job.totalCount :0;
      this.migrationInstance.srcBucket = this.job.sourceLocation;
      this.migrationInstance.destBucket = this.job.destLocation;
      this.migrationInstance.srcBackend = Consts.BUCKET_BACKND.get(this.job.sourceLocation);
      this.migrationInstance.destBackend = Consts.BUCKET_BACKND.get(this.job.destLocation);
      this.migrationInstance.percent = this.job.progress ? this.job.progress : 0 ;
      this.migrationInstance.status = this.job.status;
    }
  }
}
