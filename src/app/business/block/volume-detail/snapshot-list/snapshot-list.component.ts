import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { VolumeService,SnapshotService } from './../../volume.service';
import { ConfirmationService,ConfirmDialogModule} from '../../../../components/common/api';
import { I18NService, MsgBoxService, Utils } from 'app/shared/api';
import { DropMenuModule} from './../../../../components/common/api';
import { ProfileService } from './../../../profile/profile.service';

@Component({
  selector: 'app-snapshot-list',
  templateUrl: './snapshot-list.component.html',
  providers: [ConfirmationService],
  styleUrls: [

  ]
})
export class SnapshotListComponent implements OnInit {

  @Input() volumeId;
  volume;
  label;
  selectedSnapshotId;
  selectedSnapshots = [];
  snapshots;
  snapshotfilter;
  snapshotPropertyDisplay = false;
  snapshotFormGroup;
  createVolumeFormGroup;
  createVolumeDisplay: boolean = false;
  isFromCloud = false;

  isCreate = false;
  isModify = false;
  snapshotProperty = {
    name: '',
    description: ''
  }
  okBtnDisabled = false;

  errorMessage = {
      "name": { required: "Name is required." },
      "description": { maxlength: this.I18N.keyID['sds_validate_max_length'] }
  };
  param = {
    key: 'VolumeId',
    value: null
  }
  snapProfileOptions = [];
  constructor(
    private VolumeService: VolumeService,
    private SnapshotService: SnapshotService,
    private fb: FormBuilder,
    private confirmationService:ConfirmationService,
    public I18N:I18NService,
    private msg: MsgBoxService,
    private ProfileService:ProfileService
  ) {
    this.snapshotFormGroup = this.fb.group({
      "name": ["", Validators.required],
      "profile":[""],
      "description": ["", Validators.maxLength(200)]
    });

    this.createVolumeFormGroup = this.fb.group({
      "name": ["", Validators.required],
      "description": ["", Validators.maxLength(200)]
    });
  }

  ngOnInit() {
    this.getVolumeById(this.volumeId);
    this.label = {
      name: this.I18N.keyID['sds_block_volume_name'],
      volume:  this.I18N.keyID['sds_block_volume_title'],
      description:  this.I18N.keyID['sds_block_volume_descri']
    }
    this.param={
      key: 'VolumeId',
      value: this.volumeId
    };
    this.getProfiles();
    this.getSnapshots(this.param);
  }

  getProfiles() {
    this.ProfileService.getProfiles().subscribe((res) => {
        let profiles = res.json();
        profiles.forEach(profile => {
            if(profile.snapshotProperties.topology.bucket){
                this.snapProfileOptions.push({
                    label: profile.name,
                    value: profile.id
                });
            }
        });
    });
  }
  getVolumeById(volumeId){
    this.VolumeService.getVolumeById(volumeId).subscribe((res) => {
      this.volume = res.json();
    });
  }

  createSnapshot() {
    if(!this.snapshotFormGroup.valid){
      for(let i in this.snapshotFormGroup.controls){
          this.snapshotFormGroup.controls[i].markAsTouched();
      }
      return;
    }
    let param = {
      name: this.snapshotFormGroup.value.name,
      volumeId: this.volumeId,
      description: this.snapshotFormGroup.value.description
    }
    if(this.snapshotFormGroup.value.profile){
        param['profileId'] = this.snapshotFormGroup.value.profile
    }
    this.SnapshotService.createSnapshot(param).subscribe((res) => {
      this.getSnapshots(
        {
          key: 'VolumeId',
          value: this.volumeId
        }
      );
    });
  }

  batchDeleteSnapshot(param) {
    if (param) {
        let  msg;
        if(param.length>1){

            msg = "<div>Are you sure you want to delete the selected Snapshots?</div><h3>[ "+ param.length +" Snapshots ]</h3>";
        }else{
            msg = "<div>Are you sure you want to delete the Snapshot?</div><h3>[ "+ param[0].name +" ]</h3>";
        }

        this.confirmationService.confirm({
            message: msg,
            header: this.I18N.keyID['sds_block_volume_del_sna'],
            acceptLabel: this.I18N.keyID['sds_block_volume_delete'],
            isWarning: true,
            accept: ()=>{
                param.forEach(snapshot => {
                    this.deleteSnapshot(snapshot.id);
                    
                });
            },
            reject:()=>{}
        })
    }
  }

  deleteSnapshot(id) {
    this.SnapshotService.deleteSnapshot(id).subscribe((res) => {
      Utils.arrayRemoveOneElement(this.selectedSnapshots,id,function(value,index,arr){
        return value.id === id;
      });
      this.getSnapshots(
        {
          key: 'VolumeId',
          value: this.volumeId
        }
      );
      this.getSnapshots(this.getSnapshots);
    });
  }

  getSnapshots(filter?) {
    this.SnapshotService.getSnapshots(filter).subscribe((res) => {
      this.snapshots = res.json();
      this.snapshotPropertyDisplay = false;

      this.snapshots.map((item, index, arr)=>{
        item.description = !item.description || item.description=='' ? '--' : item.description;
        item.createdAt = item.createdAt.replace("T", " ");
        item.size = Utils.getDisplayGBCapacity(item.size);
      })
    });
  }

  modifySnapshot(){
    if(!this.snapshotFormGroup.valid){
      for(let i in this.snapshotFormGroup.controls){
          this.snapshotFormGroup.controls[i].markAsTouched();
      }
      return;
    }
    let param = {
      name: this.snapshotFormGroup.value.name,
      description: this.snapshotFormGroup.value.description
    }
    this.SnapshotService.modifySnapshot(this.selectedSnapshotId,param).subscribe((res) => {
      this.getSnapshots(
        {
          key: 'VolumeId',
          value: this.volumeId
        }
      );
    });
  }

  showSnapshotPropertyDialog(method,selectedSnapshot?){
    this.snapshotPropertyDisplay = true;
    this.snapshotFormGroup.reset({
        name: "",
        profile : "",
        description: ""
    });
    if(method === 'create'){
      this.isCreate = true;
      this.isModify = false;
      this.snapshotProperty.name = '';
      this.snapshotProperty.description = '';
      this.snapshotFormGroup.controls['name'].setValidators([Validators.required]);
    }else if(method === 'modify'){
      this.isCreate = false;
      this.isModify = true;
      this.snapshotProperty.name = selectedSnapshot.name;
      this.snapshotProperty.description = selectedSnapshot.description;
      this.createVolumeFormGroup = this.fb.group({
        "name": [this.snapshotProperty.name, Validators.required],
        "description": ["", Validators.maxLength(200)]
      });
    }
    if(selectedSnapshot && selectedSnapshot.id){
      this.selectedSnapshotId = selectedSnapshot.id;
    }
  }

  snapshotModifyOrCreate(){
    if(this.isModify){
      this.modifySnapshot();
    }else{
      this.createSnapshot();
    }

  }

  showCreateVolumeBasedonSnapshot(snapshot){
    this.createVolumeDisplay = true;
    this.selectedSnapshotId = snapshot.id;
    this.isFromCloud = false;
  }

  createVolumeBasedonSnapshot(snapshot) {
    let param = {
      name: this.createVolumeFormGroup.value.name,
      description: this.createVolumeFormGroup.value.description,
      size: this.volume.size,
      availabilityZone: this.volume.availabilityZone,
      profileId: this.volume.profileId,
      snapshotId: this.selectedSnapshotId,
      snapshotFromCloud: this.isFromCloud
    }

    if(this.createVolumeFormGroup.status == "VALID"){
      this.VolumeService.createVolume(param).subscribe((res) => {
        this.createVolumeDisplay = false;
        this.msg.info("The volume is being created, please go to the volume list and check it.");
      });
    }else{
      // validate
      for(let i in this.createVolumeFormGroup.controls){
          this.createVolumeFormGroup.controls[i].markAsTouched();
      }
    }
  }
  fromCloud(){
    this.isFromCloud = !this.isFromCloud;
  }

}
