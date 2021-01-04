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

    CLOUD_TYPE:['aws-s3', 'aws-file', 'aws-block', 'azure-blob', 'azure-file','hw-obs','hw-file', 'hw-block', 'fusionstorage-object','ceph-s3','ibm-cos','gcp-s3', 'gcp-file', 'yig', 'alibaba-oss'],

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
        'alibaba-oss' : "Alibaba Object Storage"
    },
    SODA_HOST_IP: '',
    SODA_GRAFANA_PORT: '',
    SODA_ALERTMANAGER_PORT: '',
    SODA_PROMETHEUS_PORT: '',
    S3_HOST_IP: '',
    S3_HOST_PORT: '',
    STORAGE_CLASSES: {
        'aws-s3' : [
            {
                label: 'S3 GLACIER',
                value: 'GLACIER'
            }
        ]
    },
    RETRIEVAL_OPTIONS: [
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
    API: {

        DELFIN : {
            'storages' : 'resource-monitor/storages',
            'storagePools' : 'resource-monitor/storage-pools',
            'volumes' : 'resource-monitor/volumes',
            'controllers' : 'resource-monitor/controllers',
            'ports' : 'resource-monitor/ports',
            'disks' : 'resource-monitor/disks',
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
            }
        ],
        models: {
            'dellemc' : [
                {
                    label: "VMAX",
                    value: {
                        name: 'vmax',
                        rest: true,
                        ssh: false,
                        extra: true
                    }
                },
                {
                    label: "Unity",
                    value: {
                        name: 'unity',
                        rest: true,
                        ssh: false,
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
                        extra: false
                    }
                }
            ]
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
}
