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
                    if (this.selectedVolume && this.selectedVolume.id) {
                        this.showDetach(this.selectedVolume);
                    }
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
                    if (this.selectedVolume && this.selectedVolume.id) {
                        this.showDetach(this.selectedVolume);
                    }
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
            this.getProfiles();
        }, (error) =>{
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: 'Error', detail: error.json().message});
            this.attachDisplay = false;
        })
    }
    getAllHosts(){
        let self =this;
         this.HostsService.getHosts().subscribe((res) => {
             this.allHosts = res.json();
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
         }, (error) =>{
            console.log("No hosts.", error.json().message);
         })
     }
     showDetach(selectedVolume){
        this.getAllAttachedHosts();
        
    }

    detachHost(){
        this.attach.deleteAttachment(this.detachHostFormGroup.value.attachmentId).subscribe((res) =>{
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: 'Host Detached Successfully.'});
            this.detachDisplay = false;
            this.getProfiles();
        }, (error) => {
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: 'Error', detail: error.json().message});
        })
    }
     getAllAttachedHosts(){
         let self =this;
         this.attachedHostOptions = [];
         this.getAllHosts();
          this.attach.getAttachments().subscribe((res) => {
             this.attachedHosts = res.json();
             if(this.attachedHosts.length > 0 && _.where(this.attachedHosts, {volumeId: self.selectedVolume.id}).length > 0){
                let self = this;
                this.detachDisplay = true;
                this.noAttachments = false;
                this.detachHostFormGroup.reset();
                _.each(self.attachedHosts, function(atItem){
                        _.each(self.allHosts, function(hostItem){
                            if(self.selectedVolume.id == atItem['volumeId'] && atItem['hostId'] == hostItem['id']){
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
         }, (error) =>{
             console.log("Attachments not found", error);
         })
         
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
