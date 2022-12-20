import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Consts, I18NService, Utils } from 'app/shared/api';
import { FormControl, FormGroup, FormArray, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { AppService } from 'app/app.service';
import { I18nPluralPipe } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Message, MenuItem ,ConfirmationService} from '../../../components/common/api';
import { DelfinService } from '../delfin.service';

let _ = require("underscore");
@Component({
    selector: 'app-delfin-register-storage',
    templateUrl: 'register-storage.component.html',
    providers: [ConfirmationService],
    styleUrls: [],
    animations: []
})
export class RegisterStorageComponent implements OnInit {
    allStorages: any = [];
    items: any;
    vendorOptions: any;
    allStorageModels: any;
    modelOptions: any;
    pubKeyTypeOptions: any;
    registerStorageForm: any;
    selectedVendor: any;
    selectedModel: any;
    selectedPubKeyType; any;
    showExtraAttribs: boolean = false;
    showSsh: boolean = false;
    showRest: boolean = false;
    showCli: boolean = false;
    showSmis: boolean = false;
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
        cliHost: "Host IP",
        cliPort: "Port",
        cliUsername: "Username",
        cliPassword: "Password",
        smisHost: "Host IP",
        smisPort: "Port",
        smisUsername: "Username",
        smisPassword: "Password",
        smisNamespace: "Namespace",
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
        "cliHost" : {
            required: "Host IP address is required",
            pattern: "Enter valid IPv4 address"
        },
        "cliPort" : {
            required: "Port is required"
        },
        "cliUsername" : {
            required: "Username is required"
        },
        "cliPassword" : {
            required: "Password is required"
        },
        "smisHost" : {
            required: "Host IP address is required",
            pattern: "Enter valid IPv4 address"
        },
        "smisPort" : {
            required: "Port is required"
        },
        "smisUsername" : {
            required: "Username is required"
        },
        "smisPassword" : {
            required: "Password is required"
        },
        "smisNamespace" : {
            required: "Namespace is required"
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
    ) {
       
    }

    ngOnInit() {
        this.getAllStorages();
        this.items = [
            { 
                label: "Storage Summary", 
                url: '/resource-monitor' 
            },
            { 
                label: "Register Storage", 
                url: '/registerStorage' 
            }
        ];
                       
        //All Supported storage vendors
        this.vendorOptions = Consts.STORAGES.vendors;
        
        //All supported storage models based on vendors
        this.allStorageModels = Consts.STORAGES.models;
        
        //All supported public key type options
        //["ssh-ed25519", "ecdsa-sha2-nistp256", "ecdsa-sha2-nistp384", "ecdsa-sha2-nistp521", "ssh-rsa", "ssh-dss"]
        this.pubKeyTypeOptions = Consts.STORAGES.pubKeyTypeOptions;

        this.registerStorageForm = this.fb.group({
            'vendor': new FormControl('', Validators.required),
            'model': new FormControl('', Validators.required),
            "enable_extra_attribs": [this.showExtraAttribs, { updateOn: 'change' }]
        });
       
    }

    extraAttribsControl(){
        this.showExtraAttribs = this.registerStorageForm.get('enable_extra_attribs').value;
    }
    getAllStorages(){
        this.ds.getAllStorages().subscribe((res)=>{
            this.allStorages = res.json().storages;
        }, (error)=>{
            console.log("Something went wrong. Could not fetch all storages", error);
        })
    }

    // Get all the models of a vendor and populate the dropdown.
    getModelsByVendor(vendor){
        let self =this;
        this.selectedModel = {};
        this.showRest = false;
        this.showSsh = false;
        this.showCli = false;
        this.showSmis = false;
        this.showExtraAttribs = false;
        this.registerStorageForm.patchValue({
            'enable_extra_attribs' : false
        });
        this.registerStorageForm.updateValueAndValidity();
        _.each(this.allStorageModels, function(value, key){
            if(key==vendor){
                self.modelOptions = value;
            }
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
    onStorageModelSelect(model){
        console.log("Selected Model", this.selectedModel);
        if(this.selectedModel && this.selectedModel.rest){
            this.showRest = true;
            this.registerStorageForm.addControl('restHost', this.fb.control('', [Validators.required, Validators.pattern(this.validRule.validIp)]));
            this.registerStorageForm.addControl('restPort', this.fb.control('', [Validators.required]));
            this.registerStorageForm.addControl('restUsername', this.fb.control('', [Validators.required]));
            this.registerStorageForm.addControl('restPassword', this.fb.control('', [Validators.required]));
            this.registerStorageForm.updateValueAndValidity();
        } else{
            this.showRest = false;
            this.registerStorageForm.removeControl('restHost');
            this.registerStorageForm.removeControl('restPort');
            this.registerStorageForm.removeControl('restUsername');
            this.registerStorageForm.removeControl('restPassword');
            this.registerStorageForm.updateValueAndValidity();
        }
        if(this.selectedModel && this.selectedModel.ssh){
            this.showSsh = true;
            this.registerStorageForm.addControl('sshHost', this.fb.control('', [Validators.required, Validators.pattern(this.validRule.validIp)]));
            this.registerStorageForm.addControl('sshPort', this.fb.control('', [Validators.required]));
            this.registerStorageForm.addControl('sshUsername', this.fb.control('', [Validators.required]));
            this.registerStorageForm.addControl('sshPassword', this.fb.control('', [Validators.required]));
            this.registerStorageForm.addControl('sshPubKey', this.fb.control('', [Validators.required]));
            this.registerStorageForm.addControl('sshPubKeyType', this.fb.control('', [Validators.required]));
            this.registerStorageForm.updateValueAndValidity();
        } else {
            this.showSsh = false;
            this.registerStorageForm.removeControl('sshHost');
            this.registerStorageForm.removeControl('sshPort');
            this.registerStorageForm.removeControl('sshUsername');
            this.registerStorageForm.removeControl('sshPassword');
            this.registerStorageForm.removeControl('sshPubKey');
            this.registerStorageForm.removeControl('sshPubKeyType');
            this.registerStorageForm.updateValueAndValidity();
        }
        if(this.selectedModel && this.selectedModel.cli){
            this.showCli = true;
            this.registerStorageForm.addControl('cliHost', this.fb.control('', [Validators.required, Validators.pattern(this.validRule.validIp)]));
            this.registerStorageForm.addControl('cliPort', this.fb.control('', [Validators.required]));
            this.registerStorageForm.addControl('cliUsername', this.fb.control('', [Validators.required]));
            this.registerStorageForm.addControl('cliPassword', this.fb.control('', [Validators.required]));
            this.registerStorageForm.updateValueAndValidity();
        } else{
            this.showCli = false;
            this.registerStorageForm.removeControl('cliHost');
            this.registerStorageForm.removeControl('cliPort');
            this.registerStorageForm.removeControl('cliUsername');
            this.registerStorageForm.removeControl('cliPassword');
            this.registerStorageForm.updateValueAndValidity();
        }
        if(this.selectedModel && this.selectedModel.smis){
            this.showSmis = true;
            this.registerStorageForm.addControl('smisHost', this.fb.control('', [Validators.required, Validators.pattern(this.validRule.validIp)]));
            this.registerStorageForm.addControl('smisPort', this.fb.control('', [Validators.required]));
            this.registerStorageForm.addControl('smisUsername', this.fb.control('', [Validators.required]));
            this.registerStorageForm.addControl('smisPassword', this.fb.control('', [Validators.required]));
            this.registerStorageForm.addControl('smisNamespace', this.fb.control('', [Validators.required]));
            this.registerStorageForm.updateValueAndValidity();
        } else{
            this.showSmis = false;
            this.registerStorageForm.removeControl('smisHost');
            this.registerStorageForm.removeControl('smisPort');
            this.registerStorageForm.removeControl('smisUsername');
            this.registerStorageForm.removeControl('smisPassword');
            this.registerStorageForm.removeControl('smisNamespace');
            this.registerStorageForm.updateValueAndValidity();
        }
        if(this.selectedModel && this.selectedModel.extra){
            this.showExtraAttribs = true;
            this.registerStorageForm.addControl('extra_attributes', this.fb.array([this.createAttributes('','')]));
            this.registerStorageForm.patchValue({
                'enable_extra_attribs' : true
            });
            this.registerStorageForm.updateValueAndValidity();
        } else {
            this.showExtraAttribs = false;
            this.registerStorageForm.removeControl('extra_attributes');
            this.registerStorageForm.patchValue({
                'enable_extra_attribs' : false
            });
            this.registerStorageForm.updateValueAndValidity();
        }
    }
    
    createAttributes(key?, value?){
        return this.fb.group({
            key: new FormControl(key ? key : ''),
            value: new FormControl(value ? value : '')
        })
    }

    addNextAttribute(key?, value?) {
        (this.registerStorageForm.controls['extra_attributes'] as FormArray).push(this.createAttributes((key ? key : ''), (value ? value : '')))
    }
    removeAttributeLink(i: number) {
        if(this.registerStorageForm.get('extra_attributes')['length'] > 1){
            this.registerStorageForm.get('extra_attributes')['removeAt'](i);
        }
    }

    prepareFormDataArray(value){
        
        
        
        let dataArr = {
            vendor: value['vendor'],
            model: value['model'].name,
        };
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
            }
            if(value['sshPubKey']){
                Object.assign(sshConfig, {pub_key: value['sshPubKey']})
            }
            if(value['sshPubKeyType']){
                Object.assign(sshConfig, {pub_key_type: value['sshPubKeyType']})
            }
            dataArr['ssh'] = sshConfig;
        }
        if(this.showCli){
            let cli = {
                host: value['cliHost'],
                port: Number(value['cliPort']),
                username: value['cliUsername'],
                password: value['cliPassword'],
            }
            dataArr['cli'] = cli;
        }
        if(this.showSmis){
            let smis = {
                host: value['smisHost'],
                port: Number(value['smisPort']),
                username: value['smisUsername'],
                password: value['smisPassword'],
                namespace: value['smisNamespace'],
            }
            dataArr['smis'] = smis;
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
        if(!this.registerStorageForm.valid){
            for(let i in this.registerStorageForm.controls){
                this.registerStorageForm.controls[i].markAsTouched();
            }
            return;
        }
        let dataArr = this.prepareFormDataArray(value);

        this.ds.registerStorage(dataArr).subscribe((res)=>{
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: 'Storage device registered successfully.'});
            let queryParams = {
                "message": JSON.stringify({severity: 'success', summary: 'Success', detail: 'Storage device registered successfully.'})
            };
            this.router.navigate(['/resource-monitor'], {queryParams: queryParams});
        }, (error) =>{
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: "Error", detail:"Something went wrong. Storage device could not be registered."});
            console.log("Something went wrong. Storage device could not be registered.", error);
        })
    }
    resetForm(){
        this.showRest = false;
        this.registerStorageForm.removeControl('restHost');
        this.registerStorageForm.removeControl('restPort');
        this.registerStorageForm.removeControl('restUsername');
        this.registerStorageForm.removeControl('restPassword');
        this.showSsh = false;
        this.registerStorageForm.removeControl('sshHost');
        this.registerStorageForm.removeControl('sshPort');
        this.registerStorageForm.removeControl('sshUsername');
        this.registerStorageForm.removeControl('sshPassword');
        this.registerStorageForm.removeControl('sshPubKey');
        this.registerStorageForm.removeControl('sshPubKeyType');
        this.showCli = false;
        this.registerStorageForm.removeControl('cliHost');
        this.registerStorageForm.removeControl('cliPort');
        this.registerStorageForm.removeControl('cliUsername');
        this.registerStorageForm.removeControl('cliPassword');
        this.showSmis = false;
        this.registerStorageForm.removeControl('smisHost');
        this.registerStorageForm.removeControl('smisPort');
        this.registerStorageForm.removeControl('smisUsername');
        this.registerStorageForm.removeControl('smisPassword');
        this.registerStorageForm.removeControl('smisNamespace');
        this.showExtraAttribs = false;
        this.registerStorageForm.removeControl('extra_attributes');
        this.registerStorageForm.patchValue({
            'enable_extra_attribs' : false
        });
        this.registerStorageForm.updateValueAndValidity();
        this.registerStorageForm.reset();
    }
}
