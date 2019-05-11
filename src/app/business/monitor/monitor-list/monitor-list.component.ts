import { Component, OnInit } from '@angular/core';
import {MonitorService} from '../monitor.service';

@Component({
  selector: 'app-monitor-list',
  templateUrl: './monitor-list.component.html',
  styleUrls: ['./monitor-list.component.css']
})
export class MonitorListComponent implements OnInit {

  monitorList: any[];
  options = {
    headers: {
        'X-Auth-Token': localStorage['auth-token']
    } 
  };
  constructor(private monitor: MonitorService) { }

  ngOnInit() {
    this.monitor.getMonitorList().subscribe(response =>{

    }, error =>{

    });

    this.monitorList  = [
      {
        "Name": "AlertManager",
        "URL": "http://localhost:9091"
      },
      {
        "Name": "Grafana",
        "URL": "http://localhost:9093"
      }
     ];
  }

}
