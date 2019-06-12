import { Router,ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener, Input } from '@angular/core';
import { I18NService, MsgBoxService, HttpService, Utils } from 'app/shared/api';
import { ConfirmationService, ConfirmDialogModule} from '../../../components/common/api';
import { trigger, state, style, transition, animate} from '@angular/animations';
import { I18nPluralPipe } from '@angular/common';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { Http } from '@angular/http';
import { AvailabilityZonesService } from './../../resource/resource.service';
import { ProfileService } from './../../profile/profile.service';
import { FileShareService } from '../fileShare.service';

@Component({
    selector: 'app-create-file-share',
    templateUrl: './create-file-share.component.html',
    styleUrls: [],
    providers: [ConfirmationService, MsgBoxService]
})
export class CreateFileShareComponent implements OnInit{
    fileShareForm: FormGroup;
    availabilityZones = [];
    errorMessage = {
        "zone": { required: "Zone is required."},
        "name": { required: "Name is required" }
    };
    validRule= {
        'name':'^[a-zA-Z]{1}([a-zA-Z0-9]|[_]){0,127}$'
    };
    allVolumeNameForCheck = [];
    defaultProfile = {
        label: null,
        value: {id:null,profileName:null}
    };
    profileOptions = [];
    protocolOptions = [];
    label = {
        zone: this.i18n.keyID["sds_block_volume_az"],
        name: this.i18n.keyID["sds_block_volume_name"],
        profile: this.i18n.keyID["sds_block_volume_profile"],
        capacity: this.i18n.keyID["sds_home_capacity"],
        descript: this.i18n.keyID["sds_block_volume_descri"],
        protocolType: "Share Protocol Type"
      };
      createVolumes = [];
      capacityUnit = [];

    constructor(
        private router: Router,
        private ActivatedRoute: ActivatedRoute,
        public i18n:I18NService,
        private confirmationService: ConfirmationService,
        private http: HttpService,
        private fb: FormBuilder,
        private msg: MsgBoxService,
        private availabilityZonesService:AvailabilityZonesService, 
        private ProfileService: ProfileService,
        private FileShareService: FileShareService
    ){}
    ngOnInit(){
        this.getAZ();
        this.fileShareForm = this.fb.group({
            'zone': new FormControl('', Validators.required),
            'name': new FormControl('', {validators:[Validators.required,Validators.pattern(this.validRule.name),Utils.isExisted(this.allVolumeNameForCheck)]}),
            'profileId': new FormControl(this.defaultProfile, {validators:[Validators.required,this.checkProfile]}),
            'size': new FormControl(1, Validators.required),
            'capacity': new FormControl('GB'),
            'description': [""]
        })
        this.getProfiles();
        this.capacityUnit = [
            {
              label: 'GB', value: 'GB'
            },
            {
              label: 'TB', value: 'TB'
            }
        ];
        this.protocolOptions = [
            {label: 'NFS', value: 'NFS'}
        ];

        this.fileShareForm.valueChanges.subscribe(
            (value: string) => {
                this.setRepForm();
            }
        );
        this.setRepForm();
        this.getFileShares();
    }
    getFileShareDataArray(value){
        let unit = value['capacity'] === 'GB'? 1 : 1024;
        let dataArr = {
            availabilityZone: value['zone'],
            name: value['name'],
            profileId: value['profileId'].id,
            size: value['size']*unit,
            description: value['description']
        }
        return dataArr;
    }
    setRepForm(){
        let param = {
            'zone': new FormControl(this.createVolumes[0], Validators.required),
            'period': new FormControl(60, Validators.required)
        };
        for(let i in this.createVolumes){
            param["name"+i] = new FormControl(this.createVolumes[i].name+"-replication", Validators.required);
            param["profileId"+i] = new FormControl('', Validators.required);
        }
        this.createVolumes["formGroup"] = this.fb.group(param);
    }
    onSubmit(value){
        if(!this.fileShareForm.valid){
            for(let i in this.fileShareForm.controls){
                this.fileShareForm.controls[i].markAsTouched();
            }
            return;
        }
        let dataArr = this.getFileShareDataArray(value);
        dataArr['tenantId'] = window['projectItemId'];
        dataArr['userId'] = window['userId'];
        this.FileShareService.createFileShare(dataArr).subscribe((res)=>{
            this.router.navigate(['/block',"fromFileShare"]);
        })
    }
    getAZ(){
        this.availabilityZonesService.getAZ().subscribe((azRes) => {
          let AZs=azRes.json();
          let azArr = [];
          if(AZs && AZs.length !== 0){
              AZs.forEach(item =>{
                  let obj = {label: item, value: item};
                  azArr.push(obj);
              })
          }
          this.availabilityZones = azArr;
        })
      }
    getProfiles() {
    this.ProfileService.getProfiles().subscribe((res) => {
        let profiles = res.json();
        profiles.forEach(profile => {
            if(profile.storageType =="file"){
                this.profileOptions.push({
                    label: profile.name,
                    value: {id:profile.id,profileName:profile.name}
                });
            }
        });
    });
    }
    checkProfile(control:FormControl):{[s:string]:boolean}{
        if(control.value.id == null){
            return {profileNull:true}
        }
    }
    getFileShares(){
        this.FileShareService.getFileShare().subscribe((res)=>{
            let fileShares = res.json();
            fileShares.forEach(item=>{
                this.allVolumeNameForCheck.push(item.name);
            })
        })
    }
    getErrorMessage(control,extraParam){
        let page = "";
        let key = Utils.getErrorKey(control,page);
        return extraParam ? this.i18n.keyID[key].replace("{0}",extraParam):this.i18n.keyID[key];
    }
}