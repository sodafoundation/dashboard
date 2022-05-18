import { Component, OnInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { I18NService, Consts, ParamStorService } from 'app/shared/api';
import { Message } from '../../../components/common/api';

let _ = require("underscore");

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
})

export class LoginComponent implements OnInit {


    constructor(
        private http: Http,
        private el: ElementRef,
        private router: Router,
        private paramStor: ParamStorService,
        public I18N: I18NService,
    ) { }
    @Input() public isHomePage: any
    @Input() public menuItems: any
    @Input() public tourSteps: any
    @Input() public dropMenuItems: any
    @Input() public activeItem: any
    @Input() public hideLoginForm: any
    @Input() public showLogoutAnimation: any
    @Input() public showPrompt: any
    @Input() public isLogin: any
    @Input() public showLoginAnimation: any
    @Output() updateLogin = new EventEmitter<any>();
    username: string;
    password: string;
    minExpireTime = 2 * 60 * 1000;
    lastTime = new Date().getTime();
    servicePlanRouterLink = "/servicePlanManagement";
    menuItems_tenant = []
    menuItems_admin = []
    tourSteps_admin = []
    tourSteps_tenant = []
    projectItemId;
    userId;
    tenantItems = [];
    errorMsg: any
    showErrorMsg: any
    msgs: Message[];
    akSkRouterLink = "/akSkManagement";
    logoutLink = '/auth/logout'
    currentTenant: string = "";
    currentTime = new Date().getTime();
    defaultExpireTime = 10 * 60 * 1000;
    intervalRefreshToken: any;
    interval: any;
    advanceRefreshTime = 1 * 60 * 1000;
    onKeyDown(e) {
        let keycode = window.event ? e.keyCode : e.which;
        if (keycode == 13) {
            this.login();
        }
    }

    checkTimeOut() {
        this.currentTime = new Date().getTime(); //update current time
        let timeout = this.paramStor.TOKEN_PERIOD() ? this.paramStor.TOKEN_PERIOD() : this.defaultExpireTime;
        if (this.currentTime - this.lastTime > timeout) { //check time out
            this.router.navigate(['/auth/logout'])
        }
    }
    refreshLastTime() {
        this.lastTime = new Date().getTime();
    }
    /**
     * this function must be called after AuthWithTokenScoped succeed ,because it need username and password
     */
    refreshToken() {
        let request: any = { auth: {} };
        request.auth = {
            "identity": {
                "methods": [
                    "password"
                ],
                "password": {
                    "user": {
                        "name": this.paramStor.CURRENT_USER().split("|")[0],
                        "domain": {
                            "name": "Default"
                        },
                        "password": this.paramStor.PASSWORD()
                    }
                }
            }
        }

        this.http.post("/v3/auth/tokens", request).subscribe((res) => {
            let token_id = res.headers.get('x-subject-token');
            let projectName = this.paramStor.CURRENT_TENANT().split("|")[0];
            let req: any = { auth: {} };
            req.auth = {
                "identity": {
                    "methods": [
                        "token"
                    ],
                    "token": {
                        "id": token_id
                    }
                },
                "scope": {
                    "project": {
                        "name": projectName,
                        "domain": { "id": "default" }
                    }
                }
            }

            this.http.post("/v3/auth/tokens", req).subscribe((r) => {
                this.paramStor.AUTH_TOKEN(r.headers.get('x-subject-token'));
            }, (error) => {
                console.log("Something went wrong. Could not fetch token.", error);
            });
        },
            error => {
                console.log("Username or password incorrect.")
            });
    }

    AuthWithTokenScoped(user, tenant?) {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.lastTime = new Date().getTime();
        this.interval = window.setInterval(() => {
            this.checkTimeOut()
        }, 10000);
        // Get user owned tenants
        let reqUser: any = { params: {} };
        this.http.get("/v3/users/" + user.id + "/projects", reqUser).subscribe((objRES) => {
            let projects = objRES.json().projects;
            let defaultProject = user.name != 'admin' ? projects[0] : projects.filter((project) => { return project.name == 'admin' })[0];
            let project = tenant === undefined ? defaultProject : tenant;
            this.projectItemId = project.id;
            this.userId = user.id;
            this.tenantItems = [];
            window['userId'] = this.userId;
            window['projectItemId'] = this.projectItemId;
            this.paramStor.CURRENT_USERID(this.userId)
            this.paramStor.CURRENT_PROJECTITEMID(this.projectItemId)
            // Create the menu items for Swtich tenant.
            projects.map(item => {
                let tenantItemObj = {};
                tenantItemObj["label"] = item.name;
                tenantItemObj["command"] = () => {
                    let username = this.paramStor.CURRENT_USER().split("|")[0];
                    let userid = this.paramStor.CURRENT_USER().split("|")[1];
                    this.AuthWithTokenScoped({ 'name': username, 'id': userid }, item);
                    this.isHomePage = true;
                    this.msgs = [];
                    this.msgs.push({ severity: 'success', summary: 'Success', detail: 'Switched to tenant: ' + item.name });
                };
                this.tenantItems.push(tenantItemObj);
            })

            // Get token authentication with scoped
            let token_id = this.paramStor.AUTH_TOKEN();
            let req: any = { auth: {} };
            req.auth = {
                "identity": {
                    "methods": [
                        "token"
                    ],
                    "token": {
                        "id": token_id
                    }
                },
                "scope": {
                    "project": {
                        "name": project.name,
                        "domain": { "id": "default" }
                    }
                }
            }

            this.http.post("/v3/auth/tokens", req).subscribe((r) => {
                let scopedToken = r.json().token
                let roles = scopedToken['roles'];
                // Check if the user is admin and assign to a window variable
                window['isAdmin'] = (_.where(roles, { 'name': "admin" })).length > 0;

                // check if the user is a regular user of type Member and assign to window variable
                window['isUser'] = (_.where(roles, { 'name': "Member" })).length > 0;

                this.paramStor.AUTH_TOKEN(r.headers.get('x-subject-token'));
                this.paramStor.CURRENT_TENANT(project.name + "|" + project.id);
                this.paramStor.CURRENT_USER(user.name + "|" + user.id);
                window['isAdmin'] ? this.paramStor.CURRENT_ROLE('admin') : this.paramStor.CURRENT_ROLE('Member');
                this.username = this.paramStor.CURRENT_USER().split("|")[0];
                this.currentTenant = this.paramStor.CURRENT_TENANT().split("|")[0];

                if (window['isAdmin']) {
                    this.menuItems = this.menuItems_admin;
                    this.tourSteps = this.tourSteps_admin;
                    this.dropMenuItems = [
                        {
                            label: "Switch Region",
                            items: [{ label: "default_region", command: () => { } }]
                        }, {
                            label: "AK/SK Management",
                            routerLink: this.akSkRouterLink,
                            command: () => {
                                this.isHomePage = false;
                            }
                        },
                        {
                            label: "Logout",
                            routerLink: this.logoutLink,
                        }
                    ];

                    // Add link to service plan management in admin menu if servicePlansEnabled
                    if (window['servicePlansEnabled']) {
                        this.dropMenuItems.splice(2, 0, {
                            label: "Storage Service Plans",
                            routerLink: this.servicePlanRouterLink,
                            command: () => {
                                this.isHomePage = false;
                            }
                        })
                    }
                } else {
                    this.menuItems = this.menuItems_tenant;
                    this.tourSteps = this.tourSteps_tenant;
                    this.dropMenuItems = [
                        {
                            label: "Switch Region",
                            items: [{ label: "default_region", command: () => { } }]
                        },
                        {
                            label: "Switch Tenant",
                            items: this.tenantItems
                        },
                        {
                            label: "AK/SK Management",
                            routerLink: this.akSkRouterLink,
                            command: () => {
                                this.isHomePage = false;
                            }
                        },
                        {
                            label: "Logout",
                            routerLink: this.logoutLink,
                        }
                    ];
                }

                this.isLogin = true;

                this.router.navigateByUrl("/home");
                this.activeItem = this.menuItems[0];


                // annimation for after login
                this.showLoginAnimation = true;
                setTimeout(() => {
                    this.showLoginAnimation = false;
                    this.hideLoginForm = true;
                    this.updateLogin.emit({
                        isLogin: this.isLogin,
                        menuItems: this.menuItems,
                        dropMenuItems: this.dropMenuItems,
                        tenantItems: this.tenantItems,
                        tourSteps: this.tourSteps,
                        username: this.username,
                        hideLoginForm: this.isHomePage,
                        showLogoutAnimation: this.showLogoutAnimation,
                        showLoginAnimation: this.showLoginAnimation,
                        isHomePage: this.isHomePage
                    })
                }, 500);
                if (this.intervalRefreshToken) {
                    clearInterval(this.intervalRefreshToken);
                }
                let tokenPeriod = this.paramStor.TOKEN_PERIOD();
                let refreshTime = tokenPeriod ? (Number(tokenPeriod) - this.advanceRefreshTime) : this.defaultExpireTime;
                this.intervalRefreshToken = window.setInterval(() => {
                    this.refreshToken()
                }, refreshTime);
            })
        },
            (error) => {
                switch (Number(error.json().error.code)) {
                    case 401:
                        this.errorMsg = this.I18N.keyID['sds_login_error_msg_401'];
                        break;
                    case 503:
                        this.errorMsg = this.I18N.keyID['sds_login_error_msg_503'];
                        break;
                    default:
                        this.errorMsg = this.I18N.keyID['sds_login_error_msg_default'];
                }
                this.showErrorMsg = true;
                this.router.navigate(['/auth/logout'])
            })
    }
    login() {
        this.isHomePage = true;
        let request: any = { auth: {} };
        request.auth = {
            "identity": {
                "methods": [
                    "password"
                ],
                "password": {
                    "user": {
                        "name": this.username,
                        "domain": {
                            "name": "Default"
                        },
                        "password": this.password
                    }
                }
            }
        }

        this.http.post("/v3/auth/tokens", request).subscribe((res) => {
            //set token period start
            let token = res.json().token;
            let expires_at = token.expires_at;
            let issued_at = token.issued_at;
            let tokenPeriod = Date.parse(expires_at) - Date.parse(issued_at);
            if (tokenPeriod >= this.minExpireTime) {
                this.paramStor.TOKEN_PERIOD(tokenPeriod);
            }
            //set token period end
            this.paramStor.AUTH_TOKEN(res.headers.get('x-subject-token'));
            this.paramStor.PASSWORD(this.password);
            let user = res.json().token.user;
            this.AuthWithTokenScoped(user);
            this.showErrorMsg = false;
        },
            (error) => {
                console.log("Error logging in", error.json());
                switch (Number(error.json().error.code)) {
                    case 401:
                        this.errorMsg = this.I18N.keyID['sds_login_error_msg_401'];
                        break;
                    case 503:
                        this.errorMsg = this.I18N.keyID['sds_login_error_msg_503'];
                        break;
                    default:
                        this.errorMsg = this.I18N.keyID['sds_login_error_msg_default'];
                }
                this.showErrorMsg = true;
            });
    }
    ngOnInit() {

        this.menuItems_tenant = [
            {
                "title": "Home",
                "description": "Resource statistics",
                "routerLink": "/home",
                "joyrideStep" : "menuHome",
                "text" : "This page shows you the overall view of the backends available, volumes provisioned, buckets created and object storage migrations performed."
            },
            {
                "title": "Profile",
                "description": "Profiles",
                "routerLink": "/profile",
                "joyrideStep" : "menuProfile",
                "text" : "A profile is a set of configurations on service capabilities (including resource tuning, QoS) of storage resources. A profile must be specified when volume or fileshare is created."
            },
            {
                "title": "Resource Manager",
                "description": "Volumes / Buckets / File Share / Hosts",
                "routerLink": "/block",
                "joyrideStep" : "menuResource",
                "text" : "View and manage Buckets, Volumes, Volume Groups, File shares and Hosts that have been manually created or applied for through service templates.",
                "group" : true,
                "children" : [
                    {
                        "title" : "Buckets",
                        "routerLink": "/block"
                    },
                    {
                        "title" : "Volumes",
                        "routerLink": "/block/fromVolume"
                    },
                    {
                        "title" : "Volume Group",
                        "routerLink": "/block/fromGroup"
                    },
                    {
                        "title" : "File Share",
                        "routerLink": "/block/fromFileShare"
                    },
                    {
                        "title" : "Hosts",
                        "routerLink": "/block/fromHosts"
                    },
                ]
            },
            {
                "title": "Dataflow",
                "description": "Through migration / replication capability.",
                "routerLink": "/dataflow",
                "joyrideStep" : "menuDataflow",
                "text" : "Data flow through buckets by migration / replication."
            },
            {
                "title": "Services",
                "description": "Orchestration services.",
                "routerLink": "/services",
                "joyrideStep" : "menuServices",
                "text" : "This page demonstrates the Orchestration service that allows to Create and Manage Service Instances"
            }
        ]

        this.menuItems_admin = [
            {
                "title": "Home",
                "description": "Resource statistics",
                "routerLink": "/home",
                "joyrideStep" : "menuHome",
                "text" : "This page shows you the overall view of the backends available, volumes provisioned, buckets created and object storage migrations performed."
            },
            {
                "title": "Profile",
                "description": "Profiles",
                "routerLink": "/profile",
                "joyrideStep" : "menuProfile",
                "text" : "A profile is a set of configurations on service capabilities (including resource tuning, QoS) of storage resources. A profile must be specified when volume is created."
            },
            {
                "title": "Resource Manager",
                "description": "Volumes / Buckets / File Share / Hosts",
                "routerLink": "/block",
                "joyrideStep" : "menuResource",
                "text" : "View and manage Buckets, Volumes, Volume Groups, File shares and Hosts that have been manually created or applied for through service templates.",
                "group" : true,
                "children" : [
                    {
                        "title" : "Buckets",
                        "routerLink": "/block"
                    },
                    {
                        "title" : "Volumes",
                        "routerLink": "/block/fromVolume"
                    },
                    {
                        "title" : "Volume Group",
                        "routerLink": "/block/fromGroup"
                    },
                    {
                        "title" : "File Share",
                        "routerLink": "/block/fromFileShare"
                    },
                    {
                        "title" : "Hosts",
                        "routerLink": "/block/fromHosts"
                    },
                ]
            },
            {
                "title": "Dataflow",
                "description": "Through migration / replication capability.",
                "routerLink": "/dataflow",
                "joyrideStep" : "menuDataflow",
                "text" : "Data flow through buckets by migration / replication."
            },
            {
                "title": "Resource Monitor",
                "description": "SODA Storage Infrastructure Manager",
                "routerLink": "/resource-monitor",
                "joyrideStep" : "menuDelfin",
                "text" : "delfin is the SODA Infrastructure Manager project which provides unified, intelligent and scalable resource management, alert and performance monitoring",
                "group" : true,
                "children" : [
                    {
                        "title" : "Storage Summary",
                        "routerLink": "/resource-monitor"
                    },
                    {
                        "title" : "Performance Monitor",
                        "routerLink": "/performance-monitor"
                    },
                    {
                        "title" : "Alert Manager",
                        "is_external_link" : true,
                        "link" : "http://" +Consts.SODA_HOST_IP + ":" + Consts.SODA_ALERTMANAGER_PORT
                    },
                ]
            },
            {
                "title": "Services",
                "description": "Orchestration services.",
                "routerLink": "/services",
                "joyrideStep" : "menuServices",
                "text" : "This page demonstrates the Orchestration service that allows to Create and Manage Service Instances"
            },
            {
                "title": "Infrastructure",
                "description": "Regions, availability zones and storage",
                "routerLink": "/resource",
                "joyrideStep" : "menuInfrastructure",
                "text" : "A quick overview of the block, Object and File infrastructure."
            },
            {
                "title": "Identity",
                "description": "Managing tenants and users",
                "routerLink": "/identity",
                "joyrideStep" : "menuIdentity",
                "text" : "Managing Tenants and Users"
            }
        ];

        this.tourSteps_admin = [
            'homeWelcome',
            'homeUserProfile',
            'menuHome',
            'menuProfile',
            'menuResource',
            'menuDataflow',
            'menuDelfin',
            'menuServices',
            'menuInfrastructure',
            'menuIdentity',
            'homeResourceCard@/home',
            'homeDataflowCard@/home',
            'homeAddBackendBtn@/home',
            'homeAWSBackends@/home',
            'homeGCPBackends@/home',
            'homeHuaweiBackends@/home',
            'homeIBMBackends@/home',
            'homeAlibabaBackends@/home',
            'homeAzureBackends@/home',
            'homeAllBackends@/home'
        ],
        this.tourSteps_tenant = [
            'homeWelcome',
            'homeUserProfile',
            'menuHome',
            'menuProfile',
            'menuResource',
            'menuDataflow',
            'menuServices',
            'homeResourceCard@/home',
            'homeDataflowCard@/home',
            'homeAddBackendBtn@/home',
            'homeAWSBackends@/home',
            'homeGCPBackends@/home',
            'homeHuaweiBackends@/home',
            'homeIBMBackends@/home',
            'homeAlibabaBackends@/home',
            'homeAzureBackends@/home',
            'homeAllBackends@/home'
        ]
    }

}
