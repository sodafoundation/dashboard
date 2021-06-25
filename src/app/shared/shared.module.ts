import { NgModule, ModuleWithProviders, APP_INITIALIZER, Injector } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ExceptionService, MsgBoxService, I18NService, HttpService, ParamStorService } from './api';
import { SharedConfig } from './shared.config';
import { 
    ButtonModule, 
    DataTableModule, 
    PanelModule, 
    OverlayPanelModule,  
    ChartModule, 
    CardModule, 
    TabViewModule, 
    InputTextModule, 
    InputSwitchModule, 
    DropMenuModule, 
    DialogModule, 
    FormModule,
    MultiSelectModule, 
    GrowlModule ,
    DropdownModule,
    InputTextareaModule, 
    I18N, 
    MsgBoxModule,
    ConfirmDialogModule,
    CheckboxModule, 
    SplitButtonModule, 
    SpinnerModule,
    MessageModule,
    ConfirmationService,
    RadioButtonModule,
    SelectButtonModule,
    BreadcrumbModule,
    HomeDialogModule,
    CalendarModule,
    BadgeModule,
    PasswordModule
} from '../components/common/api';
import { AccordionModule } from '../components/accordion/accordion';
import { DeferModule } from '../components/defer/defer';
import { InplaceModule } from '../components/inplace/inplace';
import { ChipsModule } from '../components/chips/chips';
import { TooltipModule } from '../components/tooltip/tooltip';
import { SidebarModule } from '../components/sidebar/sidebar';
import { ScrollPanelModule } from '../components/scrollpanel/scrollpanel';
import { DataScrollerModule } from '../components/datascroller/datascroller';
import { TreeModule } from '../components/tree/tree';
import { ProgressBarModule } from '../components/progressbar/progressbar';
import { ContextMenuModule } from '../components/contextmenu/contextmenu';
import { TableModule } from '../components/table/table';
import { DataViewModule } from '../components/dataview/dataview';
import { FieldsetModule } from '../components/fieldset/fieldset'
import { XHRBackend, RequestOptions, Http } from '@angular/http';
import { ClipboardModule } from 'ngx-clipboard';
import { ServicePlanService } from 'app/business/service-plan/service-plan.service';

export function httpFactory(backend: XHRBackend, options: RequestOptions, injector: Injector){
    options.headers.set("contentType", "application/json; charset=UTF-8");
    options.headers.set('Cache-control', 'no-cache');
    options.headers.set('cache-control', 'no-store');
    options.headers.set('expires', '0');
    options.headers.set('Pragma', 'no-cache');

    return new HttpService(backend, options, injector);
}

@NgModule({
    imports:[MsgBoxModule],
    exports:[
        CommonModule,
        FormsModule, 
        ReactiveFormsModule,
        MsgBoxModule,
        ButtonModule, 
        DataTableModule, 
        PanelModule, 
        OverlayPanelModule,  
        ChartModule, 
        CardModule, 
        TabViewModule, 
        InputTextModule, 
        InputSwitchModule, 
        DropMenuModule, 
        DialogModule, 
        FormModule,
        MultiSelectModule, 
        GrowlModule ,
        DropdownModule,
        InputTextareaModule, 
        TooltipModule,
        TableModule,
        FieldsetModule,
        DataViewModule,
        ScrollPanelModule,
        DataScrollerModule,
        TreeModule,
        ProgressBarModule,
        ContextMenuModule,
        ConfirmDialogModule,
        CheckboxModule, 
        SplitButtonModule, 
        SpinnerModule,
        MessageModule,
        ClipboardModule,
        RadioButtonModule,
        SelectButtonModule,
        BreadcrumbModule,
        HomeDialogModule,
        SidebarModule,
        CalendarModule,
        InplaceModule,
        ChipsModule,
        DeferModule,
        AccordionModule,
        BadgeModule,
        PasswordModule
    ]
})

export class SharedModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: SharedModule,
            providers: [
                MsgBoxService,
                I18NService,
                ParamStorService,
                ConfirmationService,
                ServicePlanService,
                ExceptionService,
                {
                    provide: Http,
                    useFactory: httpFactory,
                    deps: [XHRBackend, RequestOptions, Injector]
                },
                {
                    provide: APP_INITIALIZER,
                    useFactory: SharedConfig.config,
                    deps: [I18NService, Injector],
                    multi: true
                }
            ]
        };
    }
}
