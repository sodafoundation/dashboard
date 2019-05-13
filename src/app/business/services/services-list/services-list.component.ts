import { Router } from '@angular/router';
import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { Message} from '../../../components/common/api';
import { I18NService, MsgBoxService } from 'app/shared/api';
import { trigger, state, style, transition, animate} from '@angular/animations';
import { WorkflowService } from '../workflow.service';

@Component({
  selector: 'app-service-list',
    templateUrl: './services-list.component.html',
    styleUrls: ['./services-list.component.css'],
    providers: [MsgBoxService],
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
export class ServicesListComponent implements OnInit{
    msgs: Message[];
    instanceListLink: any;
    serviceCatalog: any[];
    services: any;
    instanceCount: number;
    constructor(private wfservice: WorkflowService){}
    
    ngOnInit() {
        this.getServicesList();    
        this.getInstanceCount();  
        this.serviceCatalog =  [{
            "cat_id" : "migrate-vol",
            "cat_name" : "Volume Migration",
            "cat_description" : "Migration of resources",
            "services" : [{
                "id" : "provision-volume",
                "name" : "Provision Volume",
                "description" : "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error repudiandae numquam deserunt quisquam repellat libero asperiores earum nam nobis, culpa ratione quam perferendis esse, cupiditate neque quas",
                "hasInstances" : false
            },
            {
                "id" : "provision-volume-backup",
                "name" : "Provision Volume Backup",
                "description" : "",
                "hasInstances" : true
            }]
        },
        {
            "cat_id" : "migrate-bucket",
            "cat_name" : "Bucket Migration",
            "cat_description" : "Migration of resources",
            "services" : [{
                "id" : "migrate-bucket",
                "name" : "Migrate Bucket",
                "description" : "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error repudiandae numquam deserunt quisquam repellat libero asperiores earum nam nobis, culpa ratione quam perferendis esse, cupiditate neque quas",
                "hasInstances" : false
            },
            {
                "id" : "migrate-bucket-backup",
                "name" : "Migrate Bucket Backup",
                "description" : "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error repudiandae numquam deserunt quisquam repellat libero asperiores earum nam nobis, culpa ratione quam perferendis esse, cupiditate neque quas",
                "hasInstances" : true
            }]
        }];
    }

    refreshList(){
        this.getServicesList();
    }
    getServicesList(){
        this.wfservice.getServices().subscribe(data=>{
            this.services = data;
            console.log("List of services: ", this.services);
        }, error => {
            console.log("Something went wrong with fetching services.", error);
        });
        this.services = [
                {
                    "service": {
                        "constraint": "",
                        "created_at": "Fri, 10 May 2019 08:12:08 GMT",
                        "description": "s3 bucket migration service",
                        "group": "migration",
                        "id": "30d92e0e-9a1b-4493-ab1b-a4fb9f15ed96",
                        "input": "",
                        "name": "bucket migration",
                        "tenant_id": "7fc5d8d4e24943a0967d9479b0c43cef",
                        "updated_at": "Fri, 10 May 2019 08:12:08 GMT",
                        "user_id": "648e308959784c649ef0fffa7aa047a1",
                        "workflows": [
                            {
                                "definition": {
                                    "auth": {
                                        "description": "Authentication Token.",
                                        "required": true,
                                        "type": "string"
                                    },
                                    "description": {
                                        "description": "Description about the Bucket Migration Dataflow.",
                                        "required": true,
                                        "type": "string"
                                    },
                                    "destBackend": {
                                        "description": "Destination Backend Storage.",
                                        "required": true,
                                        "type": "string"
                                    },
                                    "destBucketName": {
                                        "description": "Destination Bucket Name.",
                                        "required": true,
                                        "type": "string"
                                    },
                                    "hostIP": {
                                        "description": "Host IP for the OpenSDS.",
                                        "required": true,
                                        "type": "string"
                                    },
                                    "name": {
                                        "description": "Name for the Bucket Migration Dataflow.",
                                        "required": true,
                                        "type": "string"
                                    },
                                    "port": {
                                        "description": "Port for the service.",
                                        "required": true,
                                        "type": "string"
                                    },
                                    "remainSource": {
                                        "description": "Value for keeping the source objects.",
                                        "required": true,
                                        "type": "boolean"
                                    },
                                    "srcBucketName": {
                                        "description": "Source Bucket Name.",
                                        "required": true,
                                        "type": "string"
                                    },
                                    "tenantId": {
                                        "description": "Tenant ID.",
                                        "required": true,
                                        "type": "string"
                                    },
                                    "userId": {
                                        "description": "User ID.",
                                        "required": true,
                                        "type": "string"
                                    }
                                },
                                "description": "Bucket Migration Multi-Cloud Service",
                                "id": "569db7c2-a06a-456b-8808-b4e3f91387df",
                                "name": "migration-bucket"
                            }
                        ]
                    }
                },
                {
                    "service": {
                        "constraint": "",
                        "created_at": "Fri, 10 May 2019 08:12:08 GMT",
                        "description": "Volume Service",
                        "group": "provisioning",
                        "id": "95afa7cb-7ddd-4573-9fbe-a7190e23c2fa",
                        "input": "",
                        "name": "volume provision",
                        "tenant_id": "7fc5d8d4e24943a0967d9479b0c43cef",
                        "updated_at": "Fri, 10 May 2019 08:12:08 GMT",
                        "user_id": "648e308959784c649ef0fffa7aa047a1",
                        "workflows": [
                            {
                                "definition": {
                                    "accessprotocol": {
                                        "required": false,
                                        "type": "string"
                                    },
                                    "availabilityzone": {
                                        "required": false,
                                        "type": "string"
                                    },
                                    "connectioninfo": {
                                        "required": false,
                                        "type": "object"
                                    },
                                    "description": {
                                        "required": false,
                                        "type": "string"
                                    },
                                    "hostinfo": {
                                        "required": false,
                                        "type": "object"
                                    },
                                    "ipaddr": {
                                        "required": true,
                                        "type": "string"
                                    },
                                    "mountpoint": {
                                        "required": false,
                                        "type": "string"
                                    },
                                    "name": {
                                        "required": true,
                                        "type": "string"
                                    },
                                    "port": {
                                        "required": true,
                                        "type": "string"
                                    },
                                    "profileid": {
                                        "required": false,
                                        "type": "string"
                                    },
                                    "projectid": {
                                        "required": true,
                                        "type": "string"
                                    },
                                    "size": {
                                        "required": true,
                                        "type": "integer"
                                    },
                                    "snapshotfromcloud": {
                                        "required": false,
                                        "type": "string"
                                    },
                                    "snapshotid": {
                                        "required": false,
                                        "type": "string"
                                    },
                                    "tenantid": {
                                        "required": false,
                                        "type": "string"
                                    },
                                    "timeout": {
                                        "default": 60,
                                        "type": "integer"
                                    }
                                },
                                "description": "Provision an OpenSDS Volume",
                                "id": "6ff2a774-bebe-4f73-8786-4edff8aa63e7",
                                "name": "provision-volume"
                            },
                            {
                                "definition": {
                                    "auth": {
                                        "description": "Authentication Token.",
                                        "required": true,
                                        "type": "string"
                                    },
                                    "description": {
                                        "description": "Description about the Snapshot.",
                                        "required": true,
                                        "type": "string"
                                    },
                                    "hostIP": {
                                        "description": "IP of the OpenSDS host.",
                                        "required": true,
                                        "type": "string"
                                    },
                                    "name": {
                                        "description": "Name of the snapshot.",
                                        "required": true,
                                        "type": "string"
                                    },
                                    "port": {
                                        "description": "Port for the service.",
                                        "required": true,
                                        "type": "string"
                                    },
                                    "profileId": {
                                        "description": "Snapshot Profile ID.",
                                        "required": true,
                                        "type": "string"
                                    },
                                    "tenantId": {
                                        "description": "Tenant ID.",
                                        "required": true,
                                        "type": "string"
                                    },
                                    "volumeId": {
                                        "description": "Volume ID.",
                                        "required": true,
                                        "type": "string"
                                    }
                                },
                                "description": "Create an OpenSDS Volume Snapshot",
                                "id": "ef4455ee-16fe-4e5c-875f-d71cf07bf5ec",
                                "name": "snapshot-volume"
                            }
                        ]
                    }
                }
            ]
    }

    getInstanceCount(){
        this.wfservice.getInstances().subscribe(data => {
            console.log("Get the list of instances:", data);
            this.instanceCount = data.length;
        }, error => {

        });
        this.instanceCount = 10;
    }

    save() {
        this.msgs = [];
        this.msgs.push({severity:'info', summary:'Success', detail:'Data Saved'});
    }

    update() {
        this.msgs = [];
        this.msgs.push({severity:'info', summary:'Success', detail:'Data Updated'});
    }

    delete() {
        this.msgs = [];
        this.msgs.push({severity:'info', summary:'Success', detail:'Data Deleted'});
    }
    
}
