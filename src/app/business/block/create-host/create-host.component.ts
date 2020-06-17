import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Validators, FormControl, FormGroup, FormBuilder, FormArray } from '@angular/forms';

import { Message, SelectItem } from './../../../components/common/api';
import { AvailabilityZonesService } from './../../resource/resource.service';
import { HostsService} from './../hosts.service';
import { I18NService,Utils } from '../../../../app/shared/api';
import { Form } from '../../../components/form/form';

@Component({
  selector: 'app-create-host',
  templateUrl: './create-host.component.html',
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
export class CreateHostComponent implements OnInit {

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
  availabilityZonesOptions = [];
  osTypeOptions;
  accessModeOptions;
  protocolOptions;
  createHostform;
  errorMessage = {
    "availabilityZones": { required: "Atleast one Zone is required."},
    "accessMode": { required: "Access Mode is required."},
    "osType": { required: "OS Type is required."},
    "ip": { 
        required: "IP Address is required",
        pattern: "Enter valid IPv4 address"
    },
    "hostName": {
        required: "Host Name is required.",
        maxlength: "Maximum 28 characters",
        minlength: "Minimum 2 characters",
        pattern: 'Enter valid Host Name. The host name can have only alphabets, numbers and hyphen. No special characters allowed. The name cannot start or end with a hyphen.'
    }
  };
  validRule = {
    'validHostName': '^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$',
    'validIp': '([0-9]{1,3})[.]([0-9]{1,3})[.]([0-9]{1,3})[.]([0-9]{1,3})' /* Validates IPv4 address */
  };
  
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private HostsService: HostsService,
    private availabilityZonesService:AvailabilityZonesService,
    public i18n:I18NService
  ) {}

  ngOnInit() {
    this.osTypeOptions = [
        {
            label: "Linux",
            value: 'linux'
        },
        {
            label: "Windows",
            value: 'windows'
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
        label: "FC",
        value: "fibre_channel"
      },
      {
        label: "NVMeOF",
        value: "nvmeof"
      }
    ]
    this.getAZ();
    this.items = [
        { label: this.i18n.keyID["sds_Hosts_title"], url: '/block' },
        { label: this.i18n.keyID["sds_create_host"], url: '/createHost' }
    ];
    this.createHostform = this.fb.group({
        'availabilityZones': new FormControl('', Validators.required),
        'hostName': new FormControl('', {validators: [Validators.required, Validators.maxLength(28), Validators.minLength(2), Validators.pattern(this.validRule.validHostName)]}),
        'accessMode': new FormControl('', Validators.required),
        'osType': new FormControl('', Validators.required),
        'ip': new FormControl('', {validators:[Validators.required, Validators.pattern(this.validRule.validIp)]}),
        'initiators' : this.fb.array([this.createInitiators()])
    });
   
  }
  createInitiators(){
    return this.fb.group({
      portName: new FormControl('', Validators.required),
      protocol: new FormControl('', Validators.required)
    })
  }
  addNext() {
    (this.createHostform.controls['initiators'] as FormArray).push(this.createInitiators())
  }
  removeLink(i: number) {
    if(this.createHostform.controls['initiators'].length > 1){
      this.createHostform.controls['initiators'].removeAt(i);
    }
  }
  onSubmit(){
    if(this.createHostform.valid){
        let param = {
            "accessMode" : this.createHostform.value.accessMode,
            "hostName" : this.createHostform.value.hostName,
            "osType" : this.createHostform.value.osType,
            "ip" : this.createHostform.value.ip,
            "availabilityZones" : this.createHostform.value.availabilityZones,
            "initiators" : this.createHostform.value.initiators
        }
        this.createHost(param);
    }
    
  }
  createHost(param){
    this.HostsService.createHost(param).subscribe((res) => {
        this.msgs = [];
        this.msgs.push({severity: 'success', summary: 'Success', detail: 'Host Created Successfully.'});
        this.router.navigate(['/block',"fromHosts"]);
    }, (error) =>{
        this.msgs = [];
        this.msgs.push({severity: 'error', summary: 'Error', detail: error.json().message});
    });
  }

  getAZ(){
    this.availabilityZonesService.getAZ().subscribe((azRes) => {
      let AZs=azRes.json();
      let azArr = [];
      if(AZs && AZs.length !== 0){
          AZs.forEach(item =>{
              let obj = {label: item, value: item};
              azArr.push(obj);
          })
      }
      this.availabilityZonesOptions = azArr;
    })
  }


}
