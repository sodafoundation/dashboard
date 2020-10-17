import { Router } from '@angular/router';
import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { I18NService, ParamStorService, Consts} from 'app/shared/api';
import { Http } from '@angular/http';
import { trigger, state, style, transition, animate} from '@angular/animations';
import { I18nPluralPipe } from '@angular/common';

@Component({
    selector: 'app-help-component',
    templateUrl: './help.component.html',
    styleUrls: []
})
export class HelpComponent implements OnInit{

    constructor( 
        public I18N: I18NService,
        private http: Http,
        private paramStor: ParamStorService,){

    }

    ngOnInit(){

    }
}