import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService, Utils } from 'app/shared/api';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { AppService } from 'app/app.service';
import { I18nPluralPipe } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MenuItem ,ConfirmationService, Message} from '../../components/common/api';

import { VolumeService, SnapshotService,ReplicationService} from './volume.service';
import { ProfileService } from './../profile/profile.service';
import { HostsService } from './hosts.service';
import { AttachService } from './attach.service';
import { identifierModuleUrl } from '@angular/compiler';

let _ = require("underscore");
@Component({
    selector: 'volume-list',
    templateUrl: 'volumeList.html',
    providers: [ConfirmationService],
    styleUrls: [],
    animations: []
})
export class VolumeListComponent implements OnInit {
    createSnapshotDisplay = false;
    createReplicationDisplay = false;
    expandDisplay = false;
    modifyDisplay = false;
    attachDisplay: boolean = false;
    detachDisplay: boolean = false;
    noHosts: boolean = false;
    noAttachments: boolean = false;
    selectVolumeSize;
    newVolumeSize;
    newVolumeSizeFormat;
    unit:number = 1;
    repPeriod : number=60;
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
    attachModeOptions = [
        {
            label: "RO",
            value: "ro"
        },
        {
            label: "RW",
            value: "rw"
        }
    ]
    profileOptions = [];
    snapProfileOptions = [];
    azOption=[{label:"Secondary",value:"secondary"}];
    selectedVolumes = [];
    volumes = [];
    menuItems: MenuItem[];
    menuDeleDisableItems: MenuItem[];
    label = {
        name: this.I18N.keyID['sds_block_volume_name'],
        volume:  this.I18N.keyID['sds_block_volume_title'],
        profile: this.I18N.keyID['sds_block_volume_profile'],
        description:  this.I18N.keyID['sds_block_volume_descri']
    };
    snapshotFormGroup;
    modifyFormGroup;
    expandFormGroup;
    attachHostFormGroup;
    detachHostFormGroup;
    replicationGroup;
    errorMessage = {
        "name": { required: "Name is required." },
        "description": { maxlength: this.I18N.keyID['sds_validate_max_length'] },
        "repName":{ required: "Name is required." },
        "profileOption":{ required: "Profile is required." },
        "expandSize":{
            required: "Expand Capacity is required.",
            pattern: "Expand Capacity can only be number"
        },
        "hostId" : {required : "Host is required"},
        "attachmentId" : {required: "Attachment is required"}
    };
    profiles;
    selectedVolume;
    allHosts;
    attachedHosts;
    attachedHostOptions = [];
    hostOptions = [];
    msgs: Message[];

    constructor(
        public I18N: I18NService,
        private router: Router,
        private VolumeService: VolumeService,
        private SnapshotService: SnapshotService,
        private ProfileService: ProfileService,
        private HostsService: HostsService,
        private attach: AttachService,
        private ReplicationService: ReplicationService,
        private confirmationService: ConfirmationService,
        private fb: FormBuilder
    ) {
        this.snapshotFormGroup = this.fb.group({
            "name": ["", Validators.required],
            "profile": [""],
            "description": ["", Validators.maxLength(200)]
        });
        this.modifyFormGroup = this.fb.group({
            "name": ['', Validators.required]
        });
        this.expandFormGroup = this.fb.group({
            "expandSize":[1,{validators:[Validators.required,Validators.pattern(/^\d+$/)], updateOn:'change'} ],
            "capacityOption":[this.capacityOptions[0] ]
        });
        this.attachHostFormGroup = this.fb.group({
            "hostId" : ['', Validators.required],
            "attachMode" : ['']
        })
        this.detachHostFormGroup = this.fb.group({
            "attachmentId" : ['', Validators.required]
        })
        this.expandFormGroup.get("expandSize").valueChanges.subscribe(
            (value:string)=>{
                this.newVolumeSize =  parseInt(this.selectedVolume.size) + parseInt(value)*this.unit;
                this.newVolumeSizeFormat = Utils.getDisplayGBCapacity(this.newVolumeSize);
            }
        );
        this.expandFormGroup.get("capacityOption").valueChanges.subscribe(
            (value:string)=>{
                this.unit =(value === "tb" ? 1024: 1);
                this.newVolumeSize = parseInt(this.selectedVolume.size) + parseInt(this.expandFormGroup.value.expandSize)*this.unit;
                this.newVolumeSizeFormat = Utils.getDisplayGBCapacity(this.newVolumeSize);
            }
        )
        this.replicationGroup = this.fb.group({
            "repName": ['',{validators:[Validators.required], updateOn:'change'}],
            "az": [this.azOption[0]],
            "profileOption":['',{validators:[Validators.required], updateOn:'change'}]
        });

    }

    ngOnInit() {
        this.menuItems = [
            {
                "label": this.I18N.keyID['sds_block_volume_modify'],
                command: () => {
                    this.modifyDisplay = true;
                },
                disabled:false
            },
            {
                "label": this.I18N.keyID['sds_block_volume_attach_host'],
                command: () => {
                    this.showAttach();
                },
                disabled:false
            },
            {
                "label": this.I18N.keyID['sds_block_volume_detach_host'],
                command: () => {
                    this.showDetach();
                },
                disabled:false
            },
            {
                "label": this.I18N.keyID['sds_block_volume_expand'],
                command: () => {
                    this.expandDisplay = true;
                    this.expandFormGroup.reset();
                    this.expandFormGroup.controls["expandSize"].setValue(1);
                    this.unit = 1;
                },
                disabled:false
            },
            {
                "label": this.I18N.keyID['sds_block_volume_delete'], 
                command: () => {
                    if (this.selectedVolume && this.selectedVolume.id) {
                        this.deleteVolumes(this.selectedVolume);
                    }
                },
                disabled:false
            }
        ];
        this.menuDeleDisableItems = [
            {
                "label": this.I18N.keyID['sds_block_volume_modify'],
                command: () => {
                    this.modifyDisplay = true;
                },
                disabled:false
            },
            {
                "label": this.I18N.keyID['sds_block_volume_attach_host'],
                command: () => {
                    this.showAttach();
                },
                disabled:false
            },
            {
                "label": this.I18N.keyID['sds_block_volume_detach_host'],
                command: () => {
                    this.showDetach();
                },
                disabled:false
            },
            {
                "label": this.I18N.keyID['sds_block_volume_expand'],
                command: () => {
                    this.expandDisplay = true;
                    this.expandFormGroup.reset();
                    this.expandFormGroup.controls["expandSize"].setValue(1);
                    this.unit = 1;
                },
                disabled:false
            },
            {
                "label": this.I18N.keyID['sds_block_volume_delete'], 
                command: () => {
                    if (this.selectedVolume && this.selectedVolume.id) {
                        this.deleteVolumes(this.selectedVolume);
                    }
                },
                disabled:true
            }
        ];

        this.getProfiles()
    }

    showAttach(){
        let self = this;
        this.attachDisplay = true;
        this.hostOptions = [];
        this.attachHostFormGroup.reset();
        this.getAllHosts();
        if(this.allHosts.length == 0){
            this.noHosts = true;
        }
        _.each(this.allHosts, function(item){
            let option = {
                label: item['hostName'] + ' ' + '(' + item['ip'] + ')',
                value: item['id']
            }
            self.hostOptions.push(option);
        })
    }

    attachHost(){
        let params = {
            "volumeId" : this.selectedVolume.id,
            "hostId" : this.attachHostFormGroup.value.hostId,
            "attachMode" : this.attachHostFormGroup.value.attachMode
        }
        this.attach.createAttachment(params).subscribe((res) =>{
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: 'Host Attached Successfully.'});
            this.attachDisplay = false;
        }, (error) =>{
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: 'Error', detail: error.json().message});
        })
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
               "hostName": "ThisIsAReallyLongHostNametes",
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
     showDetach(){
        this.getAllAttachedHosts();
        if(this.attachedHosts.length > 0){
            let self = this;
            this.detachDisplay = true;
            this.attachedHostOptions = [];
            this.detachHostFormGroup.reset();
            this.getAllHosts();
            _.each(self.attachedHosts, function(atItem){
                _.each(self.allHosts, function(hostItem){
                    if(atItem['hostId'] == hostItem['id']){
                        let option = {
                            label: hostItem['hostName'] + ' ' + '(' + hostItem['ip'] + ')',
                            value: atItem['id']
                        }
                        self.attachedHostOptions.push(option);
                    }
                })
            })
        } else{
            this.noAttachments = true;
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: 'Error', detail: 'This volume does not have any attachments.'});
        }
    }

    detachHost(){
        this.attach.deleteAttachment(this.detachHostFormGroup.value.attachmentId).subscribe((res) =>{
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: 'Host Detached Successfully.'});
            this.detachDisplay = false;
        }, (error) => {
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: 'Error', detail: error.json().message});
        })
    }
     getAllAttachedHosts(){
         /*  this.attach.getAttachments().subscribe((res) => {
             this.attachedHosts = res.json();
         }, (error) =>{
             this.msgs = [];
             this.msgs.push({severity: 'error', summary: 'Error', detail: error.json().message});
         }) */
        this.attachedHosts = [
            {
              "id": "5dd3ae316e1d9154c420cc50",
              "createdAt": "2019-01-0407:01:SS.-06:-30-06:-30",
              "updatedAt": "2019-09-0410:09:SS.-06:-30-06:-30",
              "tenantId": "31dedac1-6f52-4c79-9e31-29c20d2cecba",
              "userId": "8abc42c0-7cee-49ec-9327-863576e73059",
              "osType": "Windows",
              "hostId": "5dc533adbb681988a31ae606",
              "attachMode": "rw",
              "volumeId": "5dd3ae31a4a6dc9c4a68084f",
              "mountpoint": "/fake/mnt/pnt/1",
              "status": "active"
            },
            {
              "id": "5dd3ae3153fa12f7ce1ae15e",
              "createdAt": "2019-03-2518:03:SS.-06:-30-06:-30",
              "updatedAt": "2019-01-0508:01:SS.-06:-30-06:-30",
              "tenantId": "1c559c9f-5a19-4817-8861-89ed03974094",
              "userId": "e9eb5d56-9a68-4244-ad0b-86bffc348020",
              "osType": "Linux",
              "hostId": "5dc533ad8c171efba5655fa9",
              "attachMode": "rw",
              "volumeId": "5dd3ae31755086ecea35b615",
              "mountpoint": "/fake/mnt/pnt/2",
              "status": "inactive"
            },
            {
              "id": "5dd3ae315621fbb44d4d9439",
              "createdAt": "2019-05-1305:05:SS.-06:-30-06:-30",
              "updatedAt": "2019-11-1905:11:SS.-06:-30-06:-30",
              "tenantId": "4a677675-2628-452c-be98-f7b6c1800309",
              "userId": "928f7624-0e2f-4f71-a7c4-d9094b9ead6b",
              "osType": "Linux",
              "hostId": "5dc533adb96a7ae3f05dfeac",
              "attachMode": "rw",
              "volumeId": "5dd3ae3130acd4a65755b9b5",
              "mountpoint": "/fake/mnt/pnt/3",
              "status": "active"
            },
            {
              "id": "5dd3ae315e7f32f34d8003f6",
              "createdAt": "2019-05-1416:05:SS.-06:-30-06:-30",
              "updatedAt": "2019-05-0618:05:SS.-06:-30-06:-30",
              "tenantId": "0ba9acb2-eae9-45f1-a6fa-37504e31ba6a",
              "userId": "85e0f539-8aab-42ac-b052-9f8f6e29a32a",
              "osType": "Windows",
              "hostId": "5dc533adbb681988a31ae606",
              "attachMode": "rw",
              "volumeId": "5dd3ae31124ff4ae79628264",
              "mountpoint": "/fake/mnt/pnt/4",
              "status": "active"
            },
            {
              "id": "5dd3ae3199b3180374f33f6a",
              "createdAt": "2019-10-1607:10:SS.-06:-30-06:-30",
              "updatedAt": "2019-11-1822:11:SS.-06:-30-06:-30",
              "tenantId": "cb4526c3-6cb7-4c95-8d52-bfde933536aa",
              "userId": "a18dbd76-372e-45c5-ab4e-0d5c9936db6a",
              "osType": "Windows",
              "hostId": "5dc533adb96a7ae3f05dfeac",
              "attachMode": "ro",
              "volumeId": "5dd3ae317f72c06f5f2178f9",
              "mountpoint": "/fake/mnt/pnt/5",
              "status": "abnormal"
            },
            {
              "id": "5dd3ae31cccf4bf4851e2a30",
              "createdAt": "2019-10-1022:10:SS.-06:-30-06:-30",
              "updatedAt": "2019-11-2019:11:SS.-06:-30-06:-30",
              "tenantId": "bde1bad8-3c1d-4f13-be4b-47a67890dcb0",
              "userId": "b6ee8c8c-2449-40e8-aee8-efd8d02ee3b1",
              "osType": "Windows",
              "hostId": "5dc533adcb936f222871ab3f",
              "attachMode": "ro",
              "volumeId": "5dd3ae31bc711d9293ad7d15",
              "mountpoint": "/fake/mnt/pnt/6",
              "status": "abnormal"
            },
            {
              "id": "5dd3ae316963c53228372711",
              "createdAt": "2019-05-2319:05:SS.-06:-30-06:-30",
              "updatedAt": "2019-03-0911:03:SS.-06:-30-06:-30",
              "tenantId": "f8dc08e2-e063-46bc-bcbe-bb6b1e4a0d3b",
              "userId": "88335be8-f6ca-461a-b31d-620ed1f4adb1",
              "osType": "Windows",
              "hostId": "5dc533adcb936f222871ab3f",
              "attachMode": "rw",
              "volumeId": "5dd3ae3131772c971b35168b",
              "mountpoint": "/fake/mnt/pnt/7",
              "status": "active"
            }
          ];
     }
    getVolumes() {
        this.selectedVolumes = [];
        this.VolumeService.getVolumes().subscribe((res) => {
            let volumes = res.json();
            this.ReplicationService.getAllReplicationsDetail().subscribe((resRep)=>{
                let replications = resRep.json();
                volumes.map((item)=>
                    {
                        let _profile = this.profiles.filter((profile,index,arr)=>{
                                return profile.id == item.profileId;
                            })[0];
                        item['profileName'] = _profile != undefined ? _profile.name : "--";
                        item['isDisableRep'] = false;
                        replications.map((rep)=>{
                            if(rep.primaryVolumeId == item.id || rep.secondaryVolumeId == item.id){
                                item['isDisableRep'] = true;
                            }
                        });
                        item.size = Utils.getDisplayGBCapacity(item.size);
                    }
                );
                this.SnapshotService.getSnapshots().subscribe((resSnap)=>{
                    let snaps = resSnap.json();
                    volumes.map((item)=>
                        {
                            item['disabled'] = false;
                            snaps.map((snap)=>{
                                if(snap.volumeId == item.id){
                                    item['disabled'] = true;
                                }
                            });
                        }
                    );
                    this.volumes = volumes;
                });
            });
        });
    }

    getProfiles() {
        this.profileOptions = [];
        this.snapProfileOptions = [];
        this.ProfileService.getProfiles().subscribe((res) => {
            this.profiles = res.json();
            this.profiles.forEach(profile => {
                if(!profile.storageType || profile.storageType =="block"){
                    this.profileOptions.push({
                        label: profile.name,
                        value: profile.id
                    });
                }
                if(profile.snapshotProperties.topology.bucket){
                    this.snapProfileOptions.push({
                        label: profile.name,
                        value: profile.id
                    });
                }
            });

            this.getVolumes();
        });
    }

   /*  batchDeleteVolume() {
        this.selectedVolumes.forEach(volume => {
            this.deleteVolume(volume.id);
        });
    }

    deleteVolumeById(id) {
        this.deleteVolume(id);
    } */

    deleteVolume(id) {
        this.VolumeService.deleteVolume(id).subscribe((res) => {
            this.getVolumes();
        }, (error) =>{
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: 'Error', detail: error.json().message});
        });
    }

    createSnapshot() {
        if(!this.snapshotFormGroup.valid){
            for(let i in this.snapshotFormGroup.controls){
                this.snapshotFormGroup.controls[i].markAsTouched();
            }
            return;
        }
        let param = {
            name: this.snapshotFormGroup.value.name,
            volumeId: this.selectedVolume.id,
            description: this.snapshotFormGroup.value.description
        }
        if(this.snapshotFormGroup.value.profile){
            param['profileId'] = this.snapshotFormGroup.value.profile
        }
        this.SnapshotService.createSnapshot(param).subscribe((res) => {
            this.createSnapshotDisplay = false;
            this.getProfiles();
        });
    }

    returnSelectedVolume(selectedVolume, dialog) {
        if (dialog === 'snapshot') {
            this.snapshotFormGroup.reset();
            this.createSnapshotDisplay = true;
        } else if (dialog === 'replication') {
            this.createReplicationDisplay = true;
        }
        let unit = selectedVolume.size.includes("GB") ? 1 : 10;

        this.selectedVolume = selectedVolume;
        this.replicationGroup.reset();
        this.replicationGroup.controls["repName"].setValue(selectedVolume.name+"-replication");
        this.replicationGroup.controls["az"].setValue(this.azOption[0]);
        this.selectVolumeSize = parseInt(selectedVolume.size)*unit;
    }

    modifyVolume() {
        let param = {
            name: this.modifyFormGroup.value.name
        };
        this.VolumeService.modifyVolume(this.selectedVolume.id, param).subscribe((res) => {
            this.getVolumes();
            this.modifyDisplay = false;
        });
    }
    expandVolume(){
        if(!this.expandFormGroup.valid){
            for(let i in this.expandFormGroup.controls){
                this.expandFormGroup.controls[i].markAsTouched();
            }
            return;
        }
        
        let param = {
            "newSize": this.newVolumeSize
        }
        this.VolumeService.expandVolume(this.selectedVolume.id, param).subscribe((res) => {
            this.getVolumes();
            this.expandDisplay = false;
        });
    }
    createReplication(){
        if(!this.replicationGroup.valid){
            for(let i in this.replicationGroup.controls){
                this.replicationGroup.controls[i].markAsTouched();
            }
            return;
        }
        let param = {
            "name":this.replicationGroup.value.repName ,
            "size": Number(this.selectedVolume.size.replace(" GB","")),
            "availabilityZone": this.replicationGroup.value.az.value,
            "profileId": this.replicationGroup.value.profileOption,
        }
        this.VolumeService.createVolume(param).subscribe((res) => {
            let param = {
                "name":this.replicationGroup.value.repName ,
                "primaryVolumeId": this.selectedVolume.id,
                "availabilityZone": this.replicationGroup.value.az.value,
                "profileId": this.replicationGroup.value.profileOption,
                "replicationMode":"async",
                "replicationPeriod":Number(this.repPeriod),
                "secondaryVolumeId":res.json().id
            }
            this.createReplicationDisplay = false;
            this.ReplicationService.createReplication(param).subscribe((res) => {
                this.getVolumes();
            },
            error=>{
                this.getVolumes();
            });
        });
    }
    deleteVolumes(volumes){
        let arr=[], msg;
        if(_.isArray(volumes)){
            volumes.forEach((item,index)=> {
                arr.push(item.id);
            })
            msg = "<div>Are you sure you want to delete the selected volumes?</div><h3>[ "+ volumes.length +" Volumes ]</h3>";
        }else{
            arr.push(volumes.id);
            msg = "<div>Are you sure you want to delete the volume?</div><h3>[ "+ volumes.name +" ]</h3>";
        }

        this.confirmationService.confirm({
            message: msg,
            header: this.I18N.keyID['sds_block_volume_deleVolu'],
            acceptLabel: this.I18N.keyID['sds_block_volume_delete'],
            isWarning: true,
            accept: ()=>{
                arr.forEach((item,index)=> {
                    this.deleteVolume(item)
                })

            },
            reject:()=>{}
        })

    }

    tablePaginate() {
        this.selectedVolumes = [];
    }
}
