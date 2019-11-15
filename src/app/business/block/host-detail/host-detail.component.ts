import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute} from '@angular/router';

import { VolumeService } from '../volume.service';
import { HostsService } from '../hosts.service';
import { ProfileService } from '../../profile/profile.service';
import { I18NService, Utils } from '../../../../app/shared/api';

let _ = require("underscore");

@Component({
  selector: 'app-host-detail',
  templateUrl: './host-detail.component.html',
  styleUrls: [

  ]
})
export class HostDetailComponent implements OnInit {
  items;
  label;
  host;
  hostDetails;
  hostId;
  showHostSource: boolean = false;
  HostSource: string = "";
  fromHost: boolean = false;

  constructor(
    private HostsService: HostsService,
    private ActivatedRoute: ActivatedRoute,
    private ProfileService: ProfileService,
    public i18n:I18NService
  ) { }

  ngOnInit() {
    
    this.ActivatedRoute.params.subscribe((params) => this.hostId = params.hostId);
    console.log("Host: ", this.hostId);
    this.items = [
      { label: this.i18n.keyID["sds_Hosts_title"], url: '/block' },
      { label: this.i18n.keyID["sds_Host_detail"], url: '/hostDetails' }
    ];

    this.label = {
      hostName: "Name",
      ip: "IP Address",
      port: "Port",
      createdAt: "Created At",
      updatedAt: "Updated At",
      tenantId: "Tenant",
      status: "Status",
      osType: "OS",
      accessMode: "Access Mode",
      availabilityZones: "Availability Zones",
      initiators: "Initiators"
  };

   this.getHost(this.hostId);
   console.log("Host Details", this.host);
  }

  getHost(id){
   /*  this.HostsService.getHostById(id).subscribe((res) => {
      console.log("THis is the single host detail", res);
      }, (err) => {
        console.log("Something went wrong. Details could not be fetched.")
      }); */
    let allHosts = [
      {
        "id": "5dc533adcb936f222871ab3f",
        "createdAt": "2019-01-0608:01:SS.-06:-30-06:-30",
        "updatedAt": "2019-10-2323:10:SS.-06:-30-06:-30",
        "tenantId": "ed77d33b-0374-4537-923d-5cd20f22bd61",
        "hostName": "Teresa",
        "osType": "Linux",
        "accessMode": "Agentless",
        "ip": "188.205.186.200",
        "port": 2760,
        "availabilityZones": [
          "az3"
        ],
        "initiators": [
          {
            "portName": "do1",
            "protocol": "iSCSI"
          },
          {
            "portName": "ex2",
            "protocol": "NVMe"
          },
          {
            "portName": "excepteur3",
            "protocol": "iSCSI"
          }
        ],
        "isActive": false
      },
      {
        "id": "5dc533adb96a7ae3f05dfeac",
        "createdAt": "2019-03-2800:03:SS.-06:-30-06:-30",
        "updatedAt": "2019-01-1120:01:SS.-06:-30-06:-30",
        "tenantId": "f6ea6075-a023-4962-9be8-e47ad31f5359",
        "hostName": "Amparo",
        "osType": "Linux",
        "accessMode": "Agentless",
        "ip": "207.159.222.213",
        "port": 22880,
        "availabilityZones": [
          "az3"
        ],
        "initiators": [
          {
            "portName": "fugiat1",
            "protocol": "SCSI"
          },
          {
            "portName": "ad2",
            "protocol": "NVMe"
          }
        ],
        "isActive": false
      },
      {
        "id": "5dc533adbb681988a31ae606",
        "createdAt": "2019-10-2803:10:SS.-06:-30-06:-30",
        "updatedAt": "2019-01-0304:01:SS.-06:-30-06:-30",
        "tenantId": "2047a1f1-3187-4ae3-95d8-f2d68ac091c8",
        "hostName": "Earline",
        "osType": "Windows",
        "accessMode": "Agentless",
        "ip": "234.179.23.27",
        "port": 26606,
        "availabilityZones": [
          "az2"
        ],
        "initiators": [
          {
            "portName": "sit1",
            "protocol": "NVMe"
          },
          {
            "portName": "aliqua2",
            "protocol": "FC"
          },
          {
            "portName": "est3",
            "protocol": "FC"
          }
        ],
        "isActive": false
      },
      {
        "id": "5dc533ad8c171efba5655fa9",
        "createdAt": "2019-01-2621:01:SS.-06:-30-06:-30",
        "updatedAt": "2019-05-1800:05:SS.-06:-30-06:-30",
        "tenantId": "78fe0bb5-06ca-4e77-8465-ad363ffd8ea3",
        "hostName": "Hardy",
        "osType": "Linux",
        "accessMode": "Agentless",
        "ip": "19.9.38.184",
        "port": 8775,
        "availabilityZones": [
          "az3",
          "az3",
          "az2"
        ],
        "initiators": [
          {
            "portName": "qui1",
            "protocol": "SCSI"
          },
          {
            "portName": "labore2",
            "protocol": "FC"
          }
        ],
        "isActive": true
      },
      {
        "id": "5dc533ad2f20343932e4aa7d",
        "createdAt": "2019-07-0802:07:SS.-06:-30-06:-30",
        "updatedAt": "2019-08-2615:08:SS.-06:-30-06:-30",
        "tenantId": "d0c9f534-a9fe-4078-a328-3e3b87bf6010",
        "hostName": "Aisha",
        "osType": "Windows",
        "accessMode": "Agentless",
        "ip": "6.134.249.109",
        "port": 22504,
        "availabilityZones": [
          "az1",
          "az1"
        ],
        "initiators": [
          {
            "portName": "magna1",
            "protocol": "SCSI"
          },
          {
            "portName": "amet2",
            "protocol": "NVMe"
          }
        ],
        "isActive": true
      }
    ];
    this.host = _.find(allHosts, function(item){
        return item['id'] == id;
    });
  }

}
