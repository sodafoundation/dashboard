import { Router,ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import {OverlayPanelModule} from '../../../components/common/api';
import { I18NService, MsgBoxService } from '../../../shared/api';
import * as _ from "underscore";

@Component({
  selector: 'app-instance-list',
  templateUrl: './instance-list.component.html',
  styleUrls: ['./instance-list.component.css']
})
export class InstanceListComponent implements OnInit {
  instances: any[] ;
  first: number = 0;
  id: any;
  loading: boolean;
  constructor( private router: Router,
    private ActivatedRoute:ActivatedRoute,
    public I18N: I18NService,
    ) { }

  ngOnInit() {
    this.loading = true;
    this.id = this.ActivatedRoute.snapshot.params['id'];
    console.log("Sent id in Instance list is ", this.id);
    this.instances  = [
      {
          "status": "requested",
          "start_timestamp": "2019-05-03T01:12:29.662883Z",
          "log": [{
              "status": "requested",
              "timestamp": "2019-05-03T01:12:29.000000Z"
          }],
          "parameters": {
              "description": "Migration_test_orchestration",
              "srcBucketName": "aws-orchestrate",
              "userId": "648e308959784c649ef0fffa7aa047a1",
              "auth": "aa",
              "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
              "destBackend": "hw-backend",
              "destBucketName": "hw-orchestrate",
              "hostIP": "192.168.20.67",
              "remainSource": true,
              "port": "8089",
              "name": "testmigration"
          },
          "runner": {
              "runner_module": "mistral_v2",
              "name": "mistral-v2",
              "runner_package": "mistral_v2",
              "description": "A runner for executing mistral v2 workflow.",
              "enabled": true,
              "query_module": "mistral_v2",
              "output_schema": {},
              "runner_parameters": {
                  "skip_notify": {
                      "default": [],
                      "type": "array",
                      "description": "List of tasks to skip notifications for."
                  },
                  "task": {
                      "type": "string",
                      "description": "The name of the task to run for reverse workflow."
                  },
                  "context": {
                      "default": {},
                      "type": "object",
                      "description": "Additional workflow inputs."
                  },
                  "workflow": {
                      "type": "string",
                      "description": "y."
                  }
              },
              "id": "5cb9695892395f011a535d91",
              "uid": "runner_type:mistral-v2"
          },
          "web_url": "https://6b3362d45e17/#/history/5ccb957d92395f01051f13a3/general",
          "context": {
              "user": "st2admin",
              "pack": "opensds"
          },
          "action": {
              "name": "migration-bucket",
              "runner_type": "mistral-v2",
              "tags": [],
              "enabled": true,
              "metadata_file": "actions/migration_bucket.yaml",
              "pack": "opensds",
              "entry_point": "workflows/migration_bucket.yaml",
              "notify": {},
              "output_schema": {},
              "uid": "action:opensds:migration-bucket",
              "parameters": {
                  "description": {
                      "required": true,
                      "type": "string",
                      "description": "Description about the Bucket Migration Dataflow."
                  },
                  "name": {
                      "required": true,
                      "type": "string",
                      "description": "Name for the Bucket Migration Dataflow."
                  },
                  "userId": {
                      "required": true,
                      "type": "string",
                      "description": "User ID."
                  },
                  "srcBucketName": {
                      "required": true,
                      "type": "string",
                      "description": "Source Bucket Name."
                  },
                  "auth": {
                      "required": true,
                      "type": "string",
                      "description": "Authentication Token."
                  },
                  "tenantId": {
                      "required": true,
                      "type": "string",
                      "description": "Tenant ID."
                  },
                  "destBucketName": {
                      "required": true,
                      "type": "string",
                      "description": "Destination Bucket Name."
                  },
                  "hostIP": {
                      "required": true,
                      "type": "string",
                      "description": "Host IP for the OpenSDS."
                  },
                  "remainSource": {
                      "required": true,
                      "type": "boolean",
                      "description": "Value for keeping the source objects."
                  },
                  "port": {
                      "required": true,
                      "type": "string",
                      "description": "Port for the service."
                  },
                  "destBackend": {
                      "required": true,
                      "type": "string",
                      "description": "Destination Backend Storage."
                  }
              },
              "ref": "opensds.migration-bucket",
              "id": "5cc6f98292395f2fedf7f197",
              "description": "Bucket Migration Multi-Cloud Service"
          },
          "liveaction": {
              "runner_info": {},
              "parameters": {
                  "description": "Migration_test_orchestration",
                  "name": "testmigration",
                  "srcBucketName": "aws-orchestrate",
                  "userId": "648e308959784c649ef0fffa7aa047a1",
                  "auth": "CBm8dsF42EA",
                  "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
                  "destBucketName": "hw-orchestrate",
                  "hostIP": "192.168.20.67",
                  "remainSource": true,
                  "port": "8089",
                  "destBackend": "hw-backend"
              },
              "action_is_workflow": true,
              "callback": {},
  
  "action": "opensds.migration-bucket",
              "id": "5ccb957d92395f01051f13a2"
          },
          "id": "5ccb957d92395f01051f13a3"
      },
      {
        "status": "completed",
        "start_timestamp": "2019-05-03T01:12:29.662883Z",
        "log": [{
            "status": "requested",
            "timestamp": "2019-05-03T01:12:29.000000Z"
        },{
          "status": "completed",
          "timestamp": "2019-05-03T01:20:29.000000Z"
      }],
        "parameters": {
            "description": "Migration_test_orchestration",
            "srcBucketName": "aws-orchestrate",
            "userId": "648e308959784c649ef0fffa7aa047a1",
            "auth": "aa",
            "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
            "destBackend": "hw-backend",
            "destBucketName": "hw-orchestrate",
            "hostIP": "192.168.20.67",
            "remainSource": true,
            "port": "8089",
            "name": "testmigration"
        },
        "runner": {
            "runner_module": "mistral_v2",
            "name": "mistral-v2",
            "runner_package": "mistral_v2",
            "description": "A runner for executing mistral v2 workflow.",
            "enabled": true,
            "query_module": "mistral_v2",
            "output_schema": {},
            "runner_parameters": {
                "skip_notify": {
                    "default": [],
                    "type": "array",
                    "description": "List of tasks to skip notifications for."
                },
                "task": {
                    "type": "string",
                    "description": "The name of the task to run for reverse workflow."
                },
                "context": {
                    "default": {},
                    "type": "object",
                    "description": "Additional workflow inputs."
                },
                "workflow": {
                    "type": "string",
                    "description": "y."
                }
            },
            "id": "5cb9695892395f011a535d91",
            "uid": "runner_type:mistral-v2"
        },
        "web_url": "https://6b3362d45e17/#/history/5ccb957d92395f01051f13a3/general",
        "context": {
            "user": "st2admin",
            "pack": "opensds"
        },
        "action": {
            "name": "migration-bucket",
            "runner_type": "mistral-v2",
            "tags": [],
            "enabled": true,
            "metadata_file": "actions/migration_bucket.yaml",
            "pack": "opensds",
            "entry_point": "workflows/migration_bucket.yaml",
            "notify": {},
            "output_schema": {},
            "uid": "action:opensds:migration-bucket",
            "parameters": {
                "description": {
                    "required": true,
                    "type": "string",
                    "description": "Description about the Bucket Migration Dataflow."
                },
                "name": {
                    "required": true,
                    "type": "string",
                    "description": "Name for the Bucket Migration Dataflow."
                },
                "userId": {
                    "required": true,
                    "type": "string",
                    "description": "User ID."
                },
                "srcBucketName": {
                    "required": true,
                    "type": "string",
                    "description": "Source Bucket Name."
                },
                "auth": {
                    "required": true,
                    "type": "string",
                    "description": "Authentication Token."
                },
                "tenantId": {
                    "required": true,
                    "type": "string",
                    "description": "Tenant ID."
                },
                "destBucketName": {
                    "required": true,
                    "type": "string",
                    "description": "Destination Bucket Name."
                },
                "hostIP": {
                    "required": true,
                    "type": "string",
                    "description": "Host IP for the OpenSDS."
                },
                "remainSource": {
                    "required": true,
                    "type": "boolean",
                    "description": "Value for keeping the source objects."
                },
                "port": {
                    "required": true,
                    "type": "string",
                    "description": "Port for the service."
                },
                "destBackend": {
                    "required": true,
                    "type": "string",
                    "description": "Destination Backend Storage."
                }
            },
            "ref": "opensds.migration-bucket",
            "id": "5cc6f98292395f2fedf7f197",
            "description": "Bucket Migration Multi-Cloud Service"
        },
        "liveaction": {
            "runner_info": {},
            "parameters": {
                "description": "Migration_test_orchestration",
                "name": "testmigration",
                "srcBucketName": "aws-orchestrate",
                "userId": "648e308959784c649ef0fffa7aa047a1",
                "auth": "CBm8dsF42EA",
                "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
                "destBucketName": "hw-orchestrate",
                "hostIP": "192.168.20.67",
                "remainSource": true,
                "port": "8089",
                "destBackend": "hw-backend"
            },
            "action_is_workflow": true,
            "callback": {},
  
  "action": "opensds.migration-bucket",
            "id": "5ccb957d92395f01051f13a2"
        },
        "id": "5ccb957d92395f01051f13a4"
      },
      {
        "status": "error",
        "start_timestamp": "2019-05-03T01:12:29.662883Z",
        "log": [{
            "status": "requested",
            "timestamp": "2019-05-03T01:12:29.000000Z"
        },{
          "status": "error",
          "timestamp": "2019-05-03T01:15:29.000000Z"
      }],
        "parameters": {
            "description": "Migration_test_orchestration",
            "srcBucketName": "aws-orchestrate",
            "userId": "648e308959784c649ef0fffa7aa047a1",
            "auth": "aa",
            "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
            "destBackend": "hw-backend",
            "destBucketName": "hw-orchestrate",
            "hostIP": "192.168.20.67",
            "remainSource": true,
            "port": "8089",
            "name": "testmigration"
        },
        "runner": {
            "runner_module": "mistral_v2",
            "name": "mistral-v2",
            "runner_package": "mistral_v2",
            "description": "A runner for executing mistral v2 workflow.",
            "enabled": true,
            "query_module": "mistral_v2",
            "output_schema": {},
            "runner_parameters": {
                "skip_notify": {
                    "default": [],
                    "type": "array",
                    "description": "List of tasks to skip notifications for."
                },
                "task": {
                    "type": "string",
                    "description": "The name of the task to run for reverse workflow."
                },
                "context": {
                    "default": {},
                    "type": "object",
                    "description": "Additional workflow inputs."
                },
                "workflow": {
                    "type": "string",
                    "description": "y."
                }
            },
            "id": "5cb9695892395f011a535d91",
            "uid": "runner_type:mistral-v2"
        },
        "web_url": "https://6b3362d45e17/#/history/5ccb957d92395f01051f13a3/general",
        "context": {
            "user": "st2admin",
            "pack": "opensds"
        },
        "action": {
            "name": "migration-bucket",
            "runner_type": "mistral-v2",
            "tags": [],
            "enabled": true,
            "metadata_file": "actions/migration_bucket.yaml",
            "pack": "opensds",
            "entry_point": "workflows/migration_bucket.yaml",
            "notify": {},
            "output_schema": {},
            "uid": "action:opensds:migration-bucket",
            "parameters": {
                "description": {
                    "required": true,
                    "type": "string",
                    "description": "Description about the Bucket Migration Dataflow."
                },
                "name": {
                    "required": true,
                    "type": "string",
                    "description": "Name for the Bucket Migration Dataflow."
                },
                "userId": {
                    "required": true,
                    "type": "string",
                    "description": "User ID."
                },
                "srcBucketName": {
                    "required": true,
                    "type": "string",
                    "description": "Source Bucket Name."
                },
                "auth": {
                    "required": true,
                    "type": "string",
                    "description": "Authentication Token."
                },
                "tenantId": {
                    "required": true,
                    "type": "string",
                    "description": "Tenant ID."
                },
                "destBucketName": {
                    "required": true,
                    "type": "string",
                    "description": "Destination Bucket Name."
                },
                "hostIP": {
                    "required": true,
                    "type": "string",
                    "description": "Host IP for the OpenSDS."
                },
                "remainSource": {
                    "required": true,
                    "type": "boolean",
                    "description": "Value for keeping the source objects."
                },
                "port": {
                    "required": true,
                    "type": "string",
                    "description": "Port for the service."
                },
                "destBackend": {
                    "required": true,
                    "type": "string",
                    "description": "Destination Backend Storage."
                }
            },
            "ref": "opensds.migration-bucket",
            "id": "5cc6f98292395f2fedf7f197",
            "description": "Bucket Migration Multi-Cloud Service"
        },
        "liveaction": {
            "runner_info": {},
            "parameters": {
                "description": "Migration_test_orchestration",
                "name": "testmigration",
                "srcBucketName": "aws-orchestrate",
                "userId": "648e308959784c649ef0fffa7aa047a1",
                "auth": "CBm8dsF42EA",
                "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
                "destBucketName": "hw-orchestrate",
                "hostIP": "192.168.20.67",
                "remainSource": true,
                "port": "8089",
                "destBackend": "hw-backend"
            },
            "action_is_workflow": true,
            "callback": {},
  
  "action": "opensds.migration-bucket",
            "id": "5ccb957d92395f01051f13a2"
        },
        "id": "5ccb957d92395f01051f13a5"
      },
      {
        "status": "error",
        "start_timestamp": "2019-05-03T01:12:29.662883Z",
        "log": [{
            "status": "requested",
            "timestamp": "2019-05-03T01:12:29.000000Z"
        },{
          "status": "error",
          "timestamp": "2019-05-03T01:15:29.000000Z"
      }],
        "parameters": {
            "description": "Migration_test_orchestration",
            "srcBucketName": "aws-orchestrate",
            "userId": "648e308959784c649ef0fffa7aa047a1",
            "auth": "aa",
            "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
            "destBackend": "hw-backend",
            "destBucketName": "hw-orchestrate",
            "hostIP": "192.168.20.67",
            "remainSource": true,
            "port": "8089",
            "name": "testmigration"
        },
        "runner": {
            "runner_module": "mistral_v2",
            "name": "mistral-v2",
            "runner_package": "mistral_v2",
            "description": "A runner for executing mistral v2 workflow.",
            "enabled": true,
            "query_module": "mistral_v2",
            "output_schema": {},
            "runner_parameters": {
                "skip_notify": {
                    "default": [],
                    "type": "array",
                    "description": "List of tasks to skip notifications for."
                },
                "task": {
                    "type": "string",
                    "description": "The name of the task to run for reverse workflow."
                },
                "context": {
                    "default": {},
                    "type": "object",
                    "description": "Additional workflow inputs."
                },
                "workflow": {
                    "type": "string",
                    "description": "y."
                }
            },
            "id": "5cb9695892395f011a535d91",
            "uid": "runner_type:mistral-v2"
        },
        "web_url": "https://6b3362d45e17/#/history/5ccb957d92395f01051f13a3/general",
        "context": {
            "user": "st2admin",
            "pack": "opensds"
        },
        "action": {
            "name": "migration-bucket",
            "runner_type": "mistral-v2",
            "tags": [],
            "enabled": true,
            "metadata_file": "actions/migration_bucket.yaml",
            "pack": "opensds",
            "entry_point": "workflows/migration_bucket.yaml",
            "notify": {},
            "output_schema": {},
            "uid": "action:opensds:migration-bucket",
            "parameters": {
                "description": {
                    "required": true,
                    "type": "string",
                    "description": "Description about the Bucket Migration Dataflow."
                },
                "name": {
                    "required": true,
                    "type": "string",
                    "description": "Name for the Bucket Migration Dataflow."
                },
                "userId": {
                    "required": true,
                    "type": "string",
                    "description": "User ID."
                },
                "srcBucketName": {
                    "required": true,
                    "type": "string",
                    "description": "Source Bucket Name."
                },
                "auth": {
                    "required": true,
                    "type": "string",
                    "description": "Authentication Token."
                },
                "tenantId": {
                    "required": true,
                    "type": "string",
                    "description": "Tenant ID."
                },
                "destBucketName": {
                    "required": true,
                    "type": "string",
                    "description": "Destination Bucket Name."
                },
                "hostIP": {
                    "required": true,
                    "type": "string",
                    "description": "Host IP for the OpenSDS."
                },
                "remainSource": {
                    "required": true,
                    "type": "boolean",
                    "description": "Value for keeping the source objects."
                },
                "port": {
                    "required": true,
                    "type": "string",
                    "description": "Port for the service."
                },
                "destBackend": {
                    "required": true,
                    "type": "string",
                    "description": "Destination Backend Storage."
                }
            },
            "ref": "opensds.migration-bucket",
            "id": "5cc6f98292395f2fedf7f197",
            "description": "Bucket Migration Multi-Cloud Service"
        },
        "liveaction": {
            "runner_info": {},
            "parameters": {
                "description": "Migration_test_orchestration",
                "name": "testmigration",
                "srcBucketName": "aws-orchestrate",
                "userId": "648e308959784c649ef0fffa7aa047a1",
                "auth": "CBm8dsF42EA",
                "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
                "destBucketName": "hw-orchestrate",
                "hostIP": "192.168.20.67",
                "remainSource": true,
                "port": "8089",
                "destBackend": "hw-backend"
            },
            "action_is_workflow": true,
            "callback": {},
  
  "action": "opensds.migration-bucket",
            "id": "5ccb957d92395f01051f13a2"
        },
        "id": "5ccb957d92395f01051f13a5"
      },
      {
        "status": "error",
        "start_timestamp": "2019-05-03T01:12:29.662883Z",
        "log": [{
            "status": "requested",
            "timestamp": "2019-05-03T01:12:29.000000Z"
        },{
          "status": "error",
          "timestamp": "2019-05-03T01:15:29.000000Z"
      }],
        "parameters": {
            "description": "Migration_test_orchestration",
            "srcBucketName": "aws-orchestrate",
            "userId": "648e308959784c649ef0fffa7aa047a1",
            "auth": "aa",
            "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
            "destBackend": "hw-backend",
            "destBucketName": "hw-orchestrate",
            "hostIP": "192.168.20.67",
            "remainSource": true,
            "port": "8089",
            "name": "testmigration"
        },
        "runner": {
            "runner_module": "mistral_v2",
            "name": "mistral-v2",
            "runner_package": "mistral_v2",
            "description": "A runner for executing mistral v2 workflow.",
            "enabled": true,
            "query_module": "mistral_v2",
            "output_schema": {},
            "runner_parameters": {
                "skip_notify": {
                    "default": [],
                    "type": "array",
                    "description": "List of tasks to skip notifications for."
                },
                "task": {
                    "type": "string",
                    "description": "The name of the task to run for reverse workflow."
                },
                "context": {
                    "default": {},
                    "type": "object",
                    "description": "Additional workflow inputs."
                },
                "workflow": {
                    "type": "string",
                    "description": "y."
                }
            },
            "id": "5cb9695892395f011a535d91",
            "uid": "runner_type:mistral-v2"
        },
        "web_url": "https://6b3362d45e17/#/history/5ccb957d92395f01051f13a3/general",
        "context": {
            "user": "st2admin",
            "pack": "opensds"
        },
        "action": {
            "name": "migration-bucket",
            "runner_type": "mistral-v2",
            "tags": [],
            "enabled": true,
            "metadata_file": "actions/migration_bucket.yaml",
            "pack": "opensds",
            "entry_point": "workflows/migration_bucket.yaml",
            "notify": {},
            "output_schema": {},
            "uid": "action:opensds:migration-bucket",
            "parameters": {
                "description": {
                    "required": true,
                    "type": "string",
                    "description": "Description about the Bucket Migration Dataflow."
                },
                "name": {
                    "required": true,
                    "type": "string",
                    "description": "Name for the Bucket Migration Dataflow."
                },
                "userId": {
                    "required": true,
                    "type": "string",
                    "description": "User ID."
                },
                "srcBucketName": {
                    "required": true,
                    "type": "string",
                    "description": "Source Bucket Name."
                },
                "auth": {
                    "required": true,
                    "type": "string",
                    "description": "Authentication Token."
                },
                "tenantId": {
                    "required": true,
                    "type": "string",
                    "description": "Tenant ID."
                },
                "destBucketName": {
                    "required": true,
                    "type": "string",
                    "description": "Destination Bucket Name."
                },
                "hostIP": {
                    "required": true,
                    "type": "string",
                    "description": "Host IP for the OpenSDS."
                },
                "remainSource": {
                    "required": true,
                    "type": "boolean",
                    "description": "Value for keeping the source objects."
                },
                "port": {
                    "required": true,
                    "type": "string",
                    "description": "Port for the service."
                },
                "destBackend": {
                    "required": true,
                    "type": "string",
                    "description": "Destination Backend Storage."
                }
            },
            "ref": "opensds.migration-bucket",
            "id": "5cc6f98292395f2fedf7f197",
            "description": "Bucket Migration Multi-Cloud Service"
        },
        "liveaction": {
            "runner_info": {},
            "parameters": {
                "description": "Migration_test_orchestration",
                "name": "testmigration",
                "srcBucketName": "aws-orchestrate",
                "userId": "648e308959784c649ef0fffa7aa047a1",
                "auth": "CBm8dsF42EA",
                "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
                "destBucketName": "hw-orchestrate",
                "hostIP": "192.168.20.67",
                "remainSource": true,
                "port": "8089",
                "destBackend": "hw-backend"
            },
            "action_is_workflow": true,
            "callback": {},
  
  "action": "opensds.migration-bucket",
            "id": "5ccb957d92395f01051f13a2"
        },
        "id": "5ccb957d92395f01051f13a5"
      },
      {
        "status": "error",
        "start_timestamp": "2019-05-03T01:12:29.662883Z",
        "log": [{
            "status": "requested",
            "timestamp": "2019-05-03T01:12:29.000000Z"
        },{
          "status": "error",
          "timestamp": "2019-05-03T01:15:29.000000Z"
      }],
        "parameters": {
            "description": "Migration_test_orchestration",
            "srcBucketName": "aws-orchestrate",
            "userId": "648e308959784c649ef0fffa7aa047a1",
            "auth": "aa",
            "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
            "destBackend": "hw-backend",
            "destBucketName": "hw-orchestrate",
            "hostIP": "192.168.20.67",
            "remainSource": true,
            "port": "8089",
            "name": "testmigration"
        },
        "runner": {
            "runner_module": "mistral_v2",
            "name": "mistral-v2",
            "runner_package": "mistral_v2",
            "description": "A runner for executing mistral v2 workflow.",
            "enabled": true,
            "query_module": "mistral_v2",
            "output_schema": {},
            "runner_parameters": {
                "skip_notify": {
                    "default": [],
                    "type": "array",
                    "description": "List of tasks to skip notifications for."
                },
                "task": {
                    "type": "string",
                    "description": "The name of the task to run for reverse workflow."
                },
                "context": {
                    "default": {},
                    "type": "object",
                    "description": "Additional workflow inputs."
                },
                "workflow": {
                    "type": "string",
                    "description": "y."
                }
            },
            "id": "5cb9695892395f011a535d91",
            "uid": "runner_type:mistral-v2"
        },
        "web_url": "https://6b3362d45e17/#/history/5ccb957d92395f01051f13a3/general",
        "context": {
            "user": "st2admin",
            "pack": "opensds"
        },
        "action": {
            "name": "migration-bucket",
            "runner_type": "mistral-v2",
            "tags": [],
            "enabled": true,
            "metadata_file": "actions/migration_bucket.yaml",
            "pack": "opensds",
            "entry_point": "workflows/migration_bucket.yaml",
            "notify": {},
            "output_schema": {},
            "uid": "action:opensds:migration-bucket",
            "parameters": {
                "description": {
                    "required": true,
                    "type": "string",
                    "description": "Description about the Bucket Migration Dataflow."
                },
                "name": {
                    "required": true,
                    "type": "string",
                    "description": "Name for the Bucket Migration Dataflow."
                },
                "userId": {
                    "required": true,
                    "type": "string",
                    "description": "User ID."
                },
                "srcBucketName": {
                    "required": true,
                    "type": "string",
                    "description": "Source Bucket Name."
                },
                "auth": {
                    "required": true,
                    "type": "string",
                    "description": "Authentication Token."
                },
                "tenantId": {
                    "required": true,
                    "type": "string",
                    "description": "Tenant ID."
                },
                "destBucketName": {
                    "required": true,
                    "type": "string",
                    "description": "Destination Bucket Name."
                },
                "hostIP": {
                    "required": true,
                    "type": "string",
                    "description": "Host IP for the OpenSDS."
                },
                "remainSource": {
                    "required": true,
                    "type": "boolean",
                    "description": "Value for keeping the source objects."
                },
                "port": {
                    "required": true,
                    "type": "string",
                    "description": "Port for the service."
                },
                "destBackend": {
                    "required": true,
                    "type": "string",
                    "description": "Destination Backend Storage."
                }
            },
            "ref": "opensds.migration-bucket",
            "id": "5cc6f98292395f2fedf7f197",
            "description": "Bucket Migration Multi-Cloud Service"
        },
        "liveaction": {
            "runner_info": {},
            "parameters": {
                "description": "Migration_test_orchestration",
                "name": "testmigration",
                "srcBucketName": "aws-orchestrate",
                "userId": "648e308959784c649ef0fffa7aa047a1",
                "auth": "CBm8dsF42EA",
                "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
                "destBucketName": "hw-orchestrate",
                "hostIP": "192.168.20.67",
                "remainSource": true,
                "port": "8089",
                "destBackend": "hw-backend"
            },
            "action_is_workflow": true,
            "callback": {},
  
  "action": "opensds.migration-bucket",
            "id": "5ccb957d92395f01051f13a2"
        },
        "id": "5ccb957d92395f01051f13a5"
      },
      {
        "status": "error",
        "start_timestamp": "2019-05-03T01:12:29.662883Z",
        "log": [{
            "status": "requested",
            "timestamp": "2019-05-03T01:12:29.000000Z"
        },{
          "status": "error",
          "timestamp": "2019-05-03T01:15:29.000000Z"
      }],
        "parameters": {
            "description": "Migration_test_orchestration",
            "srcBucketName": "aws-orchestrate",
            "userId": "648e308959784c649ef0fffa7aa047a1",
            "auth": "aa",
            "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
            "destBackend": "hw-backend",
            "destBucketName": "hw-orchestrate",
            "hostIP": "192.168.20.67",
            "remainSource": true,
            "port": "8089",
            "name": "testmigration"
        },
        "runner": {
            "runner_module": "mistral_v2",
            "name": "mistral-v2",
            "runner_package": "mistral_v2",
            "description": "A runner for executing mistral v2 workflow.",
            "enabled": true,
            "query_module": "mistral_v2",
            "output_schema": {},
            "runner_parameters": {
                "skip_notify": {
                    "default": [],
                    "type": "array",
                    "description": "List of tasks to skip notifications for."
                },
                "task": {
                    "type": "string",
                    "description": "The name of the task to run for reverse workflow."
                },
                "context": {
                    "default": {},
                    "type": "object",
                    "description": "Additional workflow inputs."
                },
                "workflow": {
                    "type": "string",
                    "description": "y."
                }
            },
            "id": "5cb9695892395f011a535d91",
            "uid": "runner_type:mistral-v2"
        },
        "web_url": "https://6b3362d45e17/#/history/5ccb957d92395f01051f13a3/general",
        "context": {
            "user": "st2admin",
            "pack": "opensds"
        },
        "action": {
            "name": "migration-bucket",
            "runner_type": "mistral-v2",
            "tags": [],
            "enabled": true,
            "metadata_file": "actions/migration_bucket.yaml",
            "pack": "opensds",
            "entry_point": "workflows/migration_bucket.yaml",
            "notify": {},
            "output_schema": {},
            "uid": "action:opensds:migration-bucket",
            "parameters": {
                "description": {
                    "required": true,
                    "type": "string",
                    "description": "Description about the Bucket Migration Dataflow."
                },
                "name": {
                    "required": true,
                    "type": "string",
                    "description": "Name for the Bucket Migration Dataflow."
                },
                "userId": {
                    "required": true,
                    "type": "string",
                    "description": "User ID."
                },
                "srcBucketName": {
                    "required": true,
                    "type": "string",
                    "description": "Source Bucket Name."
                },
                "auth": {
                    "required": true,
                    "type": "string",
                    "description": "Authentication Token."
                },
                "tenantId": {
                    "required": true,
                    "type": "string",
                    "description": "Tenant ID."
                },
                "destBucketName": {
                    "required": true,
                    "type": "string",
                    "description": "Destination Bucket Name."
                },
                "hostIP": {
                    "required": true,
                    "type": "string",
                    "description": "Host IP for the OpenSDS."
                },
                "remainSource": {
                    "required": true,
                    "type": "boolean",
                    "description": "Value for keeping the source objects."
                },
                "port": {
                    "required": true,
                    "type": "string",
                    "description": "Port for the service."
                },
                "destBackend": {
                    "required": true,
                    "type": "string",
                    "description": "Destination Backend Storage."
                }
            },
            "ref": "opensds.migration-bucket",
            "id": "5cc6f98292395f2fedf7f197",
            "description": "Bucket Migration Multi-Cloud Service"
        },
        "liveaction": {
            "runner_info": {},
            "parameters": {
                "description": "Migration_test_orchestration",
                "name": "testmigration",
                "srcBucketName": "aws-orchestrate",
                "userId": "648e308959784c649ef0fffa7aa047a1",
                "auth": "CBm8dsF42EA",
                "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
                "destBucketName": "hw-orchestrate",
                "hostIP": "192.168.20.67",
                "remainSource": true,
                "port": "8089",
                "destBackend": "hw-backend"
            },
            "action_is_workflow": true,
            "callback": {},
  
  "action": "opensds.migration-bucket",
            "id": "5ccb957d92395f01051f13a2"
        },
        "id": "5ccb957d92395f01051f13a5"
      },
      {
        "status": "error",
        "start_timestamp": "2019-05-03T01:12:29.662883Z",
        "log": [{
            "status": "requested",
            "timestamp": "2019-05-03T01:12:29.000000Z"
        },{
          "status": "error",
          "timestamp": "2019-05-03T01:15:29.000000Z"
      }],
        "parameters": {
            "description": "Migration_test_orchestration",
            "srcBucketName": "aws-orchestrate",
            "userId": "648e308959784c649ef0fffa7aa047a1",
            "auth": "aa",
            "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
            "destBackend": "hw-backend",
            "destBucketName": "hw-orchestrate",
            "hostIP": "192.168.20.67",
            "remainSource": true,
            "port": "8089",
            "name": "testmigration"
        },
        "runner": {
            "runner_module": "mistral_v2",
            "name": "mistral-v2",
            "runner_package": "mistral_v2",
            "description": "A runner for executing mistral v2 workflow.",
            "enabled": true,
            "query_module": "mistral_v2",
            "output_schema": {},
            "runner_parameters": {
                "skip_notify": {
                    "default": [],
                    "type": "array",
                    "description": "List of tasks to skip notifications for."
                },
                "task": {
                    "type": "string",
                    "description": "The name of the task to run for reverse workflow."
                },
                "context": {
                    "default": {},
                    "type": "object",
                    "description": "Additional workflow inputs."
                },
                "workflow": {
                    "type": "string",
                    "description": "y."
                }
            },
            "id": "5cb9695892395f011a535d91",
            "uid": "runner_type:mistral-v2"
        },
        "web_url": "https://6b3362d45e17/#/history/5ccb957d92395f01051f13a3/general",
        "context": {
            "user": "st2admin",
            "pack": "opensds"
        },
        "action": {
            "name": "migration-bucket",
            "runner_type": "mistral-v2",
            "tags": [],
            "enabled": true,
            "metadata_file": "actions/migration_bucket.yaml",
            "pack": "opensds",
            "entry_point": "workflows/migration_bucket.yaml",
            "notify": {},
            "output_schema": {},
            "uid": "action:opensds:migration-bucket",
            "parameters": {
                "description": {
                    "required": true,
                    "type": "string",
                    "description": "Description about the Bucket Migration Dataflow."
                },
                "name": {
                    "required": true,
                    "type": "string",
                    "description": "Name for the Bucket Migration Dataflow."
                },
                "userId": {
                    "required": true,
                    "type": "string",
                    "description": "User ID."
                },
                "srcBucketName": {
                    "required": true,
                    "type": "string",
                    "description": "Source Bucket Name."
                },
                "auth": {
                    "required": true,
                    "type": "string",
                    "description": "Authentication Token."
                },
                "tenantId": {
                    "required": true,
                    "type": "string",
                    "description": "Tenant ID."
                },
                "destBucketName": {
                    "required": true,
                    "type": "string",
                    "description": "Destination Bucket Name."
                },
                "hostIP": {
                    "required": true,
                    "type": "string",
                    "description": "Host IP for the OpenSDS."
                },
                "remainSource": {
                    "required": true,
                    "type": "boolean",
                    "description": "Value for keeping the source objects."
                },
                "port": {
                    "required": true,
                    "type": "string",
                    "description": "Port for the service."
                },
                "destBackend": {
                    "required": true,
                    "type": "string",
                    "description": "Destination Backend Storage."
                }
            },
            "ref": "opensds.migration-bucket",
            "id": "5cc6f98292395f2fedf7f197",
            "description": "Bucket Migration Multi-Cloud Service"
        },
        "liveaction": {
            "runner_info": {},
            "parameters": {
                "description": "Migration_test_orchestration",
                "name": "testmigration",
                "srcBucketName": "aws-orchestrate",
                "userId": "648e308959784c649ef0fffa7aa047a1",
                "auth": "CBm8dsF42EA",
                "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
                "destBucketName": "hw-orchestrate",
                "hostIP": "192.168.20.67",
                "remainSource": true,
                "port": "8089",
                "destBackend": "hw-backend"
            },
            "action_is_workflow": true,
            "callback": {},
  
  "action": "opensds.migration-bucket",
            "id": "5ccb957d92395f01051f13a2"
        },
        "id": "5ccb957d92395f01051f13a5"
      },
      {
        "status": "error",
        "start_timestamp": "2019-05-03T01:12:29.662883Z",
        "log": [{
            "status": "requested",
            "timestamp": "2019-05-03T01:12:29.000000Z"
        },{
          "status": "error",
          "timestamp": "2019-05-03T01:15:29.000000Z"
      }],
        "parameters": {
            "description": "Migration_test_orchestration",
            "srcBucketName": "aws-orchestrate",
            "userId": "648e308959784c649ef0fffa7aa047a1",
            "auth": "aa",
            "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
            "destBackend": "hw-backend",
            "destBucketName": "hw-orchestrate",
            "hostIP": "192.168.20.67",
            "remainSource": true,
            "port": "8089",
            "name": "testmigration"
        },
        "runner": {
            "runner_module": "mistral_v2",
            "name": "mistral-v2",
            "runner_package": "mistral_v2",
            "description": "A runner for executing mistral v2 workflow.",
            "enabled": true,
            "query_module": "mistral_v2",
            "output_schema": {},
            "runner_parameters": {
                "skip_notify": {
                    "default": [],
                    "type": "array",
                    "description": "List of tasks to skip notifications for."
                },
                "task": {
                    "type": "string",
                    "description": "The name of the task to run for reverse workflow."
                },
                "context": {
                    "default": {},
                    "type": "object",
                    "description": "Additional workflow inputs."
                },
                "workflow": {
                    "type": "string",
                    "description": "y."
                }
            },
            "id": "5cb9695892395f011a535d91",
            "uid": "runner_type:mistral-v2"
        },
        "web_url": "https://6b3362d45e17/#/history/5ccb957d92395f01051f13a3/general",
        "context": {
            "user": "st2admin",
            "pack": "opensds"
        },
        "action": {
            "name": "migration-bucket",
            "runner_type": "mistral-v2",
            "tags": [],
            "enabled": true,
            "metadata_file": "actions/migration_bucket.yaml",
            "pack": "opensds",
            "entry_point": "workflows/migration_bucket.yaml",
            "notify": {},
            "output_schema": {},
            "uid": "action:opensds:migration-bucket",
            "parameters": {
                "description": {
                    "required": true,
                    "type": "string",
                    "description": "Description about the Bucket Migration Dataflow."
                },
                "name": {
                    "required": true,
                    "type": "string",
                    "description": "Name for the Bucket Migration Dataflow."
                },
                "userId": {
                    "required": true,
                    "type": "string",
                    "description": "User ID."
                },
                "srcBucketName": {
                    "required": true,
                    "type": "string",
                    "description": "Source Bucket Name."
                },
                "auth": {
                    "required": true,
                    "type": "string",
                    "description": "Authentication Token."
                },
                "tenantId": {
                    "required": true,
                    "type": "string",
                    "description": "Tenant ID."
                },
                "destBucketName": {
                    "required": true,
                    "type": "string",
                    "description": "Destination Bucket Name."
                },
                "hostIP": {
                    "required": true,
                    "type": "string",
                    "description": "Host IP for the OpenSDS."
                },
                "remainSource": {
                    "required": true,
                    "type": "boolean",
                    "description": "Value for keeping the source objects."
                },
                "port": {
                    "required": true,
                    "type": "string",
                    "description": "Port for the service."
                },
                "destBackend": {
                    "required": true,
                    "type": "string",
                    "description": "Destination Backend Storage."
                }
            },
            "ref": "opensds.migration-bucket",
            "id": "5cc6f98292395f2fedf7f197",
            "description": "Bucket Migration Multi-Cloud Service"
        },
        "liveaction": {
            "runner_info": {},
            "parameters": {
                "description": "Migration_test_orchestration",
                "name": "testmigration",
                "srcBucketName": "aws-orchestrate",
                "userId": "648e308959784c649ef0fffa7aa047a1",
                "auth": "CBm8dsF42EA",
                "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
                "destBucketName": "hw-orchestrate",
                "hostIP": "192.168.20.67",
                "remainSource": true,
                "port": "8089",
                "destBackend": "hw-backend"
            },
            "action_is_workflow": true,
            "callback": {},
  
  "action": "opensds.migration-bucket",
            "id": "5ccb957d92395f01051f13a2"
        },
        "id": "5ccb957d92395f01051f13a5"
      },
      {
        "status": "error",
        "start_timestamp": "2019-05-03T01:12:29.662883Z",
        "log": [{
            "status": "requested",
            "timestamp": "2019-05-03T01:12:29.000000Z"
        },{
          "status": "error",
          "timestamp": "2019-05-03T01:15:29.000000Z"
      }],
        "parameters": {
            "description": "Migration_test_orchestration",
            "srcBucketName": "aws-orchestrate",
            "userId": "648e308959784c649ef0fffa7aa047a1",
            "auth": "aa",
            "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
            "destBackend": "hw-backend",
            "destBucketName": "hw-orchestrate",
            "hostIP": "192.168.20.67",
            "remainSource": true,
            "port": "8089",
            "name": "testmigration"
        },
        "runner": {
            "runner_module": "mistral_v2",
            "name": "mistral-v2",
            "runner_package": "mistral_v2",
            "description": "A runner for executing mistral v2 workflow.",
            "enabled": true,
            "query_module": "mistral_v2",
            "output_schema": {},
            "runner_parameters": {
                "skip_notify": {
                    "default": [],
                    "type": "array",
                    "description": "List of tasks to skip notifications for."
                },
                "task": {
                    "type": "string",
                    "description": "The name of the task to run for reverse workflow."
                },
                "context": {
                    "default": {},
                    "type": "object",
                    "description": "Additional workflow inputs."
                },
                "workflow": {
                    "type": "string",
                    "description": "y."
                }
            },
            "id": "5cb9695892395f011a535d91",
            "uid": "runner_type:mistral-v2"
        },
        "web_url": "https://6b3362d45e17/#/history/5ccb957d92395f01051f13a3/general",
        "context": {
            "user": "st2admin",
            "pack": "opensds"
        },
        "action": {
            "name": "migration-bucket",
            "runner_type": "mistral-v2",
            "tags": [],
            "enabled": true,
            "metadata_file": "actions/migration_bucket.yaml",
            "pack": "opensds",
            "entry_point": "workflows/migration_bucket.yaml",
            "notify": {},
            "output_schema": {},
            "uid": "action:opensds:migration-bucket",
            "parameters": {
                "description": {
                    "required": true,
                    "type": "string",
                    "description": "Description about the Bucket Migration Dataflow."
                },
                "name": {
                    "required": true,
                    "type": "string",
                    "description": "Name for the Bucket Migration Dataflow."
                },
                "userId": {
                    "required": true,
                    "type": "string",
                    "description": "User ID."
                },
                "srcBucketName": {
                    "required": true,
                    "type": "string",
                    "description": "Source Bucket Name."
                },
                "auth": {
                    "required": true,
                    "type": "string",
                    "description": "Authentication Token."
                },
                "tenantId": {
                    "required": true,
                    "type": "string",
                    "description": "Tenant ID."
                },
                "destBucketName": {
                    "required": true,
                    "type": "string",
                    "description": "Destination Bucket Name."
                },
                "hostIP": {
                    "required": true,
                    "type": "string",
                    "description": "Host IP for the OpenSDS."
                },
                "remainSource": {
                    "required": true,
                    "type": "boolean",
                    "description": "Value for keeping the source objects."
                },
                "port": {
                    "required": true,
                    "type": "string",
                    "description": "Port for the service."
                },
                "destBackend": {
                    "required": true,
                    "type": "string",
                    "description": "Destination Backend Storage."
                }
            },
            "ref": "opensds.migration-bucket",
            "id": "5cc6f98292395f2fedf7f197",
            "description": "Bucket Migration Multi-Cloud Service"
        },
        "liveaction": {
            "runner_info": {},
            "parameters": {
                "description": "Migration_test_orchestration",
                "name": "testmigration",
                "srcBucketName": "aws-orchestrate",
                "userId": "648e308959784c649ef0fffa7aa047a1",
                "auth": "CBm8dsF42EA",
                "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
                "destBucketName": "hw-orchestrate",
                "hostIP": "192.168.20.67",
                "remainSource": true,
                "port": "8089",
                "destBackend": "hw-backend"
            },
            "action_is_workflow": true,
            "callback": {},
  
  "action": "opensds.migration-bucket",
            "id": "5ccb957d92395f01051f13a2"
        },
        "id": "5ccb957d92395f01051f13a5"
      },
      {
        "status": "error",
        "start_timestamp": "2019-05-03T01:12:29.662883Z",
        "log": [{
            "status": "requested",
            "timestamp": "2019-05-03T01:12:29.000000Z"
        },{
          "status": "error",
          "timestamp": "2019-05-03T01:15:29.000000Z"
      }],
        "parameters": {
            "description": "Migration_test_orchestration",
            "srcBucketName": "aws-orchestrate",
            "userId": "648e308959784c649ef0fffa7aa047a1",
            "auth": "aa",
            "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
            "destBackend": "hw-backend",
            "destBucketName": "hw-orchestrate",
            "hostIP": "192.168.20.67",
            "remainSource": true,
            "port": "8089",
            "name": "testmigration"
        },
        "runner": {
            "runner_module": "mistral_v2",
            "name": "mistral-v2",
            "runner_package": "mistral_v2",
            "description": "A runner for executing mistral v2 workflow.",
            "enabled": true,
            "query_module": "mistral_v2",
            "output_schema": {},
            "runner_parameters": {
                "skip_notify": {
                    "default": [],
                    "type": "array",
                    "description": "List of tasks to skip notifications for."
                },
                "task": {
                    "type": "string",
                    "description": "The name of the task to run for reverse workflow."
                },
                "context": {
                    "default": {},
                    "type": "object",
                    "description": "Additional workflow inputs."
                },
                "workflow": {
                    "type": "string",
                    "description": "y."
                }
            },
            "id": "5cb9695892395f011a535d91",
            "uid": "runner_type:mistral-v2"
        },
        "web_url": "https://6b3362d45e17/#/history/5ccb957d92395f01051f13a3/general",
        "context": {
            "user": "st2admin",
            "pack": "opensds"
        },
        "action": {
            "name": "migration-bucket",
            "runner_type": "mistral-v2",
            "tags": [],
            "enabled": true,
            "metadata_file": "actions/migration_bucket.yaml",
            "pack": "opensds",
            "entry_point": "workflows/migration_bucket.yaml",
            "notify": {},
            "output_schema": {},
            "uid": "action:opensds:migration-bucket",
            "parameters": {
                "description": {
                    "required": true,
                    "type": "string",
                    "description": "Description about the Bucket Migration Dataflow."
                },
                "name": {
                    "required": true,
                    "type": "string",
                    "description": "Name for the Bucket Migration Dataflow."
                },
                "userId": {
                    "required": true,
                    "type": "string",
                    "description": "User ID."
                },
                "srcBucketName": {
                    "required": true,
                    "type": "string",
                    "description": "Source Bucket Name."
                },
                "auth": {
                    "required": true,
                    "type": "string",
                    "description": "Authentication Token."
                },
                "tenantId": {
                    "required": true,
                    "type": "string",
                    "description": "Tenant ID."
                },
                "destBucketName": {
                    "required": true,
                    "type": "string",
                    "description": "Destination Bucket Name."
                },
                "hostIP": {
                    "required": true,
                    "type": "string",
                    "description": "Host IP for the OpenSDS."
                },
                "remainSource": {
                    "required": true,
                    "type": "boolean",
                    "description": "Value for keeping the source objects."
                },
                "port": {
                    "required": true,
                    "type": "string",
                    "description": "Port for the service."
                },
                "destBackend": {
                    "required": true,
                    "type": "string",
                    "description": "Destination Backend Storage."
                }
            },
            "ref": "opensds.migration-bucket",
            "id": "5cc6f98292395f2fedf7f197",
            "description": "Bucket Migration Multi-Cloud Service"
        },
        "liveaction": {
            "runner_info": {},
            "parameters": {
                "description": "Migration_test_orchestration",
                "name": "testmigration",
                "srcBucketName": "aws-orchestrate",
                "userId": "648e308959784c649ef0fffa7aa047a1",
                "auth": "CBm8dsF42EA",
                "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
                "destBucketName": "hw-orchestrate",
                "hostIP": "192.168.20.67",
                "remainSource": true,
                "port": "8089",
                "destBackend": "hw-backend"
            },
            "action_is_workflow": true,
            "callback": {},
  
  "action": "opensds.migration-bucket",
            "id": "5ccb957d92395f01051f13a2"
        },
        "id": "5ccb957d92395f01051f13a5"
      },
      {
        "status": "error",
        "start_timestamp": "2019-05-03T01:12:29.662883Z",
        "log": [{
            "status": "requested",
            "timestamp": "2019-05-03T01:12:29.000000Z"
        },{
          "status": "error",
          "timestamp": "2019-05-03T01:15:29.000000Z"
      }],
        "parameters": {
            "description": "Migration_test_orchestration",
            "srcBucketName": "aws-orchestrate",
            "userId": "648e308959784c649ef0fffa7aa047a1",
            "auth": "aa",
            "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
            "destBackend": "hw-backend",
            "destBucketName": "hw-orchestrate",
            "hostIP": "192.168.20.67",
            "remainSource": true,
            "port": "8089",
            "name": "testmigration"
        },
        "runner": {
            "runner_module": "mistral_v2",
            "name": "mistral-v2",
            "runner_package": "mistral_v2",
            "description": "A runner for executing mistral v2 workflow.",
            "enabled": true,
            "query_module": "mistral_v2",
            "output_schema": {},
            "runner_parameters": {
                "skip_notify": {
                    "default": [],
                    "type": "array",
                    "description": "List of tasks to skip notifications for."
                },
                "task": {
                    "type": "string",
                    "description": "The name of the task to run for reverse workflow."
                },
                "context": {
                    "default": {},
                    "type": "object",
                    "description": "Additional workflow inputs."
                },
                "workflow": {
                    "type": "string",
                    "description": "y."
                }
            },
            "id": "5cb9695892395f011a535d91",
            "uid": "runner_type:mistral-v2"
        },
        "web_url": "https://6b3362d45e17/#/history/5ccb957d92395f01051f13a3/general",
        "context": {
            "user": "st2admin",
            "pack": "opensds"
        },
        "action": {
            "name": "migration-bucket",
            "runner_type": "mistral-v2",
            "tags": [],
            "enabled": true,
            "metadata_file": "actions/migration_bucket.yaml",
            "pack": "opensds",
            "entry_point": "workflows/migration_bucket.yaml",
            "notify": {},
            "output_schema": {},
            "uid": "action:opensds:migration-bucket",
            "parameters": {
                "description": {
                    "required": true,
                    "type": "string",
                    "description": "Description about the Bucket Migration Dataflow."
                },
                "name": {
                    "required": true,
                    "type": "string",
                    "description": "Name for the Bucket Migration Dataflow."
                },
                "userId": {
                    "required": true,
                    "type": "string",
                    "description": "User ID."
                },
                "srcBucketName": {
                    "required": true,
                    "type": "string",
                    "description": "Source Bucket Name."
                },
                "auth": {
                    "required": true,
                    "type": "string",
                    "description": "Authentication Token."
                },
                "tenantId": {
                    "required": true,
                    "type": "string",
                    "description": "Tenant ID."
                },
                "destBucketName": {
                    "required": true,
                    "type": "string",
                    "description": "Destination Bucket Name."
                },
                "hostIP": {
                    "required": true,
                    "type": "string",
                    "description": "Host IP for the OpenSDS."
                },
                "remainSource": {
                    "required": true,
                    "type": "boolean",
                    "description": "Value for keeping the source objects."
                },
                "port": {
                    "required": true,
                    "type": "string",
                    "description": "Port for the service."
                },
                "destBackend": {
                    "required": true,
                    "type": "string",
                    "description": "Destination Backend Storage."
                }
            },
            "ref": "opensds.migration-bucket",
            "id": "5cc6f98292395f2fedf7f197",
            "description": "Bucket Migration Multi-Cloud Service"
        },
        "liveaction": {
            "runner_info": {},
            "parameters": {
                "description": "Migration_test_orchestration",
                "name": "testmigration",
                "srcBucketName": "aws-orchestrate",
                "userId": "648e308959784c649ef0fffa7aa047a1",
                "auth": "CBm8dsF42EA",
                "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
                "destBucketName": "hw-orchestrate",
                "hostIP": "192.168.20.67",
                "remainSource": true,
                "port": "8089",
                "destBackend": "hw-backend"
            },
            "action_is_workflow": true,
            "callback": {},
  
  "action": "opensds.migration-bucket",
            "id": "5ccb957d92395f01051f13a2"
        },
        "id": "5ccb957d92395f01051f13a5"
      },
      {
        "status": "error",
        "start_timestamp": "2019-05-03T01:12:29.662883Z",
        "log": [{
            "status": "requested",
            "timestamp": "2019-05-03T01:12:29.000000Z"
        },{
          "status": "error",
          "timestamp": "2019-05-03T01:15:29.000000Z"
      }],
        "parameters": {
            "description": "Migration_test_orchestration",
            "srcBucketName": "aws-orchestrate",
            "userId": "648e308959784c649ef0fffa7aa047a1",
            "auth": "aa",
            "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
            "destBackend": "hw-backend",
            "destBucketName": "hw-orchestrate",
            "hostIP": "192.168.20.67",
            "remainSource": true,
            "port": "8089",
            "name": "testmigration"
        },
        "runner": {
            "runner_module": "mistral_v2",
            "name": "mistral-v2",
            "runner_package": "mistral_v2",
            "description": "A runner for executing mistral v2 workflow.",
            "enabled": true,
            "query_module": "mistral_v2",
            "output_schema": {},
            "runner_parameters": {
                "skip_notify": {
                    "default": [],
                    "type": "array",
                    "description": "List of tasks to skip notifications for."
                },
                "task": {
                    "type": "string",
                    "description": "The name of the task to run for reverse workflow."
                },
                "context": {
                    "default": {},
                    "type": "object",
                    "description": "Additional workflow inputs."
                },
                "workflow": {
                    "type": "string",
                    "description": "y."
                }
            },
            "id": "5cb9695892395f011a535d91",
            "uid": "runner_type:mistral-v2"
        },
        "web_url": "https://6b3362d45e17/#/history/5ccb957d92395f01051f13a3/general",
        "context": {
            "user": "st2admin",
            "pack": "opensds"
        },
        "action": {
            "name": "migration-bucket",
            "runner_type": "mistral-v2",
            "tags": [],
            "enabled": true,
            "metadata_file": "actions/migration_bucket.yaml",
            "pack": "opensds",
            "entry_point": "workflows/migration_bucket.yaml",
            "notify": {},
            "output_schema": {},
            "uid": "action:opensds:migration-bucket",
            "parameters": {
                "description": {
                    "required": true,
                    "type": "string",
                    "description": "Description about the Bucket Migration Dataflow."
                },
                "name": {
                    "required": true,
                    "type": "string",
                    "description": "Name for the Bucket Migration Dataflow."
                },
                "userId": {
                    "required": true,
                    "type": "string",
                    "description": "User ID."
                },
                "srcBucketName": {
                    "required": true,
                    "type": "string",
                    "description": "Source Bucket Name."
                },
                "auth": {
                    "required": true,
                    "type": "string",
                    "description": "Authentication Token."
                },
                "tenantId": {
                    "required": true,
                    "type": "string",
                    "description": "Tenant ID."
                },
                "destBucketName": {
                    "required": true,
                    "type": "string",
                    "description": "Destination Bucket Name."
                },
                "hostIP": {
                    "required": true,
                    "type": "string",
                    "description": "Host IP for the OpenSDS."
                },
                "remainSource": {
                    "required": true,
                    "type": "boolean",
                    "description": "Value for keeping the source objects."
                },
                "port": {
                    "required": true,
                    "type": "string",
                    "description": "Port for the service."
                },
                "destBackend": {
                    "required": true,
                    "type": "string",
                    "description": "Destination Backend Storage."
                }
            },
            "ref": "opensds.migration-bucket",
            "id": "5cc6f98292395f2fedf7f197",
            "description": "Bucket Migration Multi-Cloud Service"
        },
        "liveaction": {
            "runner_info": {},
            "parameters": {
                "description": "Migration_test_orchestration",
                "name": "testmigration",
                "srcBucketName": "aws-orchestrate",
                "userId": "648e308959784c649ef0fffa7aa047a1",
                "auth": "CBm8dsF42EA",
                "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
                "destBucketName": "hw-orchestrate",
                "hostIP": "192.168.20.67",
                "remainSource": true,
                "port": "8089",
                "destBackend": "hw-backend"
            },
            "action_is_workflow": true,
            "callback": {},
  
  "action": "opensds.migration-bucket",
            "id": "5ccb957d92395f01051f13a2"
        },
        "id": "5ccb957d92395f01051f13a5"
      },
      {
        "status": "error",
        "start_timestamp": "2019-05-03T01:12:29.662883Z",
        "log": [{
            "status": "requested",
            "timestamp": "2019-05-03T01:12:29.000000Z"
        },{
          "status": "error",
          "timestamp": "2019-05-03T01:15:29.000000Z"
      }],
        "parameters": {
            "description": "Migration_test_orchestration",
            "srcBucketName": "aws-orchestrate",
            "userId": "648e308959784c649ef0fffa7aa047a1",
            "auth": "aa",
            "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
            "destBackend": "hw-backend",
            "destBucketName": "hw-orchestrate",
            "hostIP": "192.168.20.67",
            "remainSource": true,
            "port": "8089",
            "name": "testmigration"
        },
        "runner": {
            "runner_module": "mistral_v2",
            "name": "mistral-v2",
            "runner_package": "mistral_v2",
            "description": "A runner for executing mistral v2 workflow.",
            "enabled": true,
            "query_module": "mistral_v2",
            "output_schema": {},
            "runner_parameters": {
                "skip_notify": {
                    "default": [],
                    "type": "array",
                    "description": "List of tasks to skip notifications for."
                },
                "task": {
                    "type": "string",
                    "description": "The name of the task to run for reverse workflow."
                },
                "context": {
                    "default": {},
                    "type": "object",
                    "description": "Additional workflow inputs."
                },
                "workflow": {
                    "type": "string",
                    "description": "y."
                }
            },
            "id": "5cb9695892395f011a535d91",
            "uid": "runner_type:mistral-v2"
        },
        "web_url": "https://6b3362d45e17/#/history/5ccb957d92395f01051f13a3/general",
        "context": {
            "user": "st2admin",
            "pack": "opensds"
        },
        "action": {
            "name": "migration-bucket",
            "runner_type": "mistral-v2",
            "tags": [],
            "enabled": true,
            "metadata_file": "actions/migration_bucket.yaml",
            "pack": "opensds",
            "entry_point": "workflows/migration_bucket.yaml",
            "notify": {},
            "output_schema": {},
            "uid": "action:opensds:migration-bucket",
            "parameters": {
                "description": {
                    "required": true,
                    "type": "string",
                    "description": "Description about the Bucket Migration Dataflow."
                },
                "name": {
                    "required": true,
                    "type": "string",
                    "description": "Name for the Bucket Migration Dataflow."
                },
                "userId": {
                    "required": true,
                    "type": "string",
                    "description": "User ID."
                },
                "srcBucketName": {
                    "required": true,
                    "type": "string",
                    "description": "Source Bucket Name."
                },
                "auth": {
                    "required": true,
                    "type": "string",
                    "description": "Authentication Token."
                },
                "tenantId": {
                    "required": true,
                    "type": "string",
                    "description": "Tenant ID."
                },
                "destBucketName": {
                    "required": true,
                    "type": "string",
                    "description": "Destination Bucket Name."
                },
                "hostIP": {
                    "required": true,
                    "type": "string",
                    "description": "Host IP for the OpenSDS."
                },
                "remainSource": {
                    "required": true,
                    "type": "boolean",
                    "description": "Value for keeping the source objects."
                },
                "port": {
                    "required": true,
                    "type": "string",
                    "description": "Port for the service."
                },
                "destBackend": {
                    "required": true,
                    "type": "string",
                    "description": "Destination Backend Storage."
                }
            },
            "ref": "opensds.migration-bucket",
            "id": "5cc6f98292395f2fedf7f197",
            "description": "Bucket Migration Multi-Cloud Service"
        },
        "liveaction": {
            "runner_info": {},
            "parameters": {
                "description": "Migration_test_orchestration",
                "name": "testmigration",
                "srcBucketName": "aws-orchestrate",
                "userId": "648e308959784c649ef0fffa7aa047a1",
                "auth": "CBm8dsF42EA",
                "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
                "destBucketName": "hw-orchestrate",
                "hostIP": "192.168.20.67",
                "remainSource": true,
                "port": "8089",
                "destBackend": "hw-backend"
            },
            "action_is_workflow": true,
            "callback": {},
  
  "action": "opensds.migration-bucket",
            "id": "5ccb957d92395f01051f13a2"
        },
        "id": "5ccb957d92395f01051f13a5"
      },
      {
        "status": "error",
        "start_timestamp": "2019-05-03T01:12:29.662883Z",
        "log": [{
            "status": "requested",
            "timestamp": "2019-05-03T01:12:29.000000Z"
        },{
          "status": "error",
          "timestamp": "2019-05-03T01:15:29.000000Z"
      }],
        "parameters": {
            "description": "Migration_test_orchestration",
            "srcBucketName": "aws-orchestrate",
            "userId": "648e308959784c649ef0fffa7aa047a1",
            "auth": "aa",
            "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
            "destBackend": "hw-backend",
            "destBucketName": "hw-orchestrate",
            "hostIP": "192.168.20.67",
            "remainSource": true,
            "port": "8089",
            "name": "testmigration"
        },
        "runner": {
            "runner_module": "mistral_v2",
            "name": "mistral-v2",
            "runner_package": "mistral_v2",
            "description": "A runner for executing mistral v2 workflow.",
            "enabled": true,
            "query_module": "mistral_v2",
            "output_schema": {},
            "runner_parameters": {
                "skip_notify": {
                    "default": [],
                    "type": "array",
                    "description": "List of tasks to skip notifications for."
                },
                "task": {
                    "type": "string",
                    "description": "The name of the task to run for reverse workflow."
                },
                "context": {
                    "default": {},
                    "type": "object",
                    "description": "Additional workflow inputs."
                },
                "workflow": {
                    "type": "string",
                    "description": "y."
                }
            },
            "id": "5cb9695892395f011a535d91",
            "uid": "runner_type:mistral-v2"
        },
        "web_url": "https://6b3362d45e17/#/history/5ccb957d92395f01051f13a3/general",
        "context": {
            "user": "st2admin",
            "pack": "opensds"
        },
        "action": {
            "name": "migration-bucket",
            "runner_type": "mistral-v2",
            "tags": [],
            "enabled": true,
            "metadata_file": "actions/migration_bucket.yaml",
            "pack": "opensds",
            "entry_point": "workflows/migration_bucket.yaml",
            "notify": {},
            "output_schema": {},
            "uid": "action:opensds:migration-bucket",
            "parameters": {
                "description": {
                    "required": true,
                    "type": "string",
                    "description": "Description about the Bucket Migration Dataflow."
                },
                "name": {
                    "required": true,
                    "type": "string",
                    "description": "Name for the Bucket Migration Dataflow."
                },
                "userId": {
                    "required": true,
                    "type": "string",
                    "description": "User ID."
                },
                "srcBucketName": {
                    "required": true,
                    "type": "string",
                    "description": "Source Bucket Name."
                },
                "auth": {
                    "required": true,
                    "type": "string",
                    "description": "Authentication Token."
                },
                "tenantId": {
                    "required": true,
                    "type": "string",
                    "description": "Tenant ID."
                },
                "destBucketName": {
                    "required": true,
                    "type": "string",
                    "description": "Destination Bucket Name."
                },
                "hostIP": {
                    "required": true,
                    "type": "string",
                    "description": "Host IP for the OpenSDS."
                },
                "remainSource": {
                    "required": true,
                    "type": "boolean",
                    "description": "Value for keeping the source objects."
                },
                "port": {
                    "required": true,
                    "type": "string",
                    "description": "Port for the service."
                },
                "destBackend": {
                    "required": true,
                    "type": "string",
                    "description": "Destination Backend Storage."
                }
            },
            "ref": "opensds.migration-bucket",
            "id": "5cc6f98292395f2fedf7f197",
            "description": "Bucket Migration Multi-Cloud Service"
        },
        "liveaction": {
            "runner_info": {},
            "parameters": {
                "description": "Migration_test_orchestration",
                "name": "testmigration",
                "srcBucketName": "aws-orchestrate",
                "userId": "648e308959784c649ef0fffa7aa047a1",
                "auth": "CBm8dsF42EA",
                "tenantId": "7fc5d8d4e24943a0967d9479b0c43cef",
                "destBucketName": "hw-orchestrate",
                "hostIP": "192.168.20.67",
                "remainSource": true,
                "port": "8089",
                "destBackend": "hw-backend"
            },
            "action_is_workflow": true,
            "callback": {},
  
  "action": "opensds.migration-bucket",
            "id": "5ccb957d92395f01051f13a2"
        },
        "id": "5ccb957d92395f01051f13a5"
      }
  ];
  this.instances.forEach(element => {
    //element['start_timestamp'] = this.util.formatDate(element['start_timestamp']);
  });
  this.loading = false;
  }
  refreshTable(){
      console.log("Table REfreshed");
  }

  startInstance(instanceId){
    console.log("Starting Instance:", instanceId);
  }

  restartInstance(instanceId){
    console.log("Restarting Instance:", instanceId);
  }

  pauseInstance(instanceId){
    console.log("Pausing Instance:", instanceId);
  }

  abortInstance(instanceId){
    console.log("Aborting Instance:", instanceId);
  }

}
