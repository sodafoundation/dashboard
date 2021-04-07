import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Validators, FormControl, FormGroup, FormBuilder, FormArray } from '@angular/forms';

import { Message, SelectItem } from './../../../components/common/api';
import { AvailabilityZonesService } from '../../infrastructure/infrastructure.service';
import { HostsService} from './../hosts.service';
import { I18NService,Utils } from '../../../../app/shared/api';
import { Form } from '../../../components/form/form';
import { Http, Headers, Response } from '@angular/http';

let _ = require("underscore");

@Component({
  selector: 'app-modify-host',
  templateUrl: './modify-host.component.html',
  styleUrls: [

  ],
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
export class ModifyHostComponent implements OnInit {

  label = {
    availabilityZones: this.i18n.keyID["sds_host_availability_zones"],
    name: this.i18n.keyID["sds_block_volume_name"],
    osType: this.i18n.keyID["sds_host_os_type"],
    ip: this.i18n.keyID["sds_host_ip"],
    accessMode: this.i18n.keyID["sds_host_access_mode"],
    initiators: this.i18n.keyID["sds_host_initiators"]
  };
  msgs: Message[];
  items;
  hostId;
  allHosts;
  allAZs;
  selectedHost;
  host;
  availabilityZonesOptions = [];
  selectedAZs: string[] = [];
  osTypeOptions;
  selectedOs;
  accessModeOptions;
  selectedAccessMode;
  protocolOptions;
  selectedProtocol;
  modifyHostform;
  errorMessage = {
    "availabilityZones": { required: "Atleast one Zone is required."},
    "accessMode": { required: "Access Mode is required."},
    "osType": { required: "OS Type is required."},
    "ip": { 
        required: "IP Address is required",
        pattern: "Enter valid IP address"
    },
    "hostName": {
        required: "Host Name is required.",
        maxlength: "Maximum 28 characters",
        minlength: "Minimum 2 characters",
        pattern: "Invalid Host Name"
    },
    "initiators": {
      portName: {
        required: "Port Name is required."
      }
    }
  };
  validRule = {
    'validIp': '([0-9]{1,3})[.]([0-9]{1,3})[.]([0-9]{1,3})[.]([0-9]{1,3})',
    'validHostName' : '^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$'
  };
  
  constructor(
    private ActivatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private HostsService: HostsService,
    private availabilityZonesService:AvailabilityZonesService,
    public i18n:I18NService,
    private http: Http
  ) {
    // Resolve the Host to modify
    this.ActivatedRoute.data.subscribe((res:Response) => {
      this.selectedHost = res['host'].json();
    })
    // Resolve the Availability Zones
    this.ActivatedRoute.data.subscribe((azres:Response) => {
      this.allAZs = azres['az'].json();
      let azArr = [];
      if(this.allAZs && this.allAZs.length !== 0){
          this.allAZs.forEach(item =>{
              let obj = {label: item, value: item};
              azArr.push(obj);
          })
      }
      this.availabilityZonesOptions = azArr;

    })
    // Fetch the Selected Host ID
    this.ActivatedRoute.params.subscribe((params) => {
      this.hostId = params.hostId
    });
    
  }

  ngOnInit() {
    this.osTypeOptions = [
        {
            label: "Linux",
            value: 'linux'
        },
        {
            label: "Windows",
            value: 'windows',
        },
        {
            label: "ESXi",
            value: 'esxi'
        }
    ];
    this.accessModeOptions = [
        {
            label: "Agentless",
            value: "agentless"
        }
    ];
    this.protocolOptions = [
      {
        label: "iSCSI",
        value: "iscsi"
      },
      {
        label: "SCSI",
        value: "scsi"
      },
      {
        label: "FC",
        value: "fibre_channel"
      },
      {
        label: "NVMe",
        value: "nvme"
      }
    ]
    
    this.items = [
        { label: this.i18n.keyID["sds_Hosts_title"], url: '/block' },
        { label: this.i18n.keyID["sds_modify_host"], url: '/modifyHost' }
    ];
    let self = this;
    // Populate the OS type dropdown with selected value.
    _.each(this.osTypeOptions, function(os){
        if(self.selectedHost['osType'] == os['value']){
            self.selectedOs = os['value'];
        }
    });
    // Populate the Access Mode dropdown with selected value.
    _.each(this.accessModeOptions, function(ac){
      if(self.selectedHost['accessMode'] == ac['value']){
          self.selectedAccessMode = ac['value'];
      }
    });
    // Populate the Availability Zone dropdown with selected value.
    _.each(this.selectedHost['availabilityZones'], function(az){
        self.availabilityZonesOptions.forEach(function(opt){
          if(az == opt['value']){
            self.selectedAZs.push(az);
          }
        })
      });
    this.modifyHostform = this.fb.group({
        'availabilityZones': new FormControl('', Validators.required),
        'hostName': new FormControl(this.selectedHost['hostName'], {validators: [Validators.required,Validators.pattern(this.validRule.validHostName), Validators.maxLength(28), Validators.minLength(2)]}),
        'accessMode': new FormControl('', Validators.required),
        'osType': new FormControl('', Validators.required),
        'ip': new FormControl(this.selectedHost['ip'], {validators:[Validators.required, Validators.pattern(this.validRule.validIp)]}),
        'initiators' : this.fb.array([])
    });
    
    _.each(this.selectedHost['initiators'], function(item){
         self.protocolOptions.forEach(function(pr){
          if(item['protocol'] == pr['value']){
            item['selectedProtocol'] = item['protocol'];
          }
          
        });
        let init = self.createInitiators(item);
        (self.modifyHostform.controls['initiators'] as FormArray).push(init)
    });
  }

  createInitiators(initiator?){
    if(initiator){
      console.log("Initiator:", initiator);
      return this.fb.group({
        portName: new FormControl(initiator.portName, Validators.required),
        protocol: new FormControl(initiator.selectedProtocol, Validators.required),
        selectedProtocol: new FormControl(initiator.selectedProtocol)
      })
    } else{
      return this.fb.group({
        portName: new FormControl('', Validators.required),
        protocol: new FormControl('', Validators.required)
      })
    }
  }
  addNext() {
    (this.modifyHostform.controls['initiators'] as FormArray).push(this.createInitiators())
  }
  removeLink(i: number) {
    if(this.modifyHostform.controls['initiators'].length > 1){
      this.modifyHostform.controls['initiators'].removeAt(i);
    }
  }
  onSubmit(){
    if(this.modifyHostform.valid){
        let param = {
            "accessMode" : this.modifyHostform.value.accessMode,
            "hostName" : this.modifyHostform.value.hostName,
            "osType" : this.modifyHostform.value.osType,
            "ip" : this.modifyHostform.value.ip,
            "availabilityZones" : this.modifyHostform.value.availabilityZones,
            "initiators" : this.modifyHostform.value.initiators
        }
        this.modifyHost(this.selectedHost.id, param);
    }
    
  }
  modifyHost(id, param){
    this.HostsService.modifyHost(id, param).subscribe((res) => {
        this.msgs = [];
        this.msgs.push({severity: 'success', summary: 'Success', detail: 'Host Modified Successfully.'});
        this.router.navigate(['/block',"fromHosts"]);
    }, (error) =>{
        this.msgs = [];
        this.msgs.push({severity: 'error', summary: 'Error', detail: error.json().message});
    });
  }

}
