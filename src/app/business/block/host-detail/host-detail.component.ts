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
  allHosts;
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
    this.HostsService.getHostById(id).subscribe((res) => {
      this.host = res.json();
      }, (err) => {
        console.log("Something went wrong. Details could not be fetched.")
      });
    
  }

}
