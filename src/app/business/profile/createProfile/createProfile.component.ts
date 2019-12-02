import { Router } from '@angular/router';
import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { Validators, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { I18NService, Utils } from 'app/shared/api';
import { AppService } from 'app/app.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { I18nPluralPipe } from '@angular/common';

import { Message, SelectItem } from './../../../components/common/api';
import { ProfileService } from './../profile.service';

@Component({
    templateUrl: './createProfile.component.html',
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
export class CreateProfileComponent implements OnInit {
    showStorageAcl = false;
    showCustomization = false;
    showStoragePool = false;
    msgs: Message[] = [];
    userform: FormGroup;
    submitted: boolean;
    genders: SelectItem[];
    description: string;

    profileform: FormGroup;
    qosPolicy:FormGroup;
    repPolicy:FormGroup;
    snapPolicy:FormGroup;
    paramData= {
        extras:{protocol:""},
        storageType:""
    };
    label;
    param = {
        name: '',
        description: '',
        storageType: '',
        customProperties: {
             
        }
    };
    qosIsChecked = false;
    replicationIsChecked = false;
    snapshotIsChecked = false;
    isReplicationFlag = true;
    allProfileNameForCheck = [];
    protocolOptions = [
        {
            label: 'iSCSI',
            value: 'iscsi'
        },
        {
            label: 'FC',
            value: 'fibre_channel'
        },
        {
            label: 'RBD',
            value: 'rbd'
        },
        {
            label: 'nvmeof',
            value: 'nvmeof'
        }
    ];
    storageTypeOptions = [
        {
            label: 'Block',
            value: 'Block'
        },
        {
            label: 'File',
            value: 'File' 
        }
    ];
    storgeAclOptions = [
        {
            label: 'Read',
            value: 'Read'
        },
        {
            label: 'Write',
            value: 'Write'
        },
        {
            label: 'Execute',
            value: 'Execute'
        }
    ]
   
    customizationKey = '';
    customizationValue = '';

    
    customizationItems = [];

    replicationTypeOptions = [
        {
            label: 'Mirror',
            value: 'mirror'
        }/*,
        {
            label: 'Snapshot',
            value: 'snapshot'
        },
        {
            label: 'Clone',
            value: 'clone'
        },
        {
            label: 'Tokenized Clone',
            value: 'tokenized'
        }*/
    ];

    replicationRGOOptions = [
        {
            label: 'Availability Zone',
            value: 'availabilityZone'
        },
        {
            label: 'Rack',
            value: 'rack'
        },
        {
            label: 'Row',
            value: 'row'
        },
        {
            label: 'Server',
            value: 'server'
        },
        {
            label: 'Facility',
            value: 'facility'
        },
        {
            label: 'Region',
            value: 'region'
        }
    ];

    replicationModeOptions = [
        {
            label: 'Synchronous',
            value: 'Synchronous'
        },
        {
            label: 'Asynchronous',
            value: 'Asynchronous'
        },
        {
            label: 'Active',
            value: 'Active'
        },
        {
            label: 'Adaptive',
            value: 'Adaptive'
        }
    ];

    replicationRTOOptions = [
        {
            label: 'Immediate',
            value: 'Immediate'
        },
        {
            label: 'Online',
            value: 'Online'
        },
        {
            label: 'Nearline',
            value: 'Nearline'
        },
        {
            label: 'Offline',
            value: 'Offline'
        }
    ];

    replicationRPOOptions = [
        {
            label: '0',
            value: 0
        },
        {
            label: '4',
            value: 4
        },
        {
            label: '60',
            value: 60
        },
        {
            label: '3600',
            value: 3600
        }
    ];
    errorMessage={
        "name": { 
            required: this.I18N.keyID['sds_profile_create_name_require'],
            isExisted:this.I18N.keyID['sds_isExisted'],
        },
        "maxIOPS": { required: this.I18N.keyID['sds_required'].replace("{0}","MaxIOPS")},
        "maxBWS" :{ required: this.I18N.keyID['sds_required'].replace("{0}","MaxBWS")},
        "repPeriod" :{ required: this.I18N.keyID['sds_required'].replace("{0}","Period")},
        "repBandwidth" :{ required: this.I18N.keyID['sds_required'].replace("{0}","Bandwidth")},
        "repRPO" :{ required: this.I18N.keyID['sds_required'].replace("{0}","RPO")},
        "datetime" :{ required: this.I18N.keyID['sds_required'].replace("{0}","Execution Time")},
        "snapNum" :{ required: this.I18N.keyID['sds_required'].replace("{0}","Retention")},
        "duration" :{ required: this.I18N.keyID['sds_required'].replace("{0}","Retention")},
        "description":{maxlength:this.I18N.keyID['sds_validate_max_length']}
    };
    snapshotRetentionOptions = [
        {
            label: 'Time',
            value: 'Time'
        },
        {
            label: 'Quantity',
            value: 'Quantity'
        }
    ];
    snapSchedule = [
        {
            label: 'Daily',
            value: 'Daily'
        },
        {
            label: 'Weekly',
            value: 'Weekly'
        },
        {
            label: 'Monthly',
            value: 'Monthly'
        }
    ];

    weekDays;

    constructor(
        public I18N: I18NService,
        private router: Router,
        private ProfileService: ProfileService,
        private fb: FormBuilder
    ) {
        this.weekDays = [
            {
                label: 'Sun',
                value: 0,
                styleClass: 'week-select-list'
            },
            {
                label: 'Mon',
                value: 1,
                styleClass: 'week-select-list'
            },
            {
                label: 'Tue',
                value: 2,
                styleClass: 'week-select-list'
            },
            {
                label: 'Wed',
                value: 3,
                styleClass: 'week-select-list'
            },
            {
                label: 'Thu',
                value: 4,
                styleClass: 'week-select-list'
            },
            {
                label: 'Fri', value: 5,
                styleClass: 'week-select-list'
            },
            {
                label: 'Sat',
                value: 6,
                styleClass: 'week-select-list'
            }
        ];
    }

    ngOnInit() {
        this.getProfiles();
        this.label = {
            name: this.I18N.keyID['sds_block_volume_name'],
            description: this.I18N.keyID['sds_block_volume_descri'],
            storageType: this.I18N.keyID['sds_profile_storgeType'],
            protocol: this.I18N.keyID['sds_profile_access_pro'],
            type: this.I18N.keyID['sds_profile_pro_type'],
            storageAccess: this.I18N.keyID['sds_profile_storageAcl'],
            qosPolicy: this.I18N.keyID['sds_profile_qos_policy'],
            replicationPolicy: this.I18N.keyID['sds_profile_replication_policy'],
            snapshotPolicy: this.I18N.keyID['sds_profile_snap_policy'],
            customization: this.I18N.keyID['sds_profile_create_customization'],
            storagePool: this.I18N.keyID['sds_profile_avai_pool'],
            key: this.I18N.keyID['sds_profile_extra_key'],
            value: this.I18N.keyID['sds_profile_extra_value'],
            maxIOPS: this.I18N.keyID['sds_profile_create_maxIOPS'],
            minIOPS: this.I18N.keyID['sds_profile_create_minIOPS'],
            MBPS: this.I18N.keyID['sds_profile_create_maxBWS'],
            minBWS: this.I18N.keyID['sds_profile_create_minBWS'],
            latency: this.I18N.keyID['sds_profile_create_latency'],
            replicationLabel: {
                type:this.I18N.keyID['sds_profile_rep_type'] ,
                RGO: this.I18N.keyID['sds_profile_rep_rgo'],
                Mode:this.I18N.keyID['sds_profile_rep_mode'],
                RTO: this.I18N.keyID['sds_profile_rep_rto'],
                Period: this.I18N.keyID['sds_profile_rep_period'],
                RPO: this.I18N.keyID['sds_profile_rep_rpo'],
                Bandwidth: this.I18N.keyID['sds_profile_rep_bandwidth'],
                Consistency: this.I18N.keyID['sds_profile_rep_consis']
            },
            snapshotLabel: {
                automatic: this.I18N.keyID['sds_profile_snap_auto'],
                Schedule: this.I18N.keyID['sds_profile_snap_sche'],
                executionTime:this.I18N.keyID['sds_profile_snap_exetime'],
                Retention: this.I18N.keyID['sds_profile_snap_reten'],
                destination: this.I18N.keyID['sds_profile_snap_dest']
            }
        };

        this.profileform = this.fb.group({
            'name': new FormControl('', {validators:[Validators.required,Utils.isExisted(this.allProfileNameForCheck)]}),
            'description':new FormControl('',Validators.maxLength(200)),
            'protocol': new FormControl('iscsi'),
            'storageType': new FormControl('Thin'),
            'policys': new FormControl(''),
            'snapshotRetention': new FormControl('Time'),
            'storageTypes': new FormControl('Block', Validators.required),
            'storageAcl': new FormControl('')
        });
        this.qosPolicy = this.fb.group({
            "maxIOPS": new FormControl(6000, Validators.required),
            "minIOPS": new FormControl(500),
            "maxBWS" : new FormControl(100, Validators.required),
            "minBWS" : new FormControl(1),
            "latency" : new FormControl(5),
        });
        this.repPolicy = this.fb.group({
            "repType": new FormControl("mirror", Validators.required),
            "repMode": new FormControl(this.replicationModeOptions[0].value, Validators.required),
            "repPeriod": new FormControl('60', Validators.required),
            "repBandwidth": new FormControl(10, Validators.required),
            "repRGO": new FormControl(this.replicationRGOOptions[0].value, Validators.required),
            "repRTO": new FormControl(this.replicationRTOOptions[0].value, Validators.required),
            "repRPO": new FormControl('0', Validators.required),
            "repCons": new FormControl([])
        });
        this.snapPolicy = this.fb.group({
            "autoSnapshot": new FormControl(true),
            "Schedule": new FormControl(this.snapSchedule[0].value, Validators.required),
            "datetime": new FormControl("00:00", Validators.required),
            "snapNum": new FormControl(1, Validators.required),
            "duration": new FormControl(0, Validators.required),
            "retentionOptions": new FormControl(this.snapshotRetentionOptions[0].value),
            "snapshotDestination": new FormControl('')
        });
        this.paramData= {
            extras:{protocol:this.profileform.value.protocol},
            storageType:this.profileform.value.storageType
        };
        this.profileform.get("protocol").valueChanges.subscribe(
            (value:string)=>{
                this.paramData = {
                    extras:{protocol:value},
                    storageType:this.profileform.value.storageType
                }
            }
        );
        this.profileform.get("storageAcl").valueChanges.subscribe((value)=>{
            if(value.length < 2 && value != ""){
                this.showStorageAcl = true;
            }else{
                this.showStorageAcl = false;
            }
        })
        this.profileform.get("storageType").valueChanges.subscribe(
            (value:string)=>{
                this.paramData = {
                    extras:{protocol:this.profileform.value.protocol},
                    storageType:value
                }
            }
        );
        this.profileform.get("storageTypes").valueChanges.subscribe(
            (value:string)=>{
                if(value == "File"){
                    this.protocolOptions = [
                        {
                            label: 'NFS',
                            value: 'NFS'
                        },
                        {
                            label: 'CIFS',
                            value: 'CIFS' 
                        }
                    ]
                    this.profileform.patchValue({protocol: 'NFS'});
                    this.profileform.patchValue({storageAcl: ''});
                    this.isReplicationFlag = false;
                }else{
                    this.protocolOptions = [
                        {
                            label: 'iSCSI',
                            value: 'iscsi'
                        },
                        {
                            label: 'FC',
                            value: 'fibre_channel'
                        },
                        {
                            label: 'RBD',
                            value: 'rbd'
                        }
                    ]
                    this.profileform.patchValue({protocol: 'iscsi'})
                    this.isReplicationFlag = true;
                }
            }
        );

    }

    getProfiles() {
        this.allProfileNameForCheck = [];
        this.ProfileService.getProfiles().subscribe((res) => {
            let profiles = res.json();
            profiles.forEach(item=>{
                this.allProfileNameForCheck.push(item.name);
            })
        });
    }
    onSubmit(value) {
        this.submitted = true;
        this.msgs = [];
        this.msgs.push({ severity: 'info', summary: 'Success', detail: 'Form Submitted' });
        this.param.name = value.name;
        this.param.description = value.description;
        if(value.storageTypes == "Block"){
            value.storageTypes = "block";
        }else if(value.storageTypes == "File"){
            value.storageTypes = "file";
        }
        this.param.storageType = value.storageTypes;
        if(this.qosIsChecked){
            if(!this.qosPolicy.valid){
                for(let i in this.qosPolicy.controls){
                    this.qosPolicy.controls[i].markAsTouched();
                }
                return;
            }
            this.param["provisioningProperties"]= {
                "ioConnectivity": {
                    "maxIOPS": Number(this.qosPolicy.value.maxIOPS),
                    "minIOPS": Number(this.qosPolicy.value.minIOPS),
                    "maxBWS": Number(this.qosPolicy.value.maxBWS),
                    "minBWS": Number(this.qosPolicy.value.minBWS),
                    "latency": Number(this.qosPolicy.value.latency),
                    "accessProtocol": value.protocol == "FC" ? "fibre_channel" : value.protocol
                }, 
                "dataStorage": {
                    "provisioningPolicy": value.storageType
                }
            }
        }else{
            this.param["provisioningProperties"]= {
                "ioConnectivity": {
                    "accessProtocol": value.protocol == "FC" ? "fibre_channel" : value.protocol
                }, 
                "dataStorage": {
                    "provisioningPolicy": value.storageType
                }
            }
        }
        if(value.storageTypes == "file"){
            if(value.storageAcl && value.storageAcl !=""){
                this.param["provisioningProperties"].dataStorage.storageAccessCapability = value.storageAcl;
            }
            delete this.param["provisioningProperties"].dataStorage.provisioningPolicy;
        }
        if(this.replicationIsChecked){
            if(!this.repPolicy.valid){
                for(let i in this.repPolicy.controls){
                    this.repPolicy.controls[i].markAsTouched();
                }
                return;
            }
            this.param.customProperties["replicationType"]= "ArrayBased";
            this.param["replicationProperties"]={
                "dataProtection": {
                    "replicaType": this.repPolicy.value.repType,
                    "recoveryGeographicObjective": this.repPolicy.value.repRGO,
                    "recoveryPointObjectiveTime": this.repPolicy.value.repRPO,
                    "recoveryTimeObjective": this.repPolicy.value.repRTO,
                },
                "replicaInfos": {
                    "replicaUpdateMode": this.repPolicy.value.repMode,
                    "consistencyEnabled": this.repPolicy.value.repCons.length==0 ? false:true,
                    "replicationPeriod": this.repPolicy.value.repPeriod,
                    "replicationBandwidth": Number(this.repPolicy.value.repBandwidth)
                }
            }
        }
        if(this.snapshotIsChecked){
            if(!this.snapPolicy.valid){
                for(let i in this.snapPolicy.controls){
                    this.snapPolicy.controls[i].markAsTouched();
                }
                return;
            }
            let reten = this.snapPolicy.value.retentionOptions === "Quantity" ? {
                    "number": this.snapPolicy.value.snapNum,
                }:{"duration": this.snapPolicy.value.duration}
            if(!this.snapPolicy.value.autoSnapshot){
                this.param["snapshotProperties"]= {
                    "retention": reten
                }
            }else{
                this.param["snapshotProperties"]= {
                    "schedule": {
                        "datetime": "1970-01-01T"+this.snapPolicy.value.datetime+":00",
                        "occurrence": this.snapPolicy.value.Schedule //Monthly, Weekly, Daily, Hourly
                    },
                    "retention": reten
                }
            };
            if(this.param.storageType == "block"){
                this.param["snapshotProperties"]["topology"] = {"bucket":this.snapPolicy.value.snapshotDestination};
            }
        }
        if (this.customizationItems.length > 0) {
            let arrLength = this.customizationItems.length;
            for (let i = 0; i < arrLength; i++) {
                this.param.customProperties[this.customizationItems[i].key] = this.customizationItems[i].value;
            }
        }
        this.createProfile(this.param);
    }

    retentionChange(){
        console.log(this.profileform.controls['snapshotRetention'].value);
    }

    createProfile(param) {
        this.ProfileService.createProfile(param).subscribe((res) => {
            
            this.router.navigate(['/profile']);
        });
    }



    getI18n() {
        // return {};
    }

    showDetails(policyType) {
        this[policyType + 'IsChecked'] = !this[policyType + 'IsChecked'];
    }

    addCustomization() {
        this.customizationItems.push({
            key: this.customizationKey,
            value: this.customizationValue
        });
        this.showCustomization = false
        this.customizationKey = '';
        this.customizationValue = '';
    }

    deleteCustomization(index) {
        this.customizationItems.splice(index, 1);
    }

}
