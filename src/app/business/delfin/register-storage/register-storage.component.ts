import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService, Utils } from 'app/shared/api';
import { FormControl, FormGroup, FormArray, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { AppService } from 'app/app.service';
import { I18nPluralPipe } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Message, MenuItem ,ConfirmationService} from '../../../components/common/api';
import { DelfinService } from '../../delfin/delfin.service';

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
    registerStorageForm: any;
    selectedVendor: any;
    selectedModel: any;

    label = {
        name: this.i18n.keyID["sds_block_volume_name"],
        description: this.i18n.keyID["sds_block_volume_descri"],
        vendor: "Vendor",
        model: "Model",
        host: "Host IP",
        port: "Port",
        username: "Username",
        password: "Password",
        extra_attributes: "Extra Attributes"
    };

    errorMessage = {
        "name": { 
            minlength: "Minimum 2 characters",
            maxlength: "Maximum 128 characters",
            pattern: "Must start with a character. Can contain alphabets, numbers and underscore. No special characters allowed."
        },
        "vendor" : {
            required: "Vendor is required"
        },
        "model" : {
            required: "Model is required"
        },
        "host" : {
            required: "Host IP address is required",
            pattern: "Enter valid IPv4 address"
        },
        "port" : {
            required: "Port is required"
        },
        "username" : {
            required: "Username is required"
        },
        "password" : {
            required: "Password is required"
        },
        "description" : {
            minlength: "Minimum 2 characters",
            maxlength: "Maximum 250 characters",
            pattern: "Must start with a character. Can contain alphabets, numbers and underscore. No special characters allowed."
        }
    };
    validRule= {
        'name':'^[a-zA-Z]{1}([a-zA-Z0-9]|[-_]){0,127}$',
        'description':'^[a-zA-Z ]{1}([a-zA-Z0-9 ]){0,249}$',
        'validIp': '([0-9]{1,3})[.]([0-9]{1,3})[.]([0-9]{1,3})[.]([0-9]{1,3})' /* Validates IPv4 address */
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
                label: "Storages", 
                url: '/delfin' 
            },
            { 
                label: "Register Storage", 
                url: '/registerStorage' 
            }
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
                label: "Fake Storage",
                value: 'fake_storage'
            }
        ];

        this.allStorageModels = {
            'dellemc' : [
                {
                    label: "VMAX3",
                    value: 'vmax'
                },
                {
                    label: "VMAX4",
                    value: 'vmax4'
                }
            ],
            'huawei' : [
                {
                    label: "OceanStor V3",
                    value: 'oceanstor'
                }
            ],
            'fake_storage' : [
                {
                    label: "Fake Driver",
                    value: 'fake_driver'
                }
            ]
        };

        this.registerStorageForm = this.fb.group({
            'name': new FormControl('', {validators:[Validators.minLength(2), Validators.maxLength(128), Validators.pattern(this.validRule.name)]}),
            'description': new FormControl('', {validators:[Validators.minLength(2), Validators.maxLength(250),Validators.pattern(this.validRule.description)]}),
            'vendor': new FormControl('', Validators.required),
            'model': new FormControl('', Validators.required),
            'host': new FormControl('', {validators:[Validators.required, Validators.pattern(this.validRule.validIp)]}),
            'port': new FormControl('', Validators.required),
            'username': new FormControl('', Validators.required),
            'password': new FormControl('', Validators.required),
            'extra_attributes' : this.fb.array([this.createAttributes()])
        });
       
    }

    getAllStorages(){
        this.ds.getAllStorages().subscribe((res)=>{
            console.log("All Storages", res.json().storages);
            this.allStorages = res.json().storages;
        }, (error)=>{
            console.log("Something went wrong. Could not fetch all storages", error);
        })
    }

    getModelsByVendor(vendor){
        let self =this;
        _.each(this.allStorageModels, function(value, key){
            console.log("storage models value", value);
            console.log("storage models key", key);
            if(key==vendor){
                self.modelOptions = value;
            }
        })
        console.log("modeloptions", self.modelOptions);
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
        let meta = {};
        value['extra_attributes'].forEach(element => {
            meta[element['key']] = element['value'];
        });

        let dataArr = {
            vendor: value['vendor'],
            model: value['model'],
            host: value['host'],
            port: value['port'],
            username: value['username'],
            password: value['password'],
            extra_attributes: meta
        };
        if(value['name']){
            dataArr['name'] = value['name'];
        }
        if(value['description']){
            dataArr['description'] = value['description'];
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
            this.router.navigate(['/delfin'], {queryParams: queryParams});
        }, (error) =>{
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: "Error", detail:"Something went wrong. Storage device could not be registered."});
            console.log("Something went wrong. Storage device could not be registered.", error);
        })
    }
}