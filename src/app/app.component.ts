import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener, AfterViewInit } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { I18NService, Consts, ParamStorService, MsgBoxService } from 'app/shared/api';
import { I18nPluralPipe } from '@angular/common';
import { MenuItem, SelectItem} from './components/common/api';

let d3 = window["d3"];
declare let X2JS: any;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    providers: [MsgBoxService],
    styleUrls: []
})
export class AppComponent implements OnInit, AfterViewInit {
    chromeBrowser: boolean = false;

    isLogin: boolean;

    hideLoginForm: boolean = false;

    linkUrl = "";

    username: string;

    password: string;

    dropMenuItems: MenuItem[];

    currentTenant: string = "";

    isHomePage: boolean = true;

    showLoginAnimation: boolean = false;

    showLogoutAnimation: boolean = false;
    currentTime = new Date().getTime();
    lastTime = new Date().getTime();
    minExpireTime = 2 * 60 * 1000;
    advanceRefreshTime = 1 * 60 * 1000;
    defaultExpireTime = 10 * 60 * 1000;
    interval: any;
    intervalRefreshToken: any;
    showErrorMsg: boolean = false;
    errorMsg: string = "";

    tenantItems = [];

    menuItems = [];
    showPrompt = false;

    menuItems_tenant = [
        {
            "title": "Home",
            "description": "Resource statistics",
            "routerLink": "/home"
        },
        {
            "title": "Resource",
            "description": "Volumes / Buckets",
            "routerLink": "/block"
        },
        {
            "title": "Dataflow",
            "description": "Through migration / replication capability.",
            "routerLink": "/dataflow"
        }
    ]

    menuItems_admin = [
        {
            "title": "Home",
            "description": "Resource statistics",
            "routerLink": "/home"
        },
        {
            "title": "Resource",
            "description": "Volumes / Buckets",
            "routerLink": "/block"
        },
        {
            "title": "Dataflow",
            "description": "Through migration / replication capability.",
            "routerLink": "/dataflow"
        },
        {
            "title": "Profile",
            "description": "Block profiles",
            "routerLink": "/profile"
        },
        {
            "title": "Infrastructure",
            "description": "Regions, availability zones and storage",
            "routerLink": "/resource"
        },
        {
            "title": "Identity",
            "description": "Managing tenants and users",
            "routerLink": "/identity"
        }
    ];

    activeItem: any;

    private msgs: any = [{ severity: 'warn', summary: 'Warn Message', detail: 'There are unsaved changes' }];

    constructor(
        private el: ElementRef,
        private viewContainerRef: ViewContainerRef,
        private http: Http,
        private router: Router,
        private paramStor: ParamStorService,
        private msg: MsgBoxService,
        public I18N: I18NService
    ) { }

    // Wave params
    svg_height = 150;
    svg_width = 2000;
    wave_data = [[], []];
    area = d3.area().y0(this.svg_height).curve(d3.curveBasis);
    svg_paths = [];
    max = 800;  // Speed
    d;

    ngOnInit() {
        // Global upload function
        window['uploadPartArr'] = [];
        window['isUpload'] = false;
        let uploadNum = 0;
        window['startUpload'] = (selectFile, bucketId, options, cb) => {
            window['isUpload'] = true;
            this.showPrompt =  true;
            if (selectFile['size'] > Consts.BYTES_PER_CHUNK) {
                //first step get uploadId
                this.http.put('/v1/s3/'+ bucketId + '/' + selectFile.name + "?uploads", '', options).subscribe((res) => {
                    let str = res['_body'];
                    let x2js = new X2JS();
                    let jsonObj = x2js.xml_str2json(str);
                    let uploadId = jsonObj.InitiateMultipartUploadResult.UploadId;
                    // second step part upload
                    
                    window['uploadPart'](selectFile, uploadId, bucketId, options, cb);
                });
            } else {
                window['singleUpload'](selectFile, bucketId, options, cb);
            }
        }
        window['singleUpload'] = (selectFile, bucketId, options, cb) => {
            this.http.put('/v1/s3/'+ bucketId + '/' + selectFile.name, selectFile, options).subscribe((res) => {
                this.showPrompt = false;
                window['isUpload'] = false;
                this.msg.success("Upload file ["+ selectFile.name +"] successfully.");
                if (cb) {
                    cb();
                }
                uploadNum = 0;
            },
            (error)=>{
                this.showPrompt = false;
                if(uploadNum < 5){
                    window['singleUpload'](selectFile, bucketId, options, cb);
                    uploadNum++;
                }else{
                    uploadNum = 0;
                    console.log('error');
                    window['isUpload'] = false;
                    this.msg.error("Upload failed. The network may be unstable. Please try again later.");
                    if (cb) {
                        cb();
                    }
                }
                
            });
        }
        window['uploadPart'] = (selectFile, uploadId, bucketId, options, cb) => {
            let totalSlices;
            let start = 0;
            let end;
            let index = 0;
            totalSlices = Math.ceil(selectFile['size'] / Consts.BYTES_PER_CHUNK);
            let proArr = [];
            while (start < selectFile['size']) {
                end = start + Consts.BYTES_PER_CHUNK;
                if (end > selectFile['size']) {
                    end = selectFile['size'];
                }

                proArr.push({ 'index': index, 'start': start, 'end': end });
                start = end;
                index++;
            }

            window['uploadPartArr'] = [];
            window['segmentUpload'](0, proArr, selectFile, uploadId, options, bucketId, cb);
        }
        window['segmentUpload'] = (i, chunks, blob, uploadId, options, bucketId, cb) => {
            let chunk;
            chunk = blob.slice(chunks[i].start, chunks[i].end);

            this.http.put('/v1/s3/' + bucketId + '/' + blob.name + '?partNumber=' + (i + 1) + '&uploadId=' + uploadId, chunk, options).subscribe((data) => {
                this.showPrompt = false;
                let x2js = new X2JS();
                let jsonObj = x2js.xml_str2json(data['_body']);
                window['uploadPartArr'].push(jsonObj);
                uploadNum = 0;
                if (i < (chunks.length - 1)) {
                    window['segmentUpload'](i + 1, chunks, blob, uploadId, options, bucketId, cb);
                } else {
                    let marltipart = '<CompleteMultipartUpload>';
                    window['uploadPartArr'].forEach(item => {
                        marltipart += `<Part>
                        <PartNumber>${item.UploadPartResult.PartNumber}</PartNumber>
                        <ETag>${item.UploadPartResult.ETag}</ETag>
                        </Part>`
                    });
                    marltipart += '</CompleteMultipartUpload>';
                    window['CompleteMultipartUpload'](bucketId, blob, uploadId, marltipart, options, cb);
                }
            },
            (error)=>{
                this.showPrompt = false;
                if(uploadNum < 5){
                    window['segmentUpload'](i, chunks, blob, uploadId, options, bucketId, cb);
                    uploadNum++;
                }else{
                    uploadNum = 0;
                    window['isUpload'] = false;
                    this.msg.error("Upload failed. The network may be unstable. Please try again later.");
                    if (cb) {
                        cb();
                    }
                }
                
            });
        }
        window['CompleteMultipartUpload'] = (bucketId, blob, uploadId, marltipart, options, cb) => {
            this.http.put('/v1/s3/' + bucketId + '/' + blob.name + '?uploadId=' + uploadId, marltipart, options).subscribe((res) => {
                window['isUpload'] = false;
                this.msg.success("Upload file ["+ blob.name +"] successfully.");
                if (cb) {
                    cb();
                }
            },
            error =>{
                if(uploadNum < 5){
                    window['CompleteMultipartUpload'](bucketId, blob, uploadId, marltipart, options, cb);
                    uploadNum++;
                }else{
                    uploadNum = 0; 
                }
            });
        }
        // Global upload end

        let currentUserInfo = this.paramStor.CURRENT_USER();
        if (currentUserInfo != undefined && currentUserInfo != "") {
            this.hideLoginForm = true;

            let [username, userid, tenantname, tenantid] = [
                this.paramStor.CURRENT_USER().split("|")[0],
                this.paramStor.CURRENT_USER().split("|")[1],
                this.paramStor.CURRENT_TENANT().split("|")[0],
                this.paramStor.CURRENT_TENANT().split("|")[1]];
            this.AuthWithTokenScoped({ 'name': username, 'id': userid });
        } else {
            this.isLogin = false;
            this.hideLoginForm = false;
        }

        // Wave animation
        for (var i = 0; i < this.max; i++) {
            var r = i / this.max * 4;
            this.wave_data[0].push(r * 1.5);   //wave1
            this.wave_data[1].push(r + 1);   //wave2（+1 offset π）
        }
        this.d = this.svg_width / (this.wave_data[0].length - 1);
        this.svg_paths.push(d3.select('#svg_wave_1'));
        this.svg_paths.push(d3.select('#svg_wave_2'));

        this.renderWave();
    }
    checkTimeOut() {
        this.currentTime = new Date().getTime(); //update current time
        let timeout = this.paramStor.TOKEN_PERIOD() ? this.paramStor.TOKEN_PERIOD() : this.defaultExpireTime;
        if (this.currentTime - this.lastTime > timeout) { //check time out
            this.logout();
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
            });
        },
            error => {
                console.log("Username or password incorrect.")
            });
    }
    ngAfterViewInit() {
        this.loginBgAnimation();
    }

    loginBgAnimation() {
        let obj = this.el.nativeElement.querySelector(".login-bg");
        if (obj) {
            let obj_w = obj.clientWidth;
            let obj_h = obj.clientHeight;
            let dis = 50;
            obj.addEventListener("mousemove", (e) => {
                let MX = e.clientX;
                let MY = e.clientY;
                let offsetX = (obj_w - 2258) * 0.5 + (obj_w - MX) * dis / obj_w;
                let offsetY = (obj_h - 1363) * 0.5 + (obj_h - MY) * dis / obj_h;
                obj.style.backgroundPositionX = offsetX + "px";
                obj.style.backgroundPositionY = offsetY + "px";
            })
        }
    }

    login() {
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
            error => {
                switch (error.status) {
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

            this.tenantItems = [];
            projects.map(item => {
                let tenantItemObj = {};
                tenantItemObj["label"] = item.name;
                tenantItemObj["command"] = () => {
                    let username = this.paramStor.CURRENT_USER().split("|")[0];
                    let userid = this.paramStor.CURRENT_USER().split("|")[1];
                    this.AuthWithTokenScoped({ 'name': username, 'id': userid }, item);
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
                this.paramStor.AUTH_TOKEN(r.headers.get('x-subject-token'));
                this.paramStor.CURRENT_TENANT(project.name + "|" + project.id);
                this.paramStor.CURRENT_USER(user.name + "|" + user.id);

                this.username = this.paramStor.CURRENT_USER().split("|")[0];
                this.currentTenant = this.paramStor.CURRENT_TENANT().split("|")[0];

                if (this.username == "admin") {
                    this.menuItems = this.menuItems_admin;
                    this.dropMenuItems = [
                        {
                            label: "Switch Region",
                            items: [{ label: "default_region", command: () => { } }]
                        },
                        {
                            label: "Logout",
                            command: () => { this.logout() }
                        }
                    ];
                } else {
                    this.menuItems = this.menuItems_tenant;
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
                            label: "Logout",
                            command: () => { this.logout() }
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
            error => {
                this.logout();
            })
    }

    logout() {
        this.paramStor.AUTH_TOKEN("");
        this.paramStor.CURRENT_USER("");
        this.paramStor.CURRENT_TENANT("");
        this.paramStor.PASSWORD("");
        this.paramStor.TOKEN_PERIOD("");
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (this.intervalRefreshToken) {
            clearInterval(this.intervalRefreshToken);
        }
        // annimation for after logout
        this.hideLoginForm = false;
        this.showLogoutAnimation = true;
        setTimeout(() => {
            this.showLogoutAnimation = false;
            this.username = "";
            this.password = "";
            this.isLogin = false;
        }, 500);

    }

    onKeyDown(e) {
        let keycode = window.event ? e.keyCode : e.which;
        if (keycode == 13) {
            this.login();
        }
    }

    menuItemClick(event, item) {
        this.activeItem = item;
        if (item.routerLink == "/home") {
            this.isHomePage = true;
        } else {
            this.isHomePage = false;
        }
    }

    supportCurrentBrowser() {
        let ie,
            firefox,
            safari,
            chrome,
            cIE = 11,
            cFirefox = 40,
            cChrome = 40;
        let ua = navigator.userAgent.toLowerCase();
        let isLinux = (ua.indexOf('linux') >= 0);

        if (this.isIE()) {
            if (ua.indexOf('msie') >= 0) {
                ie = this.getSys(ua.match(/msie ([\d]+)/));
            } else {
                ie = this.getSys(ua.match(/trident.*rv:([\d]+)/));
            }
        } else if (navigator.userAgent.indexOf("Firefox") > 0) {
            firefox = this.getSys(ua.match(/firefox\/([\d]+)/));
        } else if (ua.indexOf("safari") != -1 && !(ua.indexOf("chrome") != -1)) {
            safari = this.getSys(ua.match(/version\/([\d]+)/));
        } else if (ua.indexOf("chrome") != -1) {
            chrome = this.getSys(ua.match(/chrome\/([\d]+)/));
        }

        if ((firefox) / 1 < cFirefox || (chrome) / 1 < cChrome || (ie) / 1 < cIE) {
            return true;
        }

        return false;
    }

    isIE() {
        return navigator.userAgent.toLowerCase().indexOf('trident') >= 0;
    }

    getSys(browserVersionArr) {
        if (!browserVersionArr) {
            return 0;
        } else if (browserVersionArr.length < 2) {
            return 0;
        } else {
            return browserVersionArr[1];
        }
    }

    area_generator(data) {
        let that = this;
        var wave_height = 0.45;
        var area_data = data.map(function (y, i) {
            return [i * that.d, that.svg_height * (1 - (wave_height * Math.sin(y * Math.PI) + 2) / 3)];
        });
        return function () {
            return that.area(area_data);
        };
    }
    renderWave() {
        let that = this;
        this.svg_paths.forEach(function (svg_path, i) {
            svg_path.attr('d', that.area_generator(that.wave_data[i]));
            that.wave_data[i] = that.getNextData(that.wave_data[i]);
        });

        setTimeout(function () {
            that.renderWave();
        }, 1000 / 60);
    }
    getNextData(data) {
        var r = data.slice(1);
        r.push(data[0]);
        return r;
    }

}
