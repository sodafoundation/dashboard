import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute} from '@angular/router';
import { I18NService, Utils } from 'app/shared/api';

@Component({
  selector: 'replication-detail',
  templateUrl: './replication-detail.component.html',
  styleUrls: [

  ]
})
export class ReplicationDetailComponent implements OnInit {
  
  constructor(
    private ActivatedRoute: ActivatedRoute,
    public I18N:I18NService
  ) { }

  ngOnInit() {
    
  }

}
