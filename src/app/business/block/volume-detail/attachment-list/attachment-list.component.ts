import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { VolumeService,SnapshotService } from '../../volume.service';
import { ConfirmationService,ConfirmDialogModule} from '../../../../components/common/api';
import { I18NService, MsgBoxService, Utils } from '../../../../../app/shared/api';
import { Message} from '../../../../components/common/api';
import { ProfileService } from '../../../profile/profile.service';
import { HostsService } from '../../hosts.service';
import { AttachService } from '../../attach.service';

let _ = require("underscore");
@Component({
  selector: 'app-attachment-list',
  templateUrl: './attachment-list.component.html',
  providers: [ConfirmationService],
  styleUrls: [

  ]
})
export class AttachmentListComponent implements OnInit {

  @Input() volumeId;
  msgs: Message[];
  allHosts = [];
  attachedHosts = [];
  attachedHostsTableData = [];
  allVolumes = [];
  selectedHost;
  detachDisplay: boolean = false;
  detachHostFormGroup;
  selectedVolume;

  constructor(
    private VolumeService: VolumeService,
    private HostsService: HostsService, 
    private attach: AttachService, 
    private fb: FormBuilder,
    private confirmationService:ConfirmationService,
    public I18N:I18NService,
    private msg: MsgBoxService,
    private ProfileService:ProfileService
  ) {
      let self = this;
    this.detachHostFormGroup = this.fb.group({
        "attachmentId" : ['', Validators.required]
    })
    this.getAllAttachedHosts();
    this.getVolumes();
    _.each(self.allVolumes, function(item){
        if(item['id'] == self.volumeId){
            self.selectedVolume = item;
        }
    })
  }

  ngOnInit() {
      let self =this;

  }

  

  getAllAttachedHosts(){
    let self =this;
    let tableData = [];
    self.attachedHostsTableData = [];
     this.attach.getAttachments().subscribe((res) => {
        this.attachedHosts = res.json();
        if(this.attachedHosts.length > 0){
           let self = this;
           this.HostsService.getHosts().subscribe((res) => {
                this.allHosts = res.json();
                if(this.allHosts && this.allHosts.length){
                    _.each(self.attachedHosts, function(atItem){
                        _.each(self.allHosts, function(hostItem){
                            if(atItem['hostId'] == hostItem['id'] && atItem['volumeId'] == self.volumeId){
                                hostItem['attachmentId'] = atItem['id'];
                                tableData.push(hostItem);
                            }
                        });
                    });
                } 
                this.attachedHostsTableData = tableData;
            }, (error) =>{
                this.msgs = [];
                this.msgs.push({severity: 'error', summary: 'Error', detail: error.message});
            })
           
       } 
    }, (error) =>{
        this.msgs = [];
        this.msgs.push({severity: 'error', summary: 'Error', detail: error.json().message});
    })
  
}
  

 showDetach(host){
    let self = this;
    this.detachDisplay = true;
    _.each(self.allVolumes, function(item){
        if(item['id'] == self.volumeId){
            self.selectedVolume = item;
        }
    })
    this.selectedHost = host;
 }

 detachHost(){
    this.attach.deleteAttachment(this.selectedHost.attachmentId).subscribe((res) =>{
        this.msgs = [];
        this.msgs.push({severity: 'success', summary: 'Success', detail: 'Host Detached Successfully.'});
        this.detachDisplay = false;
        this.getAllAttachedHosts();
    }, (error) => {
        this.msgs = [];
        this.msgs.push({severity: 'error', summary: 'Error', detail: error.json().message});
    })
}
 getVolumes() {
    this.VolumeService.getVolumes().subscribe((res) => {
        let volumes = res.json();
        this.allVolumes = volumes;
    }, (error) => {
        this.msgs = [];
        this.msgs.push({severity: 'error', summary: 'Error', detail: error.message});
    });
}


}
