import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { I18NService } from 'app/shared/api';
import { AppService } from 'app/app.service';
import { I18nPluralPipe } from '@angular/common';
import { trigger, state, style, transition, animate} from '@angular/animations';
import { DialogModule } from '../../components/common/api';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl} from '@angular/forms';
import { ConfirmationService,ConfirmDialogModule} from '../../components/common/api';
import { Router } from '@angular/router';

@Component({
    selector: 'replication-list',
    templateUrl: 'replication.html',
    providers: [ConfirmationService],
    styleUrls: [],
    animations: []
})
export class ReplicationComponent implements OnInit{
    allReplications = [];
    selectedReplications = [];
    createReplicationShow = false;
    constructor(
        public I18N: I18NService,
        private router: Router,
        private fb : FormBuilder,
        private confirmationService:ConfirmationService
    ){
        
    }

    ngOnInit() {
        this.allReplications = [{
            name:"rep_media",
            status:"Normal",
            source:"bucket_drive",
            destination:"bucket_log",
            replicationtime:"2018-02-18 16:22:48 "
        }]
    }

}
