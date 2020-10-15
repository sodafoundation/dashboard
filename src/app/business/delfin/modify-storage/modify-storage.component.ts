import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService, Utils } from 'app/shared/api';
import { FormControl, FormGroup, FormArray, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { AppService } from 'app/app.service';
import { I18nPluralPipe } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Message, MenuItem ,ConfirmationService} from '../../../components/common/api';
import { DelfinService } from '../delfin.service';

let _ = require("underscore");
@Component({
    selector: 'app-delfin-modify-storage',
    templateUrl: 'modify-storage.component.html',
    providers: [ConfirmationService],
    styleUrls: [],
    animations: []
})
export class ModifyStorageComponent implements OnInit {
    allStorages: any = [];
    selectedStorage;
    selectedAccessInfo;
    selectedStorageId;
    items: any;
    vendorOptions: any;
    allStorageModels: any;
    modelOptions: any;
    pubKeyTypeOptions: any;
    modifyStorageForm: any;
    selectedVendor: any;
    selectedModel: any;
    selectedPubKeyType; any;
    showExtraAttribs: boolean = false;
    showSsh: boolean = false;
    showRest: boolean = false;

    label = {
        vendor: "Vendor",
        model: "Model",
        restHost: "Host IP",
        restPort: "Port",
        restUsername: "Username",
        restPassword: "Password",
        sshHost: "Host IP",
        sshPort: "Port",
        sshUsername: "Username",
        sshPassword: "Password",
        sshPubKey: "Pub Key",
        sshPubKeyType: "Pub Key Type",
        extra_attributes: "Extra Attributes"
    };

    errorMessage = {
        "vendor" : {
            required: "Vendor is required"
        },
        "model" : {
            required: "Model is required"
        },
        "restHost" : {
            required: "Host IP address is required",
            pattern: "Enter valid IPv4 address"
        },
        "restPort" : {
            required: "Port is required"
        },
        "restUsername" : {
            required: "Username is required"
        },
        "restPassword" : {
            required: "Password is required"
        },
        "sshHost" : {
            required: "Host IP address is required",
            pattern: "Enter valid IPv4 address"
        },
        "sshPort" : {
            required: "Port is required"
        },
        "sshUsername" : {
            required: "Username is required"
        },
        "sshPassword" : {
            required: "Password is required"
        },
        "sshPubKey" : {
            required: "Public Key is required"
        },
        "sshPubKeyType" : {
            required: "Public Key type is required"
        },
    };
    /* Validates IPv4 address */
    validRule= {
        'validIp': '((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}'
    };
    msgs: Message[];

    constructor(
        public i18n: I18NService,
        public ds : DelfinService,
        private confirmationService: ConfirmationService,
        private fb: FormBuilder,
        private router: Router,
        private ActivatedRoute: ActivatedRoute
    ) {
       // Fetch the Selected Storage ID
        this.ActivatedRoute.params.subscribe((params) => {
            this.selectedStorageId = params.storageId
        });
    }

    ngOnInit() {
        this.items = [
            { 
                label: "Storage Summary", 
                url: '/resource-monitor' 
            },
            { 
                label: "Modify Storage", 
                url: '/modifyStorage' 
            },

        ];
        this.vendorOptions = [
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
            }
        ];

        this.allStorageModels = {
            'dellemc' : [
                {
                    label: "VMAX",
                    value: {
                        name: 'vmax',
                        rest: true,
                        ssh: false,
                        extra: true
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
            ]
        };
        this.pubKeyTypeOptions = [
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
        ];

        this.ds.getStorageById(this.selectedStorageId).subscribe((res)=>{
            let storageDevice;
            storageDevice = res.json();
            this.selectedStorage = storageDevice;
            this.ds.getAccessinfoByStorageId(this.selectedStorageId).subscribe((res)=>{
                let accessInfo = res.json();
                this.selectedAccessInfo = accessInfo;

                if(this.selectedAccessInfo && this.selectedAccessInfo['vendor']){
                    this.selectedVendor = this.selectedAccessInfo['vendor'];
                }
                if(this.selectedAccessInfo && this.selectedAccessInfo['model']){
                    this.selectedModel = this.selectedAccessInfo['model'];
                    
                }
                if(this.selectedAccessInfo && this.selectedAccessInfo['rest']){
                    this.showRest = true;
                }

                if(this.selectedAccessInfo && this.selectedAccessInfo['ssh']){
                    this.showSsh = true;
                }

                if(this.selectedAccessInfo && this.selectedAccessInfo['extra_attributes']){
                    this.showExtraAttribs = true;
                }
                
                //Populate the Modify Form.
                this.modifyStorageForm = this.fb.group({
                    "enable_rest": [this.showRest, { updateOn: 'change' }],
                    "enable_ssh": [this.showSsh, { updateOn: 'change' }],
                    "enable_extra_attribs": [this.showExtraAttribs, { updateOn: 'change' }]
                });

                this.checkRestParams();
                this.checkSshParams();
                this.checkExtraAttributesParams();
            }, (error)=>{
                console.log("Something wente wrong. Could not fetch the access info.", error);
            })
            
            
        }, (error)=>{
            console.log("Something went wrong. Could not fetch storage", error);
        })
        
    }

    getStorageById(id){
        this.ds.getStorageById(id).subscribe((res)=>{
            let storageDevice;
            storageDevice = res.json();
            this.selectedStorage = storageDevice;
        }, (error)=>{
            console.log("Something went wrong. Could not fetch storage", error);
        })
    }

    getAccessInfo(id){
        this.ds.getAccessinfoByStorageId(id).subscribe((res)=>{
            let accessInfo = res.json();
            this.selectedAccessInfo = accessInfo;
        }, (error)=>{
            console.log("Something wente wrong. Could not fetch the access info.", error);
        })
    }
    
    extraAttribsControl(){
        this.showExtraAttribs = this.modifyStorageForm.get('enable_extra_attribs').value;
        this.checkExtraAttributesParams();
    }
    showSshControl(){
        this.showSsh = this.modifyStorageForm.get('enable_ssh').value;
        this.checkRestParams();
        this.checkSshParams();
    }
    showRestControl(){
        this.showRest = this.modifyStorageForm.get('enable_rest').value;
        this.checkRestParams();
        this.checkSshParams();
    }
    getAllStorages(){
        this.ds.getAllStorages().subscribe((res)=>{
            this.allStorages = res.json().storages;
        }, (error)=>{
            console.log("Something went wrong. Could not fetch all storages", error);
        })
    }

    /** On selecting a model prepare the form fields based on the driver config.
     *  if the model has rest true then add the rest connection form fields.
     *  if the model has ssh true the add the ssh connection form fields.
     *  if the model has extra attributes enabled then add the extra_attributes form field.
     *  Update the value and validity of the fields.
     *  Atleast one connection mechanism must be enabled. 
     * 
     * */

    checkRestParams(){
        if(this.showRest){
            this.modifyStorageForm.addControl('restHost', this.fb.control(this.selectedAccessInfo && this.selectedAccessInfo['rest'].host ? this.selectedAccessInfo['rest'].host : '', [Validators.required, Validators.pattern(this.validRule.validIp)]));
            this.modifyStorageForm.addControl('restPort', this.fb.control(this.selectedAccessInfo && this.selectedAccessInfo['rest'].port ? this.selectedAccessInfo['rest'].port : '', [Validators.required]));
            this.modifyStorageForm.addControl('restUsername', this.fb.control(this.selectedAccessInfo && this.selectedAccessInfo['rest'].username ? this.selectedAccessInfo['rest'].username : '', [Validators.required]));
            this.modifyStorageForm.addControl('restPassword', this.fb.control(this.selectedAccessInfo && this.selectedAccessInfo['rest'].password ? this.selectedAccessInfo['rest'].password : '', [Validators.required]));
        } else{
            this.modifyStorageForm.removeControl('restHost');
            this.modifyStorageForm.removeControl('restPort');
            this.modifyStorageForm.removeControl('restUsername');
            this.modifyStorageForm.removeControl('restPassword');
            this.modifyStorageForm.patchValue({
                'enable_rest' : false
            });
            this.modifyStorageForm.updateValueAndValidity();
        }
    }

    checkSshParams(){
        if(this.showSsh){
            this.modifyStorageForm.addControl('sshHost', this.fb.control(this.selectedAccessInfo && this.selectedAccessInfo['ssh'].host ? this.selectedAccessInfo['ssh'].host : '', [Validators.required, Validators.pattern(this.validRule.validIp)]));
            this.modifyStorageForm.addControl('sshPort', this.fb.control(this.selectedAccessInfo && this.selectedAccessInfo['ssh'].port ? this.selectedAccessInfo['ssh'].port : '', [Validators.required]));
            this.modifyStorageForm.addControl('sshUsername', this.fb.control(this.selectedAccessInfo && this.selectedAccessInfo['ssh'].username ? this.selectedAccessInfo['ssh'].username : '', [Validators.required]));
            this.modifyStorageForm.addControl('sshPassword', this.fb.control(this.selectedAccessInfo && this.selectedAccessInfo['ssh'].password ? this.selectedAccessInfo['ssh'].password : '', [Validators.required]));
            this.modifyStorageForm.addControl('sshPubKey', this.fb.control(this.selectedAccessInfo && this.selectedAccessInfo['ssh'].pub_key ? this.selectedAccessInfo['ssh'].pub_key : '', [Validators.required]));
            if(this.selectedAccessInfo && this.selectedAccessInfo['ssh'].pub_key_type){
                this.selectedPubKeyType = this.selectedAccessInfo['ssh'].pub_key_type;
            }
            this.modifyStorageForm.addControl('sshPubKeyType', this.fb.control(this.selectedAccessInfo && this.selectedAccessInfo['ssh'].pub_key_type ? this.selectedAccessInfo['ssh'].username : '', [Validators.required]));
        } else {
            this.modifyStorageForm.removeControl('sshHost');
            this.modifyStorageForm.removeControl('sshPort');
            this.modifyStorageForm.removeControl('sshUsername');
            this.modifyStorageForm.removeControl('sshPassword');
            this.modifyStorageForm.removeControl('sshPubKey');
            this.modifyStorageForm.removeControl('sshPubKeyType');
            this.modifyStorageForm.patchValue({
                'enable_ssh' : false
            });
            this.modifyStorageForm.updateValueAndValidity();
        }
    }

    checkExtraAttributesParams(){
        if(this.showExtraAttribs){
            let self = this;
            let firstKey = Object.keys(this.selectedAccessInfo['extra_attributes'])[0];
            let firstValue = this.selectedAccessInfo['extra_attributes'][firstKey];
            
            this.modifyStorageForm.addControl('extra_attributes', this.fb.array([this.createAttributes(firstKey, firstValue)]));
             Object.keys(this.selectedAccessInfo['extra_attributes']).slice(1).forEach(function(extraKey) {
                (self.modifyStorageForm.controls['extra_attributes'] as FormArray).push(self.createAttributes(extraKey,self.selectedAccessInfo['extra_attributes'][extraKey]));
            }); 
        } else {
            
            this.modifyStorageForm.removeControl('extra_attributes');
            this.modifyStorageForm.patchValue({
                'enable_extra_attribs' : false
            });
            this.modifyStorageForm.updateValueAndValidity();
        }
    }
    
    createAttributes(key?, value?){
        return this.fb.group({
            key: new FormControl(key ? key : ''),
            value: new FormControl(value ? value : '')
        })
    }

    addNextAttribute(key?, value?) {
        (this.modifyStorageForm.controls['extra_attributes'] as FormArray).push(this.createAttributes((key ? key : ''), (value ? value : '')))
    }
    removeAttributeLink(i: number) {
        if(this.modifyStorageForm.get('extra_attributes')['length'] > 1){
            this.modifyStorageForm.get('extra_attributes')['removeAt'](i);
        }
    }

    prepareFormDataArray(value){
        let dataArr = {};
        if(this.showRest){
            let rest = {
                host: value['restHost'],
                port: Number(value['restPort']),
                username: value['restUsername'],
                password: value['restPassword'],
            }
            dataArr['rest'] = rest;
        }
        if(this.showSsh){
            let sshConfig = {
                host: value['sshHost'],
                port: Number(value['sshPort']),
                username: value['sshUsername'],
                password: value['sshPassword'],
                pub_key: value['sshPubKey'],
                pub_key_type: value['sshPubKeyType'],
            }
            dataArr['ssh'] = sshConfig;
        }
        if(this.showExtraAttribs){
            let meta = {};
            value['extra_attributes'].forEach(element => {
                meta[element['key']] = element['value'];
            });
            dataArr['extra_attributes'] = meta;
        }
        return dataArr;
    }

    onSubmit(value){
        if(!this.modifyStorageForm.valid){
            for(let i in this.modifyStorageForm.controls){
                this.modifyStorageForm.controls[i].markAsTouched();
            }
            return;
        }
        let dataArr = this.prepareFormDataArray(value);

        this.ds.modifyAccessinfoByStorageId(this.selectedStorageId, dataArr).subscribe((res)=>{
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: 'Storage device access info updated successfully.'});
            let queryParams = {
                "message": JSON.stringify({severity: 'success', summary: 'Success', detail: 'Storage device access info updated successfully.'})
            };
            this.router.navigate(['/resource-monitor'], {queryParams: queryParams});
        }, (error) =>{
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: "Error", detail:"Something went wrong. Storage device access info could not be modified."});
            console.log("Something went wrong. Storage device access info could not be modified.", error);
        })
    }
    
}