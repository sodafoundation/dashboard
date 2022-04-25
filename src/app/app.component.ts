import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener,AfterViewInit } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Router } from '@angular/router';
import { I18NService, Consts, ParamStorService, MsgBoxService, Utils, HttpService } from 'app/shared/api';
import { Button } from 'app/components/button/button';
import { I18nPluralPipe } from '@angular/common';
import { MenuItem, ConfirmationService, SelectItem, Message} from './components/common/api';
import { akSkService } from './business/ak-sk/ak-sk.service';
import { BucketService } from './business/block/buckets.service';
import * as aws4 from "ngx-aws4";
import { JoyrideService } from 'ngx-joyride';

let d3 = window["d3"];
declare let X2JS: any;
let CryptoJS = require("crypto-js");
let _ = require("underscore");

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    providers: [MsgBoxService, akSkService, ConfirmationService],
    styleUrls: []
})
export class AppComponent implements OnInit,AfterViewInit {
    servicePlansEnabled: boolean = Consts.STORAGE_SERVICE_PLAN_ENABLED;
    selectFileName: string;

    progressValue: number = 0;
    downloadProgressValue: number = 0;

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
    showMenu: boolean = false
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
    downLoadArr = [];
    tenantItems = [];
    projectItemId;
    userId;
    SignatureKey = {};

    Signature = "";
    kDate = "";
    stringToSign = "";
    canonicalString = "";

    menuItems = Consts.menuItems;
    tourSteps = [];

    msgs: Message[];


    activeItem: any;

    constructor(
        private el: ElementRef,
        private viewContainerRef: ViewContainerRef,
        private http: Http,
        private httpSvc: HttpService,
        private router: Router,
        private paramStor: ParamStorService,
        private msg: MsgBoxService,
        private akSkService: akSkService,
        private confirmationService: ConfirmationService,
        public I18N: I18NService,
        private BucketService: BucketService,
        private readonly joyrideService: JoyrideService
    ) {
        window['akskWarning'] = false;
        window['servicePlansEnabled'] = Consts.STORAGE_SERVICE_PLAN_ENABLED;
    }

    // Wave params
    svg_height = 150;
    svg_width = 2000;
    wave_data = [[], []];
    area = d3.area().y0(this.svg_height).curve(d3.curveBasis);
    svg_paths = [];
    max = 800;  // Speed
    d;

    ngOnInit() {
        if (this.paramStor.AUTH_TOKEN() && this.paramStor.CURRENT_USER() &&
        this.paramStor.CURRENT_TENANT() && this.paramStor.PASSWORD() && this.paramStor.TOKEN_PERIOD()){
            this.isLogin = true
            this.hideLoginForm = true
            this.showMenu = true
            let userItems = JSON.parse(this.paramStor.getParam('userItems'))
            this.menuItems = userItems.menuItems
            this.username = userItems.userName
            this.dropMenuItems = userItems.dropMenuItems
            this.tenantItems = userItems.tenantItems
            this.tourSteps = userItems.tourSteps
            window['isAdmin'] = (_.where(JSON.parse(this.paramStor.getParam('roles')), {'name': "admin"})).length > 0;
            window['isUser'] = (_.where(JSON.parse(this.paramStor.getParam('roles')), {'name': "Member"})).length > 0;
            if (window.location.href.includes( '/home')){
                this.isHomePage = true
            } else {
                this.isHomePage = false
            }
        }
        else{
            this.isLogin = false
            if (window.location.href.includes( '/home')){
                this.isHomePage = true
                this.router.navigate(['/home'])
            }else{
                this.isHomePage = false
            }
            this.hideLoginForm = false
        }
        window.onbeforeunload = ()=>{
            window.sessionStorage['folderId'] = ""
            window.sessionStorage['headerTag'] = ""
        }

        // Global upload function
        window['uploadPartArr'] = [];
        window['isUpload'] = false;
        let uploadNum = 0;
        window['load'] = (file,id) => {
            this.downLoadArr.push({
                'name':file,
                'id': id
            })
        }
        window['disload'] = (file,id) =>{
            this.downLoadArr = this.downLoadArr.filter((item)=>{
                return item.id != id
            })
        }
        this.downloadProgressValue = 0;
        window['downloadProgress'] = (value) =>{
            this.downloadProgressValue = value;
        }
        window['startUpload'] = (selectFile, bucketId, uploadOptions,folderId, cb) => {
            window['isUpload'] = true;
            this.showPrompt =  true;
            if(folderId !== null && folderId !== ""){
                this.selectFileName= folderId + selectFile.name;
            }else{
                this.selectFileName = selectFile.name
            }
            this.fileName = selectFile.name;
            let uploadUrl = this.BucketService.url + bucketId + '/' + this.selectFileName;
            if (selectFile['size'] > Consts.BYTES_PER_CHUNK) {
                //first step get uploadId
                window['getAkSkList'](()=>{
                    let requestMethod = "POST";
                    let url = '/' + bucketId + '/' + this.selectFileName + '?uploads';
                    let requestOptions: any;
                    let options: any = {};
                    let contentHeaders = {
                        'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD'
                    };
                    if(uploadOptions['headers'] && uploadOptions['headers']['X-Amz-Storage-Class']){
                        contentHeaders['X-Amz-Storage-Class'] = uploadOptions['headers']['X-Amz-Storage-Class'];
                    }
                    requestOptions = window['getSignatureKey'](requestMethod, url, '', '', '', '', '', '', contentHeaders) ;
                    options['headers'] = new Headers();
                    options = this.BucketService.getSignatureOptions(requestOptions, options);
                    this.httpSvc.post( uploadUrl + '?uploads', '', options).subscribe((res) => {
                        let str = res['_body'];
                        let x2js = new X2JS();
                        let jsonObj = x2js.xml_str2json(str);
                        let uploadId = jsonObj.InitiateMultipartUploadResult.UploadId;
                        // second step part upload
                        window['uploadPart'](selectFile, uploadId, bucketId, options, cb);
                    },(error)=>{
                        if(uploadNum < 5){
                            window['startUpload'] (selectFile, bucketId, options,folderId, cb);
                            uploadNum++;
                        } else{
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
            } else {
                window['singleUpload'](selectFile, bucketId, uploadOptions, uploadUrl, cb);
            }
        }

        window['singleUpload'] = (selectFile, bucketId, uploadOptions, uploadUrl, cb) => {
            let fileString: any;
            let fileContent: any;
            window['getAkSkList'](()=>{
                let requestMethod = "PUT";
                let url = '/'+ bucketId + '/' + this.selectFileName;
                let requestOptions: any;
                let options: any = {};
                const reader = new FileReader();
                reader.readAsArrayBuffer(selectFile);
                reader.onloadend = (e) => {
                    let self = this;
                    fileContent = reader.result;
                    let contentHeaders = {
                        'Content-Type' : selectFile.type,
                        'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD'
                    };
                    if(uploadOptions['headers'] && uploadOptions['headers'].get('X-Amz-Storage-Class')){
                        contentHeaders['X-Amz-Storage-Class'] = uploadOptions['headers'].get('X-Amz-Storage-Class');
                    }
                    requestOptions = window['getSignatureKey'](requestMethod, url, '', '', '', '', '', '', contentHeaders) ;
                    options['headers'] = new Headers();
                    options = this.BucketService.getSignatureOptions(requestOptions, options);
                    /* XHR Send */
                    var xhr = new XMLHttpRequest();
                    xhr.withCredentials = true;
                    xhr.open('PUT', uploadUrl, true);

                    xhr.setRequestHeader('Content-Type', requestOptions.headers['Content-Type']);
                    xhr.setRequestHeader('X-Auth-Token', requestOptions.headers['X-Auth-Token']);
                    xhr.setRequestHeader('X-Amz-Content-Sha256', requestOptions.headers['X-Amz-Content-Sha256']);
                    xhr.setRequestHeader('X-Amz-Date', requestOptions.headers['X-Amz-Date']);
                    xhr.setRequestHeader('Authorization', requestOptions.headers['Authorization']);
                    if(requestOptions.headers['X-Amz-Storage-Class']){
                        xhr.setRequestHeader('X-Amz-Storage-Class', requestOptions.headers['X-Amz-Storage-Class']);
                    }
                    xhr.onload = function () {
                        if(xhr.status == 200) {
                            self.showPrompt = false;
                            window['isUpload'] = false;
                            self.msg.success("Upload file ["+ selectFile.name +"] successfully.");
                            if(requestOptions.headers['X-Amz-Storage-Class']){
                                self.msg.success("File ["+ selectFile.name +"] successfully archived.");
                            }
                            if (cb) {
                                cb();
                            }
                            uploadNum = 0;
                            self.progressValue = 0;
                        } else {
                            let errMessage = {
                                header: '',
                                content: ''
                            };
                            self.showPrompt = false;
                            uploadNum = 0;
                            self.progressValue = 0;
                            window['isUpload'] = false;
                            let x2js = new X2JS();
                            let jsonObj = x2js.xml_str2json(xhr.responseText);
                            if(jsonObj.Error && jsonObj.Error.Code){
                                errMessage['header'] = jsonObj.Error.Code;
                                errMessage['content'] = jsonObj.Error.Message;
                            } else{
                                errMessage.content="Upload failed. The network may be unstable. Please try again later.";
                            }

                            if(requestOptions.headers['X-Amz-Storage-Class']){
                                errMessage.content+=". File ["+ selectFile.name +"] could not be archived."
                                self.msg.error(errMessage);
                                if (cb) {
                                    cb();
                                }
                            } else{
                                errMessage.content+=". File ["+ selectFile.name +"] could not be uploaded."
                                self.msg.error(errMessage);
                                if (cb) {
                                    cb();
                                }
                            }
                        }
                    };
                    xhr.upload.onprogress = function(e){
                        let done = e.loaded;
                        let total =  e.total;
                        self.progressValue = Math.floor(done/total*100)
                    }

                    xhr.onerror = (err)=>{
                        if(uploadNum < 5){
                            window['singleUpload'](selectFile, bucketId, options, uploadUrl, cb);
                            uploadNum++;
                        }else{
                            let errMessage = {
                                header: '',
                                content: ''
                            };
                            self.showPrompt = false;
                            uploadNum = 0;
                            self.progressValue = 0;
                            window['isUpload'] = false;
                            let x2js = new X2JS();
                            let jsonObj = x2js.xml_str2json(xhr.responseText);
                            if(jsonObj.Error && jsonObj.Error.Code){
                                errMessage['header'] = jsonObj.Error.Code;
                                errMessage['content'] = jsonObj.Error.Message;
                            } else{
                                errMessage.content="Upload failed. The network may be unstable. Please try again later.";
                            }

                            if(requestOptions.headers['X-Amz-Storage-Class']){
                                errMessage.content+=". File ["+ selectFile.name +"] could not be archived."
                                self.msg.error(errMessage);
                                if (cb) {
                                    cb();
                                }
                            } else{
                                errMessage.content+=". File ["+ selectFile.name +"] could not be uploaded."
                                self.msg.error(errMessage);
                                if (cb) {
                                    cb();
                                }
                            }
                        }
                    }
                    xhr.onloadend=()=>{
                    }
                    xhr.send(fileContent);
                    /* XHR Send ends */
                };


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
            let fileString: any;
            let chunk = blob.slice(chunks[i].start, chunks[i].end);
            let uploadUrl = this.BucketService.url + bucketId + '/' + this.selectFileName;
            window['getAkSkList'](()=>{

                let requestMethod = "PUT";
                let url = '/'+ bucketId + '/' + this.selectFileName + '?partNumber=' + (i + 1) + '&uploadId=' + uploadId;
                let requestOptions: any;
                let options: any = {};
                const reader = new FileReader();
                let contentHeaders = {
                    'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD'
                };
                requestOptions = window['getSignatureKey'](requestMethod, url, '', '', '', '', '', '', contentHeaders) ;
                options['headers'] = new Headers();
                options = this.BucketService.getSignatureOptions(requestOptions, options);
                this.http.put(uploadUrl + '?partNumber=' + (i + 1) + '&uploadId=' + uploadId, chunk, options).subscribe((data) => {
                    this.refreshLastTime();
                    let header = data.headers['_headers']
                    let headerArr = header.entries()
                    let headerArr1= Array.from(headerArr)
                    let ETag
                    headerArr1.forEach((item)=>{
                        if(item[0] == 'etag'){
                            return ETag = item[1][0].replace(/\"/g,"")
                        }
                    })
                    let obj = {}
                    obj['PartNumber'] = i+1
                    obj['ETag'] = ETag && ETag? ETag : ""
                    window['uploadPartArr'].push(obj);
                    uploadNum = 0;
                    /* upload progress */
                    let done = i;
                    let total =  chunks.length;
                    this.progressValue = Math.floor(done/total*100)
                    /* Upload progress */
                    if (i < (chunks.length - 1)) {
                        window['segmentUpload'](i + 1, chunks, blob, uploadId, options, bucketId, cb);
                    } else {
                        let completeMultipartStr = '<CompleteMultipartUpload>';
                        window['uploadPartArr'].forEach(item => {
                            completeMultipartStr += `<Part>
                            <PartNumber>${item.PartNumber}</PartNumber>
                            <ETag>${item.ETag}</ETag>
                            </Part>`
                        });
                        completeMultipartStr += '</CompleteMultipartUpload>';
                        window['CompleteMultipartUpload'](bucketId, blob, uploadId, completeMultipartStr, options, cb);
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
                                let url = '/'+ bucketId + '/' + this.selectFileName + '?uploadId=' + uploadId;
                                let requestOptions: any;
                                let options: any = {};
                                requestOptions = window['getSignatureKey'](requestMethod, url) ;
                                options['headers'] = new Headers();
                                options = this.BucketService.getSignatureOptions(requestOptions, options);
                                this.http.delete(uploadUrl + "?uploadId=" + uploadId, options).subscribe((data)=>{});
                                this.msg.error("Upload failed. The network may be unstable. Please try again later.");
                                if (cb) {
                                    cb();
                                }
                        })
                    }
                });
            })
        }
        window['CompleteMultipartUpload'] = (bucketId, blob, uploadId, completeMultipartStr, options, cb) => {
            let uploadUrl = this.BucketService.url + bucketId + '/' + this.selectFileName;
            window['getAkSkList'](()=>{
                let fileString: any;
                let requestMethod = "POST";
                let url = '/'+ bucketId + '/' + this.selectFileName + '?uploadId=' + uploadId;
                let requestOptions: any;
                let options: any = {};

                requestOptions = window['getSignatureKey'](requestMethod, url, '', '', '', completeMultipartStr) ;
                options['headers'] = new Headers();
                options = this.BucketService.getSignatureOptions(requestOptions, options);
                this.http.post(uploadUrl + '?uploadId=' + uploadId, completeMultipartStr, options).subscribe((res) => {
                    this.showPrompt = false;
                    window['isUpload'] = false;
                    this.msg.success("Upload file ["+ blob.name +"] successfully.");
                    this.progressValue = 0;
                    if (cb) {
                        cb();
                    }
                },(error) => {
                    if(uploadNum < 5){
                        window['CompleteMultipartUpload'](bucketId, blob, uploadId, completeMultipartStr, options, cb);
                        uploadNum++;
                    }else{
                        this.showPrompt = false;
                        uploadNum = 0;
                        this.progressValue = 0;
                        window['isUpload'] = false;
                        window['getAkSkList'](()=>{
                            let requestMethod = "DELETE";
                            let url = '/'+ bucketId + '/' + this.selectFileName + '?uploadId=' + uploadId;
                            let requestOptions: any;
                            let options: any = {};
                            requestOptions = window['getSignatureKey'](requestMethod, url) ;
                            options['headers'] = new Headers();
                            options = this.BucketService.getSignatureOptions(requestOptions, options);
                            this.http.delete(uploadUrl + "?uploadId=" + uploadId, options).subscribe((data)=>{});
                        })
                    }
                });
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
                if(!response.credentials.length){
                    window['akskWarning']=true;
                }
                // Check if the user has generated AK/Sk and stored in credentials.

                if(response.credentials.length && !(_.where(response.credentials, {'user_id':window['userId']})).length){
                    window['akskWarning']=true;
                }

                //Display a warning if AK/SK is not generated and user tries to access bucket management or migration.

                if(window['akskWarning'] && (this.router.url == '/block' || this.router.url == '/dataflow')){
                    let msg = "SODA Dashboard requires AK/SK authentication for all multi-cloud operations. The current system does not have an AK/SK. Click below to go to AK/SK management and add one."
                    let header = "AK/SK Not Found!";
                    let acceptLabel = "Add AK/SK";
                    let warning=true;
                    this.confirmDialog([msg,header,acceptLabel,warning]);
                }
                let detailArr = [];
                response.credentials.forEach(item=>{
                    if(item.user_id == window['userId']){
                        let accessKey = JSON.parse(item.blob);
                        detailArr.push(accessKey);
                    }
                })
                this.SignatureKey = [];
                if(detailArr.length > 0){
                    window['getParameters'](detailArr);
                    window['akskWarning'] = false;
                }
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
            // this.AuthWithTokenScoped({ 'name': username, 'id': userid });
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
        window['getSignatureKey'] = (method, canonicalUri, host?, region?, service?, body?, contentType?, queryString?, headers?)=>{

            if(canonicalUri == 's3/'){
                canonicalUri = '';
            }

            if(body && (headers && headers['X-Amz-Content-Sha256'] == 'UNSIGNED-PAYLOAD')){
                body = '';
            }

            let requestOptions: any = {
                host: host ? host : Consts.S3_HOST_IP + ':' + Consts.S3_HOST_PORT,
                method: method,
                path: canonicalUri,
                service: service ? service : 's3',
                region: region ? region : 'us-east-1',
                body: body ? body : '',
                headers: {
                    'X-Auth-Token': localStorage['auth-token'],
                    'Content-Type': headers && headers['Content-Type'] ? headers['Content-Type'] : 'application/xml'
                }

            }
            if(region){
                requestOptions['region'] = region;
            }
            /******
            ToDo:
            Currently we are checking for the known headers in our API requests and adding them to the signature generation.
            This will not scale well. We have to iterate through the headers sent to the signature generation method and populate
            the requestOptions.headers with all the headers.
            *******/

            if(headers && headers['x-amz-acl']){
                requestOptions.headers['x-amz-acl'] = headers['x-amz-acl'];
            }
            if(headers && headers['X-Amz-Metadata-Directive']){
                requestOptions.headers['X-Amz-Metadata-Directive'] = headers['X-Amz-Metadata-Directive'];
            }
            //Header used for copy/paste object
            if(headers && headers['x-amz-copy-source']){
                requestOptions.headers['x-amz-copy-source'] = headers['x-amz-copy-source'];
            }
            // Header needed for archive
            if(headers && headers['X-Amz-Storage-Class']){
                requestOptions.headers['X-Amz-Storage-Class'] = headers['X-Amz-Storage-Class'];
            }
            // Header used to specify Service plans in create bucket.
            if(headers && headers['tier']){
                requestOptions.headers['tier'] = headers['tier'];
            }

            if(headers && headers['X-Amz-Content-Sha256'] == 'UNSIGNED-PAYLOAD'){
                requestOptions.headers['X-Amz-Content-Sha256'] = 'UNSIGNED-PAYLOAD';
            }
            aws4.sign(requestOptions, {
                secretAccessKey: this.SignatureKey['secretAccessKey'],
                accessKeyId: this.SignatureKey['AccessKey']
            })
            return requestOptions;
    	}
    }


    openAlertsManager(){
        window.open("http://" + Consts.SODA_HOST_IP + ":" + Consts.SODA_ALERTMANAGER_PORT + "/#/alerts", "_blank")
    }
    confirmDialog([msg,header,acceptLabel,warning]){
        this.confirmationService.confirm({
            message: msg,
            header: header,
            acceptLabel: acceptLabel,
            isWarning: warning,
            key: 'akskWarningPrompt',
            accept: ()=>{
                this.isHomePage = false;
                window['akskWarning'] = false;
                this.router.navigateByUrl('/akSkManagement');
            },
            reject:()=>{}
        })
    }
    /* Joyride */
    stepVisible: any;
    title: any;
    toggleAction() {
        this.stepVisible = true;
    }
    stepDone() {
        setTimeout(() => {
            this.title = 'Tour Finished!';

        }, 3000);
    }
    onPrev() {

    }
    startTour() {
        const options = {
            steps: this.tourSteps,
            // startWith: 'step3@app',
            // waitingTime: 3000,
            //stepDefaultPosition: 'top',
            themeColor: '#243680',
            showPrevButton: true,
            logsEnabled: true
            // customTexts: { prev: of('<<').pipe(delay(2000)), next: '>>'}
        };
        this.joyrideService.startTour(options).subscribe(
            step => {
                let scrollElm = document.scrollingElement;
                scrollElm.scrollTop = 0;
            },
            e => {
                console.log('Error', e);
            },
            () => {
                this.stepDone();

            }
        );
    }
    /* Joyride ends */

    openUserGuide(){
        this.isHomePage = false;
        this.router.navigate(['/help']);
    }
    refreshLastTime() {
        this.lastTime = new Date().getTime();
    }
    updateLogin (item){
        this.isLogin = item.isLogin
        this.username = item.username
        this.hideLoginForm = item.hideLoginForm
        this.dropMenuItems = item.dropMenuItems
        this.tenantItems = item.tenantItems
        this.menuItems = item.menuItems
        this.tourSteps=item.tourSteps,
        this.showLogoutAnimation=item.showLogoutAnimation,
        this.showLoginAnimation=item.showLoginAnimation,
        this.isHomePage=item.isHomePage
        if(item.isLogin){
            let temp = {
                dropMenuItems : item.dropMenuItems,
                menuItems : item.menuItems,
                tourSteps:item.tourSteps,
                tenantItems : item.tenantItems,
                userName: item.username
            }
        this.showMenu = true
        this.paramStor.setParam('userItems',JSON.stringify(temp))
        }
        else{
        window['isUpload'] = false;
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

}
