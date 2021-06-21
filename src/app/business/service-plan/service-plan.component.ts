import { Router,ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener, Input } from '@angular/core';
import { I18NService, MsgBoxService, Utils, Consts } from 'app/shared/api';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { ConfirmationService, ConfirmDialogModule, Message, LazyLoadEvent} from '../../components/common/api';
import { trigger, state, style, transition, animate} from '@angular/animations';
import { ServicePlanService } from './service-plan.service';
import { I18nPluralPipe } from '@angular/common';
import { Http } from '@angular/http';
import { BucketService} from '../block/buckets.service';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import { SelectItem } from '../../components/common/api';

let _ = require("underscore");

@Component({
    selector: 'soda-service-plan',
    templateUrl: './service-plan.html',
    styleUrls: [],
    providers: [ConfirmationService, MsgBoxService]
})
export class ServicePlanComponent implements OnInit{
    
    options = {
        headers: {
            'X-Auth-Token': localStorage['auth-token']
        } 
    };
    selectedTiers = [];
    currentTier;
    createTierForm:FormGroup;
    errorMessage :any;
    validRule: any;
    showRightSidebar: boolean = false;
    allTiers;
    allTierNameForCheck;
    createTierShow: boolean = false;
    updateTierShow: boolean = false;
    showTierDetailsFlag: boolean = false;
    showAddBackendsForm: boolean = false;
    showAddTenantsForm: boolean = false;
    allTypes = [];
    allBackends = [];
    backendsWithDetails = [];
    tierTenants = [];
    selectedBackendType;
    selectedBackends: string[] = [];
    selectedTenants: string[] = [];
    selectedTierBackends = [];
    selectedTierTenants = [];
    tierBackendsChips: string[];
    listedBackends: any;
    backendsOption: SelectItem[];
    msgs: Message[];
    tenantLists = [];
    addBackendsShow: boolean = false;
    addTenantsShow: boolean = false;
    enableTiering: boolean = Consts.STORAGE_SERVICE_PLAN_ENABLED;

    constructor(
        public I18N: I18NService,
        private router: Router,
        private ActivatedRoute:ActivatedRoute,
        private http:Http,
        private confirmationService: ConfirmationService,
        private BucketService: BucketService,
        private servicePlanService: ServicePlanService,
        private msg: MsgBoxService,
        private fb:FormBuilder
    ){
        this.errorMessage = {
            "name": { 
                required: "Name is required.", 
                isExisted:"This name already exists.",
                minlength: "The tier name should have minimum 3 characters.",
                maxlength: "The tier name can have maximum 63 characters.",
                pattern: "Please enter valid tier name."
            },
            "backend":{ required: "Backend is required." },
            "backend_type": { required: "Type is required." },
            "tenant" : { required : "Tenant is required."}
        };
        this.validRule = {
            'validName' : '^[a-zA-Z0-9][a-zA-Z0-9\.\-\_]{1,61}[a-zA-Z0-9]$'
        };
        this.createTierForm = this.fb.group({
            "name":["",{validators:[Validators.required, Validators.minLength(3), Validators.maxLength(63), Validators.pattern(this.validRule.validName), 
                /* Utils.isExisted(this.allTierNameForCheck) */], updateOn:'change'}],
            "backend":["",{updateOn:'change'}],
            "backend_type": ["",{updateOn:'change'}],
            "tenant":["",{validators:[Validators.required], updateOn:'change'}],
        });
    }

    ngOnInit() {
        this.getAllLists();
    }
    
    tieringControl(event){
        
        if(!event.checked){
            this.confirmationService.confirm({
                message: "Are you sure you want to disable tiering support? This may cause some display inconsistencies.",
                header: "Disable Tiering?",
                acceptLabel: "Ok",
                isWarning: true,
                accept: ()=>{
                    try {
                        this.enableTiering = event.checked;
                    }
                    catch (e) {
                        console.log(e);
                    }
                    finally {}
                },
                reject:()=>{
                    this.enableTiering = true;
                }
            })
        }        
    }
    
    getAllLists(){
        this.getAllTiersTenantsBackends().subscribe((data)=>{
            console.log("Fetched all APIs synchronously", data);
            let tenants = data[0].json().projects;
            let backends = data[1].json().backends;
            let tiers = data[2].json().tiers;

            // Prepare tenants list
            tenants.map((item, index) => {
                let tenant = {};
                if(item.name != "service"){
                    tenant["label"] = item.name;
                    tenant["value"] = item.id;
                    this.tenantLists.push(tenant);
                }
            });

            // Prepare backends list
            backends.forEach(element => {
                this.allBackends.push({
                    label: element.name,
                    value: element.id
                })
            });

            // Prepare Tiers List
            tiers.forEach(tierItem => {
                /* FIXME REMOVE IN FINAL PR */
                    tierItem['tenants'] = [];
                    tierItem['tenants'].push(tierItem['tenantId']);
                /* FIXME REMOVE ABOVE */
                tierItem['displayBackends'] = [];
                tierItem['displayTenants'] = [];
                if(tierItem['backends'] && tierItem['backends'].length){
                    tierItem['backends'].forEach(tierBackendItem => {
                        this.allBackends.forEach(backElement => {
                            if(backElement['value']==tierBackendItem){
                                tierItem['displayBackends'].push(backElement);
                            }
                        });    
                    });
                }
                if(tierItem['tenants'] && tierItem['tenants'].length){
                    tierItem['tenants'].forEach(tierTenantItem => {
                        this.tenantLists.forEach(tenantElement => {
                            if(tenantElement['value']==tierTenantItem){
                                tierItem['displayTenants'].push(tenantElement);
                            }
                        });
                    });
                }                                  
                
            });
            this.allTiers = tiers;
        }, (error)=>{
            console.log("Error fetching all lists", error);
        })      
    }

    getAllTiersTenantsBackends(){
        let request: any = { params:{} };
        request.params = {
            "domain_id": "default"
        }
        return Observable.forkJoin(
            this.http.get("/v3/projects", request),
            this.BucketService.getBckends(),
            this.servicePlanService.getTierList()
        );
    }


    getAllTiers(){
        this.allTiers = [];
        this.servicePlanService.getTierList().subscribe((response) =>{
            console.log("All tiers", response.json().tiers);
            let alltiers = response.json().tiers;
            alltiers.forEach(tierItem => {
                tierItem['displayBackends'] = [];
                tierItem['backends'].forEach(tierBackendItem => {
                    this.allBackends.forEach(backElement => {
                        if(backElement['value']==tierBackendItem){
                            tierItem['displayBackends'].push(backElement);
                        }
                    });    
                });
                
            });
            this.allTiers = alltiers;
            console.log("All Tiers with names resolved", this.allTiers);
        }, (error)=>{
            console.log("Something went wrong. Tiers could not be fetched.");
        });
    }
    getTenants(){
        this.tenantLists = [];

        let request: any = { params:{} };
        request.params = {
            "domain_id": "default"
        }

        this.http.get("/v3/projects", request).subscribe((res) => {
            res.json().projects.map((item, index) => {
                let tenant = {};
                if(item.name != "admin" && item.name != "service"){
                    tenant["label"] = item.name;
                    tenant["value"] = item.id;
                    this.tenantLists.push(tenant);
                }
            });
        });
    }

    getBackends() {
        this.allBackends = [];
        this.BucketService.getBckends().subscribe((res) => {
            let backendslist = res.json().backends;

            backendslist.forEach(element => {
                this.allBackends.push({
                    label: element.name,
                    value: element.id
                })
            });
            console.log("All BAckends in get Tiers.", this.allBackends);
        });
    }

    showCreateTier(){
        if(!this.createTierForm.controls['name']){
            this.createTierForm.addControl('name', this.fb.control(''));
            this.createTierForm.controls['name'].setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(63), Validators.pattern(this.validRule.validName)]);
            this.createTierForm.controls['name'].updateValueAndValidity();
        }
        if(!this.createTierForm.controls['backend']){
            this.createTierForm.addControl('backend', this.fb.control(''));
            this.createTierForm.controls['backend'].updateValueAndValidity();
        }
        if(!this.createTierForm.controls['backend_type']){
            this.createTierForm.addControl('backend_type', this.fb.control(''));
            this.createTierForm.controls['backend_type'].updateValueAndValidity();
        }
        if(!this.createTierForm.controls['tenant']){
            this.createTierForm.addControl('tenant', this.fb.control(''));
            this.createTierForm.controls['tenant'].updateValueAndValidity();
        }
        this.getTypes();
        this.getTenants();
        this.createTierShow = true;
        this.showRightSidebar = true;

    }

    createTier(){
        if(!this.createTierForm.valid){
            for(let i in this.createTierForm.controls){
                this.createTierForm.controls[i].markAsTouched();
            }
            return;
        }
        let param = {
            Name:this.createTierForm.value.name,
            Backends:[],
            Tenants: []
        };
        let backendsToAdd = this.createTierForm.value.backend;
        if(backendsToAdd && backendsToAdd.length>0){
            backendsToAdd.forEach(element => {
                param.Backends.push(element.id);
            });
        }
        
        let tenantsToAdd = this.createTierForm.value.tenant;
        if(tenantsToAdd && tenantsToAdd.length>0){
            tenantsToAdd.forEach(element => {
                param.Tenants.push(element.id);
            });
        }
        console.log("Form Value", param);
        this.servicePlanService.createTier(this.createTierForm.value.tenant, param).subscribe((res)=>{
            console.log("Created Tier", res.json());
            this.msgs = [];
            let successMsg = "Tier " + res.json().name + " has been created successfully."
            this.msgs.push({severity: 'success', summary: 'Success', detail: successMsg});
            this.closeSidebar();
        }, (error)=>{
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: "Error creating tier.", detail: error._body});
            this.closeSidebar();
        })
    }
    closeSidebar(){
        this.showRightSidebar = false;
        this.createTierShow = false;
        this.updateTierShow = false;
        this.showTierDetailsFlag = false
        this.showAddBackendsForm = false;
        this.selectedTierBackends = [];
        this.backendsOption = [];
        this.selectedBackends = [];
        this.selectedTenants = [];
        this.createTierForm.reset();
        this.getAllTiers();
        //this.updateTierForm.reset();
    }

    showUpdateTier(tier){
        this.updateTierShow = true;
        this.showRightSidebar = true;
    }
    

    showTierDetails(tier){
        
        console.log("Event in tier details", tier);  
        console.log("Tenant Lists in Tier Details", this.tenantLists);
        if(!tier.hasOwnProperty('tenantName')){
            this.tenantLists.forEach(element => {
                if(tier.tenantId == element['value']){
                    tier.tenantName = element['label'];
                }
            });
        }        
        this.currentTier = tier;
        console.log("Current Tier in details", this.currentTier);
        let backendsInTier = tier.backends;
        this.getBackendsDetailsById(backendsInTier);
        this.showTierDetailsFlag = true;
        this.showRightSidebar = true;
    }
    getTierDetailsById(tierId){
        this.servicePlanService.getTierDetails(tierId).subscribe((res)=>{
            console.log("Singel Tier Details", res.json());
        }, (error)=>{
            console.log("Something went wrong. Could not fetch tier details.")
        });
    }

    batchDeleteTiers(tiers){
        let arr=[], msg;
        
        if(_.isArray(tiers)){
            tiers.forEach((item,index)=> {
                arr.push(item.id);
            })
            msg = "<div>Are you sure you want to delete the selected Tiers?</div><h3>[ "+ tiers.length +" Tiers ]</h3>";
        }else{
            arr.push(tiers.id);
            msg = "<div>Are you sure you want to delete the Tier?</div><h3>[ "+ tiers.name +" ]</h3>";
        }
        let header ="Delete";
        let acceptLabel = "Delete";
        let warming = true;
        this.confirmDialog([msg,header,acceptLabel,warming,"delete"], arr)
    }

    deleteTier(id){
        this.servicePlanService.deleteTier(id).subscribe((res)=>{
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: 'Tier Deleted Successfully.'});
            this.getAllTiers();
        },(error)=>{
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: "Error deleting tier.", detail: error._body});
        });   
    }

    getTypes() {
        this.allTypes = [];
        this.BucketService.getTypes().subscribe((res) => {
            res.json().types.forEach(element => {
                this.allTypes.push({
                    label: Consts.CLOUD_TYPE_NAME[element.name],
                    value: element.name
                })
            });
        });
    }

    getBackendsByTypeId(src?) {
        this.backendsOption = [];
        this.BucketService.getBackendsByTypeId(this.selectedBackendType).subscribe((res) => {
            let backends = res.json().backends ? res.json().backends :[];
            this.listedBackends = backends;
            console.log("Selected Backend", this.selectedBackendType);
            console.log("backends list", backends);
            backends.forEach(element => {
                if(src && src == "add"){
                    this.backendsWithDetails.forEach(backendElement =>{
                        if(backendElement.id != element.id){
                            this.backendsOption.push({
                                label: element.name,
                                value: {
                                    "name": element.name,
                                    "id" : element.id                        
                                }
                            })
                        }
                    })
                } else{
                    this.backendsOption.push({
                        label: element.name,
                        value: {
                            "name": element.name,
                            "id" : element.id                        
                        }
                    })
                }
            });
        });
    }

    loadTierDetails(event){
        this.currentTier = event.data;
        let backendsInTier = event.data.backends;
        this.getBackendsDetailsById(backendsInTier);
    }
    getBackendsDetailsById(backendIds) {
        this.backendsWithDetails = [];
        if(backendIds && backendIds.length>0){
            this.BucketService.getBckends().subscribe((res) => {
                let listAllBackends = res.json().backends;
                backendIds.forEach(element => {
                    console.log("each back", element);
                    listAllBackends.forEach(backElement => {
                        if(backElement.id == element){
                            this.backendsWithDetails.push(backElement);
                        }
                    });
                });
                console.log("backends With Details", this.backendsWithDetails);
            }); 
        } else{
            this.backendsWithDetails = [];
        }
        
    }
    showAddTenants(){
        if(this.createTierForm.controls['name']){
            this.createTierForm.removeControl('name');
        }        
        if(this.createTierForm.controls['backend']){
            this.createTierForm.removeControl('backend');
        }
        if(this.createTierForm.controls['backend_type']){
            this.createTierForm.removeControl('backend_type');        
        }
        if(!this.createTierForm.controls['tenant']){
            this.createTierForm.addControl('tenant', this.fb.control(''));
            this.createTierForm.controls['tenant'].updateValueAndValidity();
        }
        this.showAddTenantsForm = true;        
        this.selectedBackends = [];
        this.getTypes();

    }
    closeAddTenants(){
        this.selectedBackends = [];
        this.showAddTenantsForm = false;
    }
    addTenants(tenants){
        console.log("Tenants to add", tenants);
        this.showAddTenantsForm = false;
        let reqBody = {
            AddTenants : []
        }
        tenants.forEach(element => {
            reqBody.AddTenants.push(element.value)
        });                            
        console.log("request in add", reqBody);
        this.servicePlanService.updateTier(this.currentTier.id, reqBody).subscribe((res)=>{
            console.log("Current Tier in add backend success", this.currentTier);
            //this.getBackendsDetailsById(res.json().backends);
            
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: 'Tenant Added Successfully.'});
        }, (error)=>{
            this.showRightSidebar = true;
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: "Error adding tenant.", detail: error._body});

        })
    }

    showAddBackends(){
        if(this.createTierForm.controls['name']){
            this.createTierForm.removeControl('name');
        }        
        if(this.createTierForm.controls['tenant']){
            this.createTierForm.removeControl('tenant');
        }
        if(!this.createTierForm.controls['backend']){
            this.createTierForm.addControl('backend', this.fb.control(''));
            this.createTierForm.controls['backend'].updateValueAndValidity();
        }
        if(!this.createTierForm.controls['backend_type']){
            this.createTierForm.addControl('backend_type', this.fb.control(''));
            this.createTierForm.controls['backend_type'].updateValueAndValidity();
        }
        
        this.showAddBackendsForm = true;
        
        this.selectedBackends = [];
        this.getTypes();

    }
    closeAddBackends(){
        this.selectedBackends = [];
        this.showAddBackendsForm = false;
    }
    addBackends(backends){
        console.log("Backends to add", backends);
        this.showAddBackendsForm = false;
        let reqBody = {
            AddBackends : []
        }
        backends.forEach(element => {
            reqBody.AddBackends.push(element.id)
        });                            
        console.log("request in add", reqBody);
        this.servicePlanService.updateTier(this.currentTier.id, reqBody).subscribe((res)=>{
            console.log("Current Tier in add backend success", this.currentTier);
            this.getBackendsDetailsById(res.json().backends);
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: 'Backend Added Successfully.'});
        }, (error)=>{
            this.showRightSidebar = true;
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: "Error adding backend.", detail: error._body});

        })
    }
    batchRemoveBackends(tierBackends){
        console.log("Selected Backends to remove", tierBackends);
        let arr=[], msg;
        if(_.isArray(tierBackends)){
            tierBackends.forEach((item,index)=> {
                arr.push(item.id);
            })
            msg = "<div>Are you sure you want to remove the selected backends?</div><h3>[ "+ tierBackends.length +" backends ]</h3>";
        }else{
            arr.push(tierBackends.id);
            msg = "<div>Are you sure you want to remove the backend?</div><h3>[ "+ tierBackends.name +" ]</h3>";
        }
        let header ="Remove";
        let acceptLabel = "Remove";
        let warming = true;
        this.confirmDialog([msg,header,acceptLabel,warming,"removeBackend"], arr, this.currentTier)
    }

    batchRemoveTenants(tierTenants){
        console.log("Selected Tenants to remove", tierTenants);
        let arr=[], msg;
        if(_.isArray(tierTenants)){
            tierTenants.forEach((item,index)=> {
                arr.push(item.id);
            })
            msg = "<div>Are you sure you want to remove the selected tenants?</div><h3>[ "+ tierTenants.length +" tenants ]</h3>";
        }else{
            arr.push(tierTenants.id);
            msg = "<div>Are you sure you want to remove the tenant?</div><h3>[ "+ tierTenants.name +" ]</h3>";
        }
        let header ="Remove";
        let acceptLabel = "Remove";
        let warming = true;
        this.confirmDialog([msg,header,acceptLabel,warming,"removeTenant"], arr, this.currentTier)
    }

    confirmDialog([msg,header,acceptLabel,warming=true,func], param, tier?){
        this.confirmationService.confirm({
            message: msg,
            header: header,
            acceptLabel: acceptLabel,
            isWarning: warming,
            accept: ()=>{
                try {
                    switch (func) {
                        case "delete":
                            param.forEach(element => {
                                this.deleteTier(element)    
                            });                            
                            break;
                        case "remove":
                            let reqBody = {
                                AddBackends : [],
                                DeleteBackends: []
                            }
                            param.forEach(element => {
                                reqBody.DeleteBackends.push(element)    
                            });
                            this.servicePlanService.updateTier(tier.id, reqBody).subscribe((res)=>{
                                this.getBackendsDetailsById(res.json().backends);
                                this.showRightSidebar = true;
                                this.msgs = [];
                                this.msgs.push({severity: 'success', summary: 'Success', detail: 'Backend removed Successfully.'});
                            }, (error)=>{
                                this.showRightSidebar = true;
                                this.msgs = [];
                                this.msgs.push({severity: 'error', summary: "Error removing backend.", detail: error._body});

                            })
                            break;
                        case "removeTenant":
                                let reqestBody = {
                                    DeleteTenants: []
                                }
                                param.forEach(element => {
                                    reqestBody.DeleteTenants.push(element)    
                                });                            
                                this.servicePlanService.updateTier(tier.id, reqestBody).subscribe((res)=>{
                                    //this.getBackendsDetailsById(res.json().backends);
                                    this.showRightSidebar = true;
                                    this.msgs = [];
                                    this.msgs.push({severity: 'success', summary: 'Success', detail: 'Tenant removed Successfully.'});
                                }, (error)=>{
                                    this.showRightSidebar = true;
                                    this.msgs = [];
                                    this.msgs.push({severity: 'error', summary: "Error removing tenant.", detail: error._body});
    
                                })
                                break;
                        default:
                            break;
                    }
                    
                }
                catch (e) {
                    console.log(e);
                }
                finally {}
            },
            reject:()=>{
                this.showTierDetails(this.currentTier);
            }
        })
    }
}
