let SODA_HOST_IP = '192.168.56.101'
let SODA_ALERTMANAGER_PORT = '9093s'

export const Consts = {

    /**
     * Constants to be used for conversion of capacity value in appropriate display values.
     */
    FROM_GiB_CONVERTER: 1073741824,
    TO_GiB_CONVERTER : 1024,
    TO_GB_CONVERTER : 1000,

    /** Unknown placeholder **/
    UNKNOW_PLACEHOLDER: "--",

    /** Display Decimal places **/
    PRECISION_PERCENT: 2,

    /** Common Date and Time Formats **/
    DATE_FORMAT: "yyyy-MM-dd",
    TIME_FORMAT: "hh:mm:ss",
    DATETIME_FORMAT: "yyyy-MM-dd hh:mm:ss",

    /** 窗口输入框长度，按照栅格定义控件宽度，数字x标识占x个格子 **/
    W1: 72,
    W2: 152,
    W3: 232,
    W4: 312,
    W5: 250,
    WSearch: 180,


    /**
     * only for bucket to backend and to type
     */
    BUCKET_BACKND : new Map<string,string>(),
    BUCKET_TYPE:new Map<string,string>(),
    BYTES_PER_CHUNK : 1024 * 1024 * 5,
    TIMEOUT: 30 * 60 * 1000,

    CLOUD_TYPE:['aws-s3', 'aws-file', 'aws-block', 'azure-blob', 'azure-file','hw-obs','hw-file', 'hw-block', 'fusionstorage-object','ceph-s3','ibm-cos','gcp-s3', 'gcp-file', 'yig', 'alibaba-oss','sony-oda'],

    TYPE_SVG:{
        "aws-s3":'aws.svg',
        "aws-file" : 'aws.svg',
        "aws-block" : 'aws.svg',
        "azure-blob":'azure.svg',
        "azure-file" : 'azure.svg',
        "hw-obs":"huawei.svg",
        "hw-file" : 'huawei.svg',
        "hw-block" : 'huawei.svg',
        "fusionstorage-object":"huawei.svg",
        "ceph-s3": "ceph.svg",
        "ibm-cos": "ibm.svg",
        "gcp-s3": "google.svg",
        "gcp-file" : 'google.svg',
        "yig": "yig.png",
        'alibaba-oss': 'alibaba.svg',
        'sony-oda':'sonyoda.svg',

    },
    CLOUD_TYPE_NAME: {
        'aws-s3': 'AWS S3',
        'aws-file' : 'AWS File Storage',
        'aws-block' : 'AWS Block Storage',
        'azure-blob': "Azure Blob Storage",
        'azure-file' : 'Azure File Storage',
        'hw-obs': "Huawei OBS",
        'hw-file' : 'Huawei File Storage',
        'hw-block' : 'Huawei Block Storage',
        'fusionstorage-object': "FusionStorage Object",
        'ceph-s3': "Ceph S3",
        'gcp-s3': "GCP Object Storage",
        'gcp-file' : 'GCP File Storage',
        'ibm-cos': "IBM COS",
        'yig': "YIG Ceph",
        'alibaba-oss' : "Alibaba Object Storage",
        'sony-oda':"Sony Optical Disc Archive"
    },
    SODA_HOST_IP: '192.168.56.101',
    SODA_GRAFANA_PORT: '3000',
    SODA_ALERTMANAGER_PORT: '9093',
    SODA_PROMETHEUS_PORT: '9090',
    S3_HOST_IP: '192.168.56.101',
    S3_HOST_PORT: '8090',
    STORAGE_SERVICE_PLAN_ENABLED: false,
    STORAGE_CLASSES: {
        'aws-s3' : [
            {
                label: 'S3 GLACIER',
                value: 'GLACIER'
            }
        ],
        'azure-blob' : [
            {
                label: 'Archive',
                value: 'Archive'
            }
        ],
        'gcp-s3' : [
            {
                label: 'Archive',
                value: 'Archive'
            }
        ]
    },
    RETRIEVAL_OPTIONS: {
        'aws-s3' : [
            {
                label: "Expedited",
                value: "Expedited"
            },
            {
                label: "Standard",
                value: "Standard"
            },
            {
                label: "Bulk",
                value: "Bulk"
            }
        ],
        'azure-blob' : [
            {
                label: "Hot",
                value: "Hot"
            },
            {
                label: "Cool",
                value: "Cool"
            }
        ]
    },
    API: {

        DELFIN : {
            'storages' : 'resource-monitor/storages',
            'storagePools' : 'resource-monitor/storage-pools',
            'volumes' : 'resource-monitor/volumes',
            'controllers' : 'resource-monitor/controllers',
            'ports' : 'resource-monitor/ports',
            'disks' : 'resource-monitor/disks',
            'qtrees' : 'resource-monitor/qtrees',
            'filesystems' : 'resource-monitor/filesystems',
            'shares' : 'resource-monitor/shares',
            'quotas' : 'resource-monitor/quotas',
            'alerts' : 'alertmanager/alerts'
        }
    },
    AWS_VOLUME_TYPES: [
        {
            label: 'General Purpose',
            value: 'gp2'
        },
        {
            label: 'Provisioned IOPS',
            value: 'io1'
        },
        {
            label: 'Cold HDD',
            value: 'sc1'
        },
        {
            label: 'Throughput Optimized',
            value: 'st1'
        },
        {
            label: 'Magnetic(Standard)',
            value: 'standard'
        }
    ],
    HW_VOLUME_TYPES: [
        {
            label: 'SAS',
            value: 'SAS'
        },
        {
            label: 'GPSSD',
            value: 'GPSSD'
        },
        {
            label: 'SSD',
            value: 'SSD'
        }
    ],
    STORAGES: {
        vendors: [
            {
                label: "Dell EMC",
                value: 'dellemc'
            },
            {
                label: "Huawei",
                value: 'huawei'
            },
            {
                label: "HPE",
                value: 'hpe'
            },
            {
                label: "Hitachi",
                value: 'hitachi'
            },
            {
                label: "IBM",
                value: 'ibm'
            },
            {
                label: "NetApp",
                value: 'netapp'
            },
            {
                label: "Fujitsu",
                value: 'fujitsu'
            },
            {
                label: "Pure Storage",
                value: 'pure'
            },
            {
                label: "Demo Storage",
                value: 'fake_storage'
            }
        ],
        resources:{
            volumes : ['vmax', 'unity', 'vnx_block', 'vplex', 'oceanstor', '3par', 'vsp', 'storwize_svc', 'cmode', 'fake_driver'],
            pools : ['vmax', 'unity', 'vnx_block', 'vplex', 'oceanstor', '3par', 'vsp', 'storwize_svc', 'cmode', 'fake_driver'],
            controllers : ['oceanstor', 'unity', 'vnx_block', 'vplex', '3par', 'vsp', 'storwize_svc', 'cmode', 'fake_driver'],
            ports : ['oceanstor', 'unity', 'vnx_block', 'vplex', '3par', 'vsp', 'storwize_svc', 'cmode', 'fake_driver'],
            disks : ['oceanstor', 'unity', 'vnx_block', '3par', 'vsp', 'storwize_svc', 'cmode', 'fake_driver'],
            qtrees : ['oceanstor', 'unity', 'cmode', 'fake_driver'],
            filesystems : ['oceanstor', 'unity', 'cmode', 'fake_driver'],
            shares: ['oceanstor', 'unity', 'cmode', 'fake_driver'],
            quotas: ['oceanstor', 'unity', 'cmode', 'fake_driver']
        },
        models: {
            'fake_storage' : [
                {
                    label: "Demo Driver",
                    value: {
                        name: 'fake_driver',
                        rest: true,
                        ssh: false,
                        cli: false,
                        smis: false,
                        extra: false
                    }
                }
            ],
            'dellemc' : [
                {
                    label: "VMAX",
                    value: {
                        name: 'vmax',
                        rest: true,
                        ssh: false,
                        cli: false,
                        smis: false,
                        extra: true
                    }
                },
                {
                    label: "Unity",
                    value: {
                        name: 'unity',
                        rest: true,
                        ssh: false,
                        cli: false,
                        smis: false,
                        extra: false
                    }
                },
                {
                    label: "VNX",
                    value: {
                        name: 'vnx_block',
                        rest: false,
                        ssh: false,
                        cli: true,
                        smis: false,
                        extra: false
                    }
                },
                {
                    label: "VPLEX",
                    value: {
                        name: 'vplex',
                        rest: true,
                        ssh: false,
                        cli: false,
                        smis: false,
                        extra: false
                    }
                }
            ],
            'huawei' : [
                {
                    label: "OceanStor V3",
                    value: {
                        name: 'oceanstor',
                        rest: true,
                        ssh: false,
                        cli: false,
                        smis: false,
                        extra: false
                    }
                }
            ],
            'hpe' : [
                {
                    label: "3PAR",
                    value: {
                        name: '3par',
                        rest: true,
                        ssh: true,
                        cli: false,
                        smis: false,
                        extra: false
                    }
                },
                {
                    label: "MSA",
                    value: {
                        name: 'msa',
                        rest: false,
                        ssh: true,
                        cli: false,
                        smis: false,
                        extra: false
                    }
                }
            ],
            'hitachi' : [
                {
                    label: "VSP",
                    value: {
                        name: 'vsp',
                        rest: true,
                        ssh: false,
                        cli: false,
                        smis: false,
                        extra: false
                    }
                },
                {
                    label: "HNAS",
                    value: {
                        name: 'hnas',
                        rest: false,
                        ssh: true,
                        cli: false,
                        smis: false,
                        extra: false
                    }
                }
            ],
            'ibm' : [
                {
                    label: "Storwize / SVC",
                    value: {
                        name: 'storwize_svc',
                        rest: false,
                        ssh: true,
                        cli: false,
                        smis: false,
                        extra: false
                    }
                },
                {
                    label: "DS8000",
                    value: {
                        name: 'ds8k',
                        rest: true,
                        ssh: false,
                        cli: false,
                        smis: false,
                        extra: false
                    }
                }
            ],
            'netapp' : [
                {
                    label: "Cluster Mode",
                    value: {
                        name: 'cmode',
                        rest: false,
                        ssh: true,
                        cli: false,
                        smis: false,
                        extra: false
                    }
                }
            ],
            'fujitsu' : [
                {
                    label: "ETERNUS",
                    value: {
                        name: 'eternus',
                        rest: false,
                        ssh: true,
                        cli: false,
                        smis: false,
                        extra: false
                    }
                }
            ],
            'pure' : [
                {
                    label: "FlashArray",
                    value: {
                        name: 'flasharray',
                        rest: true,
                        ssh: false,
                        cli: false,
                        smis: false,
                        extra: false
                    }
                }
            ],
        },
        pubKeyTypeOptions: [
            {
                label: "ssh-ed25519",
                value: "ssh-ed25519"
            },
            {
                label: "ecdsa-sha2-nistp256",
                value: "ecdsa-sha2-nistp256"
            },
            {
                label: "ecdsa-sha2-nistp384",
                value: "ecdsa-sha2-nistp384"
            },
            {
                label: "ecdsa-sha2-nistp521",
                value: "ecdsa-sha2-nistp521"
            },
            {
                label: "ssh-rsa",
                value: "ssh-rsa"
            },
            {
                label: "ssh-dss",
                value: "ssh-dss"
            }
        ],
        alertSourceVersionOptions: [
            {
                label: "SNMPV2C",
                value: 'SNMPv2c'
            },
            {
              label: "SNMPV3",
              value: 'SNMPv3'
            }
        ],
        securityLevelOptions: [
            {
                label: "noAuthnoPriv",
                value: "noAuthnoPriv"
            },
            {
                label: "authNoPriv",
                value: "authNoPriv"
            },
            {
                label: "authPriv",
                value: "authPriv"
            }
        ],
        authProtocolOptions: [
            {
                label: "HMACSHA",
                value: "HMACSHA"
            },
            {
                label: "HMACMD5",
                value: "HMACMD5"
            },
            {
                label: "HMCSHA2224",
                value: "HMCSHA2224"
            },
            {
                label: "HMCSHA2256",
                value: "HMCSHA2256"
            },
            {
                label: "HMCSHA2384",
                value: "HMCSHA2384"
            },
            {
                label: "HMCSHA2512",
                value: "HMCSHA2512"
            }

        ],
        privacyProtocolOptions: [
            {
                label: "DES",
                value: "DES"
            },
            {
                label: "AES",
                value: "AES"
            },
            {
                label: "AES192",
                value: "AES192"
            },
            {
                label: "AES256",
                value: "AES256"
            },
            {
                label: "3DES",
                value: "3DES"
            },


        ]
    },
        // menu constants
        menuItems : [],
        menuItems_tenant : [
            {
                "title": "Home",
                "description": "Resource statistics",
                "routerLink": "/home",
                "joyrideStep" : "menuHome",
                "text" : "This page shows you the overall view of the backends available, volumes provisioned, buckets created and object storage migrations performed."
            },
            {
                "title": "Profile",
                "description": "Profiles",
                "routerLink": "/profile",
                "joyrideStep" : "menuProfile",
                "text" : "A profile is a set of configurations on service capabilities (including resource tuning, QoS) of storage resources. A profile must be specified when volume or fileshare is created."
            },
            {
                "title": "Resource Manager",
                "description": "Volumes / Buckets / File Share / Hosts",
                "routerLink": "/block",
                "joyrideStep" : "menuResource",
                "text" : "View and manage Buckets, Volumes, Volume Groups, File shares and Hosts that have been manually created or applied for through service templates.",
                "group" : true,
                "children" : [
                    {
                        "title" : "Buckets",
                        "routerLink": "/block"
                    },
                    {
                        "title" : "Volumes",
                        "routerLink": "/block/fromVolume"
                    },
                    {
                        "title" : "Volume Group",
                        "routerLink": "/block/fromGroup"
                    },
                    {
                        "title" : "File Share",
                        "routerLink": "/block/fromFileShare"
                    },
                    {
                        "title" : "Hosts",
                        "routerLink": "/block/fromHosts"
                    },
                ]
            },
            {
                "title": "Dataflow",
                "description": "Through migration / replication capability.",
                "routerLink": "/dataflow",
                "joyrideStep" : "menuDataflow",
                "text" : "Data flow through buckets by migration / replication."
            },
            {
                "title": "Services",
                "description": "Orchestration services.",
                "routerLink": "/services",
                "joyrideStep" : "menuServices",
                "text" : "This page demonstrates the Orchestration service that allows to Create and Manage Service Instances"
            }
        ],

        menuItems_admin : [
            {
                "title": "Home",
                "description": "Resource statistics",
                "routerLink": "/home",
                "joyrideStep" : "menuHome",
                "text" : "This page shows you the overall view of the backends available, volumes provisioned, buckets created and object storage migrations performed."
            },
            {
                "title": "Profile",
                "description": "Profiles",
                "routerLink": "/profile",
                "joyrideStep" : "menuProfile",
                "text" : "A profile is a set of configurations on service capabilities (including resource tuning, QoS) of storage resources. A profile must be specified when volume is created."
            },
            {
                "title": "Resource Manager",
                "description": "Volumes / Buckets / File Share / Hosts",
                "routerLink": "/block",
                "joyrideStep" : "menuResource",
                "text" : "View and manage Buckets, Volumes, Volume Groups, File shares and Hosts that have been manually created or applied for through service templates.",
                "group" : true,
                "children" : [
                    {
                        "title" : "Buckets",
                        "routerLink": "/block"
                    },
                    {
                        "title" : "Volumes",
                        "routerLink": "/block/fromVolume"
                    },
                    {
                        "title" : "Volume Group",
                        "routerLink": "/block/fromGroup"
                    },
                    {
                        "title" : "File Share",
                        "routerLink": "/block/fromFileShare"
                    },
                    {
                        "title" : "Hosts",
                        "routerLink": "/block/fromHosts"
                    },
                ]
            },
            {
                "title": "Dataflow",
                "description": "Through migration / replication capability.",
                "routerLink": "/dataflow",
                "joyrideStep" : "menuDataflow",
                "text" : "Data flow through buckets by migration / replication."
            },
            {
                "title": "Resource Monitor",
                "description": "SODA Storage Infrastructure Manager",
                "routerLink": "/resource-monitor",
                "joyrideStep" : "menuDelfin",
                "text" : "delfin is the SODA Infrastructure Manager project which provides unified, intelligent and scalable resource management, alert and performance monitoring",
                "group" : true,
                "children" : [
                    {
                        "title" : "Storage Summary",
                        "routerLink": "/resource-monitor"
                    },
                    {
                        "title" : "Performance Monitor",
                        "routerLink": "/performance-monitor"
                    },
                    {
                        "title" : "Alert Manager",
                        "is_external_link" : true,
                        "link" : "http://" +SODA_HOST_IP + ":" + SODA_ALERTMANAGER_PORT
                    },
                ]
            },
            {
                "title": "Services",
                "description": "Orchestration services.",
                "routerLink": "/services",
                "joyrideStep" : "menuServices",
                "text" : "This page demonstrates the Orchestration service that allows to Create and Manage Service Instances"
            },
            {
                "title": "Infrastructure",
                "description": "Regions, availability zones and storage",
                "routerLink": "/resource",
                "joyrideStep" : "menuInfrastructure",
                "text" : "A quick overview of the block, Object and File infrastructure."
            },
            {
                "title": "Identity",
                "description": "Managing tenants and users",
                "routerLink": "/identity",
                "joyrideStep" : "menuIdentity",
                "text" : "Managing Tenants and Users"
            }
        ],

        tourSteps_admin : [
            'homeWelcome',
            'homeUserProfile',
            'menuHome',
            'menuProfile',
            'menuResource',
            'menuDataflow',
            'menuDelfin',
            'menuServices',
            'menuInfrastructure',
            'menuIdentity',
            'homeResourceCard@/home',
            'homeDataflowCard@/home',
            'homeAddBackendBtn@/home',
            'homeAWSBackends@/home',
            'homeGCPBackends@/home',
            'homeHuaweiBackends@/home',
            'homeIBMBackends@/home',
            'homeAlibabaBackends@/home',
            'homeAzureBackends@/home',
            'homeAllBackends@/home'
        ],
        tourSteps_tenant : [
            'homeWelcome',
            'homeUserProfile',
            'menuHome',
            'menuProfile',
            'menuResource',
            'menuDataflow',
            'menuServices',
            'homeResourceCard@/home',
            'homeDataflowCard@/home',
            'homeAddBackendBtn@/home',
            'homeAWSBackends@/home',
            'homeGCPBackends@/home',
            'homeHuaweiBackends@/home',
            'homeIBMBackends@/home',
            'homeAlibabaBackends@/home',
            'homeAzureBackends@/home',
            'homeAllBackends@/home'
        ],
}

