import { Component, OnInit } from '@angular/core';
import {MonitorService} from '../monitor.service';
import { ButtonModule, Message} from '../../../components/common/api';
import { I18NService, ParamStorService } from '../../../shared/api';

@Component({
  selector: 'app-monitor-list',
  templateUrl: './monitor-list.component.html',
  styleUrls: ['./monitor-list.component.css']
})
export class MonitorListComponent implements OnInit {

  msgs: Message[];
  monitorList: any[];
  isAdministrator: boolean;
  username: any;
  options = {
    headers: {
        'X-Auth-Token': localStorage['auth-token']
    } 
  };
  constructor(private monitor: MonitorService, 
    private paramStor: ParamStorService) {
      this.username = this.paramStor.CURRENT_USER().split("|")[0];
      if(this.username == "admin"){
          this.isAdministrator = true;
      }else{
          this.isAdministrator = false;
      }
    }

  ngOnInit() {
    this.monitor.getMonitorList().subscribe(response =>{
      this.monitorList = response;
    }, error =>{
      console.log("Something went wrong. Please try again.")
    });
  }

}
