import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService, Utils } from 'app/shared/api';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { AppService } from 'app/app.service';
import { I18nPluralPipe } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Message, MenuItem ,ConfirmationService} from '../../components/common/api';
import { StoragesComponent } from './storages/storages.component';

let _ = require("underscore");
@Component({
    selector: 'app-delfin',
    templateUrl: 'delfin.component.html',
    providers: [ConfirmationService],
    styleUrls: [],
    animations: []
})
export class DelfinComponent implements OnInit {
   

    constructor(
        public I18N: I18NService,
        private confirmationService: ConfirmationService,
        private fb: FormBuilder
    ) {
       
    }

    ngOnInit() {

    }
}