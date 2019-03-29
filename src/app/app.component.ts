import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener, AfterViewInit } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { I18NService, Consts, ParamStorService, MsgBoxService, Utils } from 'app/shared/api';
import { I18nPluralPipe } from '@angular/common';
import { MenuItem, SelectItem} from './components/common/api';
import { akSkService } from './business/ak-sk/ak-sk.service';

let d3 = window["d3"];
declare let X2JS: any;
let CryptoJS = require("crypto-js");

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    providers: [MsgBoxService, akSkService],
    styleUrls: []
})
export class AppComponent implements OnInit, AfterViewInit {
    selectFileName: string;
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
    showPrompt = false;
    fileName: string = "";

    tenantItems = [];
    projectItemId;
    userId;
    SignatureKey = {};
    akSkRouterLink = "/akSkManagement/";
    Signature = "";
    kDate = "";
    stringToSign = "";
    canonicalString = "";

    menuItems = [];

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
        private akSkService: akSkService,
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
        window['startUpload'] = (selectFile, bucketId, options,folderId, cb) => {
            window['isUpload'] = true;
            this.showPrompt =  true;
            if(folderId !=""){
                this.selectFileName= folderId + selectFile.name;
            }else{
                this.selectFileName = selectFile.name 
            }
            this.fileName = selectFile.name;
            let uploadUrl = 'v1/s3/'+ bucketId + '/' + this.selectFileName;
            if (selectFile['size'] > Consts.BYTES_PER_CHUNK) {
                //first step get uploadId
                window['getAkSkList'](()=>{
                    let requestMethod = "PUT";
                    let url = uploadUrl + "?uploads";
                    window['canonicalString'](requestMethod, url,()=>{
                        this.getSignature();
                        options.headers.set('Authorization', this.Signature);
                        options.headers.set('X-Auth-Date', this.kDate);
                        this.http.put( '/' + uploadUrl + "?uploads", '', options).subscribe((res) => {
                            let str = res['_body'];
                            let x2js = new X2JS();
                            let jsonObj = x2js.xml_str2json(str);
                            let uploadId = jsonObj.InitiateMultipartUploadResult.UploadId;
                            // second step part upload
                            window['uploadPart'](selectFile, uploadId, bucketId, options, cb);
                        },
                        (error)=>{
                            if(uploadNum < 5){
                                window['startUpload'] (selectFile, bucketId, options,folderId, cb);
                                uploadNum++;
                            }else{
                                uploadNum = 0;
                                this.showPrompt = false;
                                window['isUpload'] = false;
                                this.msg.error("Upload failed. The network may be unstable. Please try again later.");
                                if (cb) {
                                    cb();
                                }
                            }
                        });  
                    })
                })
            } else {
                window['singleUpload'](selectFile, bucketId, options, uploadUrl, cb);
            }
        }
        window['singleUpload'] = (selectFile, bucketId, options, uploadUrl, cb) => {
            window['getAkSkList'](()=>{
                let requestMethod = "PUT";
                let url = uploadUrl;
                window['canonicalString'](requestMethod, url,()=>{
                    this.getSignature();
                    options.headers.set('Authorization', this.Signature);
                    options.headers.set('X-Auth-Date', this.kDate);
                    this.http.put("/" + uploadUrl, selectFile, options).subscribe((res) => {
                        this.showPrompt = false;
                        window['isUpload'] = false;
                        this.msg.success("Upload file ["+ selectFile.name +"] successfully.");
                        if (cb) {
                            cb();
                        }
                        uploadNum = 0;
                    },
                    (error)=>{
                        if(uploadNum < 5){
                            window['singleUpload'](selectFile, bucketId, options, cb);
                            uploadNum++;
                        }else{
                            this.showPrompt = false;
                            uploadNum = 0;
                            console.log('error');
                            window['isUpload'] = false;
                            this.msg.error("Upload failed. The network may be unstable. Please try again later.");
                            if (cb) {
                                cb();
                            }
                        }
                        
                    });
                })
            })
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
            let chunk = blob.slice(chunks[i].start, chunks[i].end);
            let uploadUrl = 'v1/s3/'+ bucketId + '/' + this.selectFileName;
            window['getAkSkList'](()=>{
                let requestMethod = "PUT";
                let url = uploadUrl + '?partNumber=' + (i + 1) + '&uploadId=' + uploadId;
                window['canonicalString'](requestMethod, url,()=>{
                    this.getSignature();
                    options.headers.set('Authorization', this.Signature);
                    options.headers.set('X-Auth-Date', this.kDate);
                    this.http.put("/"+ uploadUrl + '?partNumber=' + (i + 1) + '&uploadId=' + uploadId, chunk, options).subscribe((data) => {
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
                        if(uploadNum < 5){
                            window['segmentUpload'](i, chunks, blob, uploadId, options, bucketId, cb);
                            uploadNum++;
                        }else{
                            this.showPrompt = false;
                            uploadNum = 0;
                            window['isUpload'] = false;
                            window['getAkSkList'](()=>{
                                let requestMethod = "DELETE";
                                let url = uploadUrl + '?uploadId=' + uploadId;
                                window['canonicalString'](requestMethod, url,()=>{
                                    this.http.delete("/" + uploadUrl + "?uploadId=" + uploadId, options).subscribe((data)=>{});
                                    this.msg.error("Upload failed. The network may be unstable. Please try again later.");
                                    if (cb) {
                                        cb();
                                    }
                                })
                            })
                        } 
                    });
                })
            })
        }
        window['CompleteMultipartUpload'] = (bucketId, blob, uploadId, marltipart, options, cb) => {
            let uploadUrl = 'v1/s3/'+ bucketId + '/' + this.selectFileName;
            window['getAkSkList'](()=>{
                let requestMethod = "PUT";
                let url = uploadUrl + '?uploadId=' + uploadId;
                window['canonicalString'](requestMethod, url,()=>{
                    this.getSignature();
                    options.headers.set('Authorization', this.Signature);
                    options.headers.set('X-Auth-Date', this.kDate);
                    this.http.put("/" + uploadUrl + '?uploadId=' + uploadId, marltipart, options).subscribe((res) => {
                        this.showPrompt = false;
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
                            this.showPrompt = false;
                            uploadNum = 0;
                            window['getAkSkList'](()=>{
                                let requestMethod = "DELETE";
                                let url = uploadUrl + '?uploadId=' + uploadId;
                                window['canonicalString'](requestMethod, url,()=>{
                                    this.getSignature();
                                    options.headers.set('Authorization', this.Signature);
                                    options.headers.set('X-Auth-Date', this.kDate);
                                    this.http.delete("/" + uploadUrl + "?uploadId=" + uploadId, options).subscribe((data)=>{});
                                })
                            })
                        }
                    });
                })
            })
            
        }
        // Global upload end

        //Query the AK/SK list
        window['getAkSkList'] = (cb)=>{
            let request: any = { params:{} };
            request.params = {
                "userId":this.userId,
                "type":"ec2"
            }
            let options = {
                headers: {
                    'X-Auth-Token': localStorage['auth-token']
                } 
            }
            this.akSkService.getAkSkList(request,options).subscribe(res=>{
                let response = res.json();
                let detailArr = [];
                response.credentials.forEach(item=>{
                    let accessKey = JSON.parse(item.blob);
                    detailArr.push(accessKey);
                })
                window['getParameters'](detailArr);
                if (cb) {
                    cb();
                }
            })
        }
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
        
        window['getParameters'] = (detailArr)=>{
            this.SignatureKey = [];
            let secretAccessKey = detailArr[Math.round(Math.random()*(detailArr.length-1))];
            this.SignatureKey['secretAccessKey'] = secretAccessKey.secret;
            //System time is converted to UTC time
            let offset = new Date().getTimezoneOffset()*60000;
            let local = new Date().getTime();
            let utc = local + offset;
            let utcTime = Utils.formatDate(utc);
            this.SignatureKey['dateStamp'] = utcTime.substr(0,4) + utcTime.substr(5,2) + utcTime.substr(8,2) + 'T' + utcTime.substr(11,2) + utcTime.substr(14,2)+
            utcTime.substr(17,2) + 'Z';
            this.SignatureKey['dayDate'] = utcTime.substr(0,4) + utcTime.substr(5,2) + utcTime.substr(8,2);
            this.SignatureKey['regionName'] = "default_region";
            this.SignatureKey['serviceName'] = "s3";
            this.SignatureKey['AccessKey'] = secretAccessKey.access;
        }
        //Calculation of the signature
        window['getSignatureKey'] = ()=>{
            let SignatureObject = {};
            SignatureObject['kSigning'] = window['getkSigning'](this.SignatureKey['secretAccessKey'],this.SignatureKey['dayDate'],this.SignatureKey['regionName'],this.SignatureKey['serviceName'],this.SignatureKey['dateStamp']);
            SignatureObject['SignatureKey'] = this.SignatureKey;
            return SignatureObject;
        }
        window['getkSigning'] = (key, dayDate, regionName, serviceName, dateStamp)=>{
            let kDate = CryptoJS.HmacSHA256(dayDate, "OPENSDS" + key);
            let kRegion = CryptoJS.HmacSHA256(regionName, kDate);
            let kService = CryptoJS.HmacSHA256(serviceName, kRegion);
            let signRequest = CryptoJS.HmacSHA256("sign_request", kService);
            let kSigning = CryptoJS.HmacSHA256(this.stringToSign, signRequest);
            return kSigning;
        }
        window['buildStringToSign'] = ()=>{
            let authHeaderPrefix = "OPENSDS-HMAC-SHA256";
            let requestDateTime = this.SignatureKey['dateStamp'];
            let credentialString = this.SignatureKey['AccessKey'] + "/" + 
            this.SignatureKey['dayDate'] + "/" + this.SignatureKey['regionName'] + "/" + this.SignatureKey['serviceName'] + "/" + "sign_request";
            let canonical = CryptoJS.SHA256(this.canonicalString);
            this.stringToSign = authHeaderPrefix + "\n" + requestDateTime + "\n" + credentialString + "\n" + canonical;
        }
        window['canonicalString'] = (requestMethod, url,cb)=>{
            let body ="";
            let canonicalHeaders = "x-auth-date:" + this.SignatureKey['dateStamp'] + "\n";
            let signedHeaders = "x-auth-date";
            let hash = CryptoJS.SHA256(body);
            let rawQuery = "";
            if(url.indexOf("?") !=-1){
                let index = url.indexOf("?");
                let query = url.substring(index+1,url.length);
                url = url.substring(0,index);
                rawQuery = window['parameter'](query,rawQuery)
            }
            url = encodeURI(url);
            this.canonicalString = requestMethod + "\n" + "/" + url + "" + "\n" + rawQuery + "\n" + canonicalHeaders + "\n" + signedHeaders + "\n" + hash;
            window['buildStringToSign']();
            if (cb) {
                cb();
            }
        }
        //Canonical url parameter
        window['parameter'] = (param,rawQuery)=>{
           if(param.indexOf("&") != -1){
                let paramArray = param.split("&").sort();
                paramArray.map((item,index)=>{
                    if(item.indexOf("=") ==-1){
                        item += "=";
                    }
                    if(index < paramArray.length-1){
                        item += "&";
                    }
                    rawQuery += item;
                })
            }else if(param.indexOf("=") != -1){
                rawQuery = param;
            }else{
                rawQuery = param.replace(/\s/g,'%20') + "=";
            }
            return rawQuery;
        }
    }

    //Request header with AK/SK authentication added
    getSignature(){
        let SignatureObjectwindow = window['getSignatureKey']();
        let kAccessKey = SignatureObjectwindow.SignatureKey.AccessKey;
        this.kDate = SignatureObjectwindow.SignatureKey.dateStamp;
        let kRegion = SignatureObjectwindow.SignatureKey.regionName;
        let kService = SignatureObjectwindow.SignatureKey.serviceName;
        let kSigning = SignatureObjectwindow.kSigning;
        let Credential = kAccessKey + '/' + this.kDate.substr(0,8) + '/' + kRegion + '/' + kService + '/' + 'sign_request';
        this.Signature = 'OPENSDS-HMAC-SHA256' + ' Credential=' + Credential + ',SignedHeaders=host;x-auth-date' + ",Signature=" + kSigning;
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
            this.projectItemId = project.id;
            this.userId = user.id;
            this.tenantItems = [];
            this.akSkRouterLink = "/akSkManagement/";
            this.akSkRouterLink += this.userId + "/" + this.projectItemId;
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
                        },{
                            label: "AK/SK Management",
                            routerLink: this.akSkRouterLink,
                            command: ()=>{
                                this.isHomePage = false;
                            }
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
                            label: "AK/SK Management",
                            routerLink: this.akSkRouterLink,
                            command: ()=>{
                                this.isHomePage = false;
                            }
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
