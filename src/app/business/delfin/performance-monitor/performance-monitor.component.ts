import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener, PipeTransform, Pipe,  } from '@angular/core';
import { DomSanitizer } from "@angular/platform-browser";
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService, Utils, Consts} from 'app/shared/api';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { AppService } from 'app/app.service';
import { I18nPluralPipe } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Message, MenuItem ,ConfirmationService} from '../../../components/common/api';
import { DelfinService } from '../delfin.service';

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }
  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
@Component({
    selector: 'app-delfin-performance-monitor',
    templateUrl: 'performance-monitor.component.html',
    providers: [ConfirmationService],
    styleUrls: [],
    animations: []
})
export class PerformanceMonitorComponent implements OnInit{

    performanceMonitorURL: any = "";

    constructor(
    ){}
    
    ngOnInit() {
      
      this.performanceMonitorURL = "http://" + Consts.SODA_HOST_IP + ":" + Consts.SODA_GRAFANA_PORT + "/d/UnRt1zknk/performance-monitor-overall-dashboard?orgId=1&refresh=30s&from=now-24h&var-delfin_storage_id=&var-resource_type=&var-resource_id=&theme=light"

    }
    
}
