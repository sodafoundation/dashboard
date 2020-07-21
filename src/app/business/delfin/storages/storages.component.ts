import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService, Utils } from 'app/shared/api';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { AppService } from 'app/app.service';
import { I18nPluralPipe } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Message, MenuItem ,ConfirmationService} from '../../../components/common/api';
import { DelfinService } from '../../delfin/delfin.service';

let _ = require("underscore");
@Component({
    selector: 'app-delfin-storages',
    templateUrl: 'storages.component.html',
    providers: [ConfirmationService],
    styleUrls: [],
    animations: []
})
export class StoragesComponent implements OnInit {
    allStorages: any = [];
    selectedStorages: any = [];
    showListView: boolean = true;
    msgs: Message[];
    
    constructor(
        public I18N: I18NService,
        public ds : DelfinService,
        private confirmationService: ConfirmationService,
        private fb: FormBuilder
    ) {
       
    }

    ngOnInit() {
        this.getAllStorages();
    }

    toggleView(){
        this.showListView = this.showListView ? this.showListView : !this.showListView;
        console.log("ShowlistView", this.showListView);
    }

    getAllStorages(){
        this.ds.getAllStorages().subscribe((res)=>{
            console.log("All Storages", res.json().storages);
            this.allStorages = res.json().storages;
        }, (error)=>{
            console.log("Something went wrong. Could not fetch all storages", error);
        })
    }

    batchDeleteStorages(storages){
        console.log("Inside batch delete storages.")
    }
}