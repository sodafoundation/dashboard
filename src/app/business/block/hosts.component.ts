import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService, Utils } from 'app/shared/api';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { AppService } from 'app/app.service';
import { I18nPluralPipe } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Message, MenuItem ,ConfirmationService} from '../../components/common/api';

import { VolumeService } from './volume.service';
import { HostsService } from './hosts.service';
import { ProfileService } from './../profile/profile.service';
import { identifierModuleUrl } from '@angular/compiler';

let _ = require("underscore");
@Component({
    selector: 'app-hosts',
    templateUrl: 'hosts.component.html',
    providers: [ConfirmationService],
    styleUrls: [],
    animations: []
})
export class HostsComponent implements OnInit {
   
    capacityOptions = [
        {
            label: 'GB',
            value: 'gb'
        },
        {
            label: 'TB',
            value: 'tb'
        }

    ];
    profileOptions = [];
    snapProfileOptions = [];
    azOption=[{label:"Secondary",value:"secondary"}];
    selectedHosts = [];
    selectedHost;
    volumes = [];
    menuItems: MenuItem[];
    menuDeleDisableItems: MenuItem[];
    msgs: Message[];
    allHosts = [];
    label = {
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

    constructor(
        public I18N: I18NService,
        private router: Router,
        private VolumeService: VolumeService,
        private HostsService: HostsService,
        private confirmationService: ConfirmationService,
        private fb: FormBuilder
    ) {
       
    }

    

    returnSelectedHost(host){
        this.selectedHost = host;
    }

    ngOnInit() {
        this.getAllHosts();
        this.menuItems = [
           
            {
                "label": this.I18N.keyID['sds_block_volume_delete'], 
                command: () => {
                    if (this.selectedHost) {
                        this.batchDeleteHosts(this.selectedHost);
                    }
                },
                disabled:false
            }
        ];
        this.menuDeleDisableItems = [
           
            {
                "label": this.I18N.keyID['sds_block_volume_delete'], 
                command: () => {
                    if (this.selectedHost) {
                        this.batchDeleteHosts(this.selectedHost);
                    }
                },
                disabled:true
            }
        ];

    }

    getAllHosts(){
       /*  this.HostsService.getHosts().subscribe((res) => {
            this.allHosts = res.json();
        }, (error) =>{
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: 'Error', detail: error.message});
        }) */
        this.allHosts = [
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
                "az2", "default", "asia-pacific-elb01", "asia-pacific-elb02"
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
    }

   deleteHost(id){
       console.log("Delete host", id);
       this.HostsService.deleteHost(id).subscribe((res)=>{
        this.msgs.push({severity: 'success', summary: 'Success', detail: 'Host Deleted Successfully.'});
        this.router.navigate(['/block',"fromHosts"]);
    }, (error) =>{
        this.msgs = [];
        this.msgs.push({severity: 'error', summary: 'Error', detail: error.message});
    });
   }

    batchDeleteHosts(hosts){
        let arr=[], msg;
        if(_.isArray(hosts)){
            hosts.forEach((item,index)=> {
                arr.push(item.id);
            })
            msg = "<div>Are you sure you want to delete the selected hosts?</div><h3>[ "+ hosts.length +" Hosts ]</h3>";
        }else{
            arr.push(hosts.id);
            msg = "<div>Are you sure you want to delete the host?</div><h3>[ "+ hosts.hostName +" ]</h3>";
        }

        this.confirmationService.confirm({
            message: msg,
            header: this.I18N.keyID['sds_block_host_delete'],
            acceptLabel: this.I18N.keyID['sds_block_volume_delete'],
            isWarning: true,
            accept: ()=>{
                arr.forEach((item,index)=> {
                    this.deleteHost(item)
                })

            },
            reject:()=>{}
        })

    }


  /*   modifyVolume() {
        let param = {
            name: this.modifyFormGroup.value.name
        };
        this.VolumeService.modifyVolume(this.selectedVolume.id, param).subscribe((res) => {
            this.getVolumes();
            this.modifyDisplay = false;
        });
    } */

    tablePaginate() {
        this.selectedHosts = [];
    }
}
