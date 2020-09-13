export const Consts = {
    
    /**
     * Constants to be used for conversion of capacity value in appropriate display values.
     */
    GiB_CONVERTER : 1024,
    GB_CONVERTER : 1000,
    
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

    CLOUD_TYPE:['aws-s3', 'aws-file','azure-blob', 'azure-file','hw-obs','fusionstorage-object','ceph-s3','ibm-cos','gcp-s3', 'yig', 'alibaba-oss'],

    TYPE_SVG:{
        "aws-s3":'aws.svg',
        "hw-obs":"huawei.svg",
        "azure-blob":'azure.svg',
        "fusionstorage-object":"huawei.svg",
        "ceph-s3": "ceph.svg",
        "ibm-cos": "ibm.svg",
        "gcp-s3": "google.svg",
        "yig": "yig.png",
        'alibaba-oss': 'alibaba.svg',
        "aws-file" : 'aws.svg',
        "azure-file" : 'azure.svg'

    },
    CLOUD_TYPE_NAME: {
        'aws-s3': 'AWS S3',
        'azure-blob': "Azure Blob Storage",
        'hw-obs': "Huawei OBS",
        'fusionstorage-object': "FusionStorage Object",
        'ceph-s3': "Ceph S3",
        'gcp-s3': "GCP Storage",
        'ibm-cos': "IBM COS",
        'yig': "YIG Ceph",
        'alibaba-oss' : "Alibaba Object Storage",
        'aws-file' : 'AWS File Service',
        'azure-file' : 'Azure File Service'
    },
    S3_HOST_IP: '',
    S3_HOST_PORT: '',
    API: {
        AUTH : {
            'getToken' : 'identity/v3/auth/tokens'
        },
        DELFIN : {
            'storages' : 'delfin/storages',
            'storagePools' : 'delfin/storage-pools',
            'volumes' : 'delfin/volumes'
        },
        HOTPOT : {
            'profiles' : 'v1beta/{project_id}/profiles',
            'volumes' : 'v1beta/{project_id}/block/volumes',
            'getVolumeSnapshots' : 'v1beta/{project_id}/block/snapshots?VolumeId=',
            'getVolumeReplications' : 'v1beta/{project_id}/block/replications/detail',
            'createVolumeReplications' : 'v1beta/{project_id}/block/replications',
            'createVolumeSnapshots' : 'v1beta/{project_id}/block/snapshots',
            'volumeGroups' : 'v1beta/{project_id}/block/volumeGroups',
            'getVolumeGroupAttachments' : 'v1beta/{project_id}/block/volumes?GroupId=',
            'attachVolumeToGroup' : 'v1beta/{project_id}/block/volumeGroups',
            'fileShares' : 'v1beta/{project_id}/file/shares',
            'fileShareAcls' : 'v1beta/{project_id}/file/acls',
            'fileShareSnapshots' : 'v1beta/{project_id}/file/snapshots',
            'hosts' : 'v1beta/{project_id}/host/hosts',
            'attachments' : 'v1beta/{project_id}/block/attachments',
        },
        GELATO : {

        },
    }
}
