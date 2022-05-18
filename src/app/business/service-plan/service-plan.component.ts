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
    allTierNameForCheck=[];
    createTierShow: boolean = false;
    updateTierShow: boolean = false;
    showTierDetailsFlag: boolean = false;
    showAddBackendsForm: boolean = false;
    showAddTenantsForm: boolean = false;
    allTypes = [];
    allBackends = [];
    allTenants = [];
    backendsWithDetails = [];
    tenantsWithDetails = [];
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
                required: "Service plan name is required.",
                isExisted:"This service plan name already exists.",
                minlength: "The service plan name should have minimum 3 characters.",
                maxlength: "The service plan name can have maximum 63 characters.",
                pattern: "Please enter a valid service plan name."
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
                Utils.isExisted(this.allTierNameForCheck)], updateOn:'change'}],
            "backend":["",{updateOn:'change'}],
            "backend_type": ["",{updateOn:'change'}],
            "tenant":["",{updateOn:'change'}],
        });
    }

    ngOnInit() {
        this.getAllLists();
    }

    getAllLists(){
        this.allTiers = [];
        this.allTierNameForCheck = [];
        let tenants = [], backends = [], tiers = [];
        this.getAllTiersTenantsBackends().subscribe((data)=>{
            tenants = data[0].json().projects;
            backends = data[1].json().backends;
            tiers = data[2].json().tiers;

            // Prepare tenants list
            tenants.map((item, index) => {
                let tenant = {};
                if(item.name != "service"){
                    tenant["label"] = item.name;
                    tenant["value"] = item.id;
                    this.allTenants.push(tenant);
                }
            });

            // Prepare backends list
            if(backends && backends.length){
            backends.forEach(element => {
                this.allBackends.push({
                    label: element.name,
                    value: element.id
                })
            });
            }
            // Prepare Tiers List
            if(tiers && tiers.length){
                tiers.forEach(tierItem => {
                    this.allTierNameForCheck.push(tierItem['name']);
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
                            this.allTenants.forEach(tenantElement => {
                                if(tenantElement['value']==tierTenantItem){
                                    tierItem['displayTenants'].push(tenantElement);
                                }
                            });
                        });
                    }

                });
                this.allTiers = tiers;
            }
        }, (error)=>{
            console.log("Error fetching all lists", error);
        })
    }

    // Use the Rxjs operator to  join all API calls together
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

    // Get all tiers
    getAllTiers(){
        this.allTiers = [];
        this.allTierNameForCheck = [];
        this.servicePlanService.getTierList().subscribe((response) =>{
            let alltiers = response.json().tiers;
            if(alltiers && alltiers.length){
                alltiers.forEach(tierItem => {
                    tierItem['displayBackends'] = [];
                    this.allTierNameForCheck.push(tierItem['name']);
                    if(tierItem['backends'] && tierItem['backends'].length){
                        tierItem['backends'].forEach(tierBackendItem => {
                            this.allBackends.forEach(backElement => {
                                if(backElement['value']==tierBackendItem){
                                    tierItem['displayBackends'].push(backElement);
                                }
                            });
                        });
                    }
                    tierItem['displayTenants'] = [];
                    if(tierItem['tenants'] && tierItem['tenants'].length){
                        tierItem['tenants'].forEach(tierTenantItem => {
                            this.allTenants.forEach(tenElement => {
                                if(tenElement['value']==tierTenantItem){
                                    tierItem['displayTenants'].push(tenElement);
                                }
                            });
                        });
                    }
                });
                this.allTiers = alltiers;
            }

        }, (error)=>{
            console.log("Something went wrong. Tiers could not be fetched.");
        });
    }

    //Get all tenants
    getTenants(src?){
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
                    tenant["value"] = {
                        "name": item.name,
                        "id" : item.id
                    };
                    this.tenantLists.push(tenant);
                }
            });
        });
    }

    // Get all Backends
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
        });
    }

    // Show the create tier panel
    showCreateTier(){
        this.getAllTiers();
        if(!this.createTierForm.controls['name']){
            this.createTierForm.addControl('name', this.fb.control(''));
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
        this.createTierForm.controls['name'].setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(63), Validators.pattern(this.validRule.validName), Utils.isExisted(this.allTierNameForCheck)]);
        this.createTierForm.controls['name'].updateValueAndValidity();
        this.getTypes();
        this.getTenants();
        this.createTierShow = true;
        this.showRightSidebar = true;

    }

    // On submit of the create tier form
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
        this.servicePlanService.createTier(param).subscribe((res)=>{
            this.msgs = [];
            let successMsg = "Service Plan " + res.json().name + " has been created successfully."
            this.msgs.push({severity: 'success', summary: 'Success', detail: successMsg});
            this.closeSidebar();
        }, (error)=>{
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: "Error creating service plan.", detail: error._body});
            this.closeSidebar();
        })
    }

    // Close the sidebar

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
        this.tenantsWithDetails = [];
        this.createTierForm.reset();
        this.getAllTiers();
    }

    // Show the Update tier panel
    showUpdateTier(tier){
        this.updateTierShow = true;
        this.showRightSidebar = true;
    }

    // Show the tier details panel
    showTierDetails(tier){
        this.tenantsWithDetails = [];
        let tenantsInTier = tier && tier.tenants ? tier.tenants : [];
        this.getTenantDetailsById(tenantsInTier);
        this.currentTier = tier;
        let backendsInTier = tier && tier.backends ? tier.backends : [];
        this.getBackendsDetailsById(backendsInTier);
        this.showTierDetailsFlag = true;
        this.showRightSidebar = true;
    }

    // Get the tenant details from the ids from the tier list
    getTenantDetailsById(tenantIds){
        this.tenantsWithDetails = [];
        if(tenantIds && tenantIds.length){
            tenantIds.forEach(tenInTierItem => {
                this.allTenants.forEach(element => {
                    if(tenInTierItem == element['value']){
                        this.tenantsWithDetails.push(element);
                    }
                });
            });
        } else{
            this.tenantsWithDetails = [];
        }
    }

    // Get the details of a tier by id
    getTierDetailsById(tierId){
        this.servicePlanService.getTierDetails(tierId).subscribe((res)=>{
        }, (error)=>{
            console.log("Something went wrong. Could not fetch service plan details.")
        });
    }

    // Batch delete tiers
    batchDeleteTiers(tiers){
        let arr=[], msg;

        if(_.isArray(tiers)){
            tiers.forEach((item,index)=> {
                arr.push(item.id);
            })
            msg = "<div>Are you sure you want to delete the selected Service Plans?</div><h3>[ "+ tiers.length +" service plans ]</h3>";
        }else{
            arr.push(tiers.id);
            msg = "<div>Are you sure you want to delete the Service Plan?</div><h3>[ "+ tiers.name +" ]</h3>";
        }
        let header ="Delete";
        let acceptLabel = "Delete";
        let warming = true;
        this.confirmDialog([msg,header,acceptLabel,warming,"delete"], arr)
    }

    // On confirming delete
    deleteTier(id){
        this.servicePlanService.deleteTier(id).subscribe((res)=>{
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: 'Service Plan Deleted Successfully.'});
            this.getAllTiers();
        },(error)=>{
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: "Error deleting service plan.", detail: error._body});
        });
    }

    // get the backend types
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

    // Get the backend type of the tier backends by backend id
    getBackendsByTypeId(src?) {
        this.backendsOption = [];
        this.BucketService.getBackendsByTypeId(this.selectedBackendType).subscribe((res) => {
            let backends = res.json().backends ? res.json().backends :[];
            this.listedBackends = backends;
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
        let tenantsInTier = event.data.tenants;
        this.getTenantDetailsById(tenantsInTier);
        this.getBackendsDetailsById(backendsInTier);
    }

    // Get the details of backends from the id in the tier backends list
    getBackendsDetailsById(backendIds) {
        this.backendsWithDetails = [];
        if(backendIds && backendIds.length>0){
            this.BucketService.getBckends().subscribe((res) => {
                let listAllBackends = res.json().backends;
                backendIds.forEach(element => {
                    listAllBackends.forEach(backElement => {
                        if(backElement.id == element){
                            this.backendsWithDetails.push(backElement);
                        }
                    });
                });
            });
        } else{
            this.backendsWithDetails = [];
        }

    }

    // Show the add Tenants dialog
    showAddTenants(){
        this.getTenants();
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
        this.selectedTenants = [];

    }

    //Close the add tenants dialog
    closeAddTenants(){
        this.selectedTenants = [];
        this.showAddTenantsForm = false;
    }

    // Called on submitting the Add Tenants dialog
    addTenants(tenants){
        this.showAddTenantsForm = false;
        let reqBody = {
            AddTenants : []
        }
        tenants.forEach(element => {
            reqBody.AddTenants.push(element.id)
        });
        this.servicePlanService.updateTier(this.currentTier.id, reqBody).subscribe((res)=>{
            this.getTenantDetailsById(res.json().tenants)
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: 'Tenant Added Successfully.'});
        }, (error)=>{
            this.showRightSidebar = true;
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: "Error adding tenant.", detail: error._body});

        })
    }

    // Show the add backends dialog
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

    // Close the add backends dialog
    closeAddBackends(){
        this.selectedBackends = [];
        this.showAddBackendsForm = false;
    }

    // Called on submitting the add backends dialog
    addBackends(backends){
        this.showAddBackendsForm = false;
        let reqBody = {
            AddBackends : []
        }
        backends.forEach(element => {
            reqBody.AddBackends.push(element.id)
        });
        this.servicePlanService.updateTier(this.currentTier.id, reqBody).subscribe((res)=>{
            this.getBackendsDetailsById(res.json().backends);
            this.msgs = [];
            this.msgs.push({severity: 'success', summary: 'Success', detail: 'Backend Added Successfully.'});
        }, (error)=>{
            this.showRightSidebar = true;
            this.msgs = [];
            this.msgs.push({severity: 'error', summary: "Error adding backend.", detail: error._body});

        })
    }

    // batch remove the backends
    batchRemoveBackends(tierBackends){
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

    // batch remove the tenants
    batchRemoveTenants(tierTenants){
        let arr=[], msg;
        if(_.isArray(tierTenants)){
            tierTenants.forEach((item,index)=> {
                arr.push(item.value);
            })
            msg = "<div>Are you sure you want to remove the selected tenants?</div><h3>[ "+ tierTenants.length +" tenants ]</h3>";
        }else{
            arr.push(tierTenants.value);
            msg = "<div>Are you sure you want to remove the tenant?</div><h3>[ "+ tierTenants.label +" ]</h3>";
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
                        case "removeBackend":
                            let reqBody = {
                                AddBackends : [],
                                DeleteBackends: []
                            }
                            param.forEach(element => {
                                reqBody.DeleteBackends.push(element)
                            });
                            this.servicePlanService.updateTier(tier.id, reqBody).subscribe((res)=>{
                                this.getBackendsDetailsById(res.json().backends);
                                this.selectedTierBackends = [];
                                this.showRightSidebar = true;
                                this.msgs = [];
                                this.msgs.push({severity: 'success', summary: 'Success', detail: 'Backend removed Successfully.'});
                            }, (error)=>{
                                this.selectedTierBackends = [];
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
                                    this.getTenantDetailsById(res.json().tenants);
                                    this.selectedTierTenants = [];
                                    this.showRightSidebar = true;
                                    this.msgs = [];
                                    this.msgs.push({severity: 'success', summary: 'Success', detail: 'Tenant removed Successfully.'});
                                }, (error)=>{
                                    this.selectedTierTenants = [];
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

                try {
                    switch (func) {
                        case "delete":

                            break;
                        case "removeBackend":
                            this.showTierDetails(this.currentTier);
                            break;
                        case "removeTenant":
                            this.showTierDetails(this.currentTier);
                            break;
                        default:
                            break;
                    }

                }
                catch (e) {
                    console.log(e);
                }
                finally {}
            }
        })
    }
}
