import { Router,ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ButtonModule, Message} from '../../../components/common/api';
import { I18NService, MsgBoxService, Utils, ParamStorService } from '../../../shared/api';
import { HttpClient, HttpRequest, HttpEventType, HttpResponse, HttpClientModule, HttpHeaders } from '@angular/common/http'
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MonitorService } from '../monitor.service';
import { ConfigService } from './config.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  providers: [MsgBoxService, MonitorService, ConfigService],
  styleUrls: ['./config.component.css'],
  animations: [
    trigger('overlayState', [
        state('hidden', style({
            opacity: 0
        })),
        state('visible', style({
            opacity: 1
        })),
        transition('visible => hidden', animate('400ms ease-in')),
        transition('hidden => visible', animate('400ms ease-out'))
    ]),

    trigger('notificationTopbar', [
        state('hidden', style({
            height: '0',
            opacity: 0
        })),
        state('visible', style({
            height: '*',
            opacity: 1
        })),
        transition('visible => hidden', animate('400ms ease-in')),
        transition('hidden => visible', animate('400ms ease-out'))
    ])
]
})
export class ConfigComponent implements OnInit {

  msgs: Message[];
  public progress: number;
  public message: string;
  showProgress: boolean;
  isAdministrator: boolean;
  type: any;
  username: any;
  options = {
    headers: {
        'X-Auth-Token': localStorage['auth-token']
    } 
  };
  configThese: any[];
  constructor(public I18N: I18NService,
    private router: Router,
    private ActivatedRoute:ActivatedRoute,
    private http: HttpClient,
    private monitor: MonitorService,
    private config: ConfigService,
    private paramStor: ParamStorService) {
      this.username = this.paramStor.CURRENT_USER().split("|")[0];
      if(this.username == "admin"){
          this.isAdministrator = true;
      }else{
          this.isAdministrator = false;
      }
    }

  ngOnInit() {
    this.configThese = [{
      "name":"Prometheus",
      "type" : "prometheus",
      "location":"/etc/prometheus"
    }, 
    {
      "name":"Alert Manager",
      "type" : "alertmanager",
      "location":"/etc/alertmanager"
    },
    { 
      "name" : "Grafana",
      "type" : "grafana",
      "location":"/etc/grafana"
    }];
  }

  selectFile(event, configType) {
    this.progress = 0;
    this.showProgress = false;
    this.uploadFile(event.target.files, configType);
  }
  uploadFile(files: FileList, configType) {
    if (files.length == 0) {
      console.log("No file selected!");
      return

    }
    this.progress = 0;
    this.showProgress = false;
    const formData = new FormData();
    let conf_file: File = files[0];
    formData.append('conf_file', conf_file);
    let detailUrl = 'v1beta/uploadconf?conftype=' + configType;
    const uploadReq = new HttpRequest('POST', detailUrl, formData, {
      reportProgress: true,
      headers: new HttpHeaders().set('X-Auth-Token' , this.options.headers['X-Auth-Token'])
    });
    this.http.request(uploadReq).subscribe(event => {
      if (event.type === HttpEventType.UploadProgress){
        this.showProgress = true;
        this.progress = Math.round(100 * event.loaded / event.total);
      }
      else if (event.type === HttpEventType.Response){
        this.message = event.body.toString();
        this.msgs = [];
        this.msgs.push({severity: 'success', summary: 'Success', detail: 'File Uploaded!'});
      }  
    },
    err=>{
      this.msgs = [];
      this.msgs.push({severity: 'error', summary: 'Error', detail: 'File could not be uploaded.'});
    });
    
  }

 
  getFile(configType: string) {
    this.config.downloadConfig(configType).subscribe(respData => {
        this.downLoadFile(respData, respData.type, configType);
    }, error => {
      this.msgs = [];
      this.msgs.push({severity: 'error', summary: 'Error', detail: 'File could not be dowloaded.'});
    });
  }
  downLoadFile(data: any, fileType: string, configType: string) {
    var blob = new Blob([data], { type: fileType.toString() });
    let access = configType;
    if (typeof window.navigator.msSaveBlob !== 'undefined') {  
      window.navigator.msSaveBlob(blob, access);
    } else {
    let URL = window.URL
    let objectUrl = URL.createObjectURL(blob)
    if (access) {
      let a = document.createElement('a')
      a.href = objectUrl
      if(configType=='grafana')
        a.download = access + '.ini';
      else
        a.download = access + '.yml';
      document.body.appendChild(a)
      a.click()
      a.remove()
    }
  }
  }

  

}
