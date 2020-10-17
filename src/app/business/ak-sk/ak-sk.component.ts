import { Router,ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewContainerRef, ViewChild, Directive, ElementRef, HostBinding, HostListener, Input } from '@angular/core';
import { I18NService, MsgBoxService, Utils } from 'app/shared/api';
import { AppService } from 'app/app.service';
import { ConfirmationService, ConfirmDialogModule} from '../../components/common/api';
import { trigger, state, style, transition, animate} from '@angular/animations';
import { akSkService } from './ak-sk.service';
import { I18nPluralPipe } from '@angular/common';
import { Http } from '@angular/http';

@Component({
    selector: 'ak-sk',
    templateUrl: './ak-sk.html',
    styleUrls: [],
    providers: [ConfirmationService, MsgBoxService]
})
export class AkSkComponent implements OnInit{
    akSkDetail = [];
    showAkSk = false;
    newRandomValues = "";
    randomNum = 0;
    selectedAkSk = [];
    addAkSkFlag = false;
    createAkId;
    credentialId;
    canAddKey = false;
    options = {
        headers: {
            'X-Auth-Token': localStorage['auth-token']
        } 
    };
    constructor(
        public I18N: I18NService,
        private router: Router,
        private ActivatedRoute:ActivatedRoute,
        private http:Http,
        private confirmationService: ConfirmationService,
        private akSkService: akSkService,
        private msg: MsgBoxService
    ){}

    ngOnInit() {
        this.manageAkSk();
        
    }
    manageAkSk(){
        //Query AK/SK
        this.akSkDetail = [];
        let request: any = { params:{} };
        request.params = {
            "userId": window['userId'],
            "type":"ec2"
        }
        this.akSkService.getAkSkList(request,this.options).subscribe(res=>{
            let response = res.json();
            let detailArr = [];
            if(!response.credentials.length){
                window['akskWarning']=true;
            }
            response.credentials.forEach(item=>{
                if(item.user_id == window['userId']){
                    let accessKey = JSON.parse(item.blob);
                    accessKey.id = item.id;
                    detailArr.push(accessKey);
                }
            })
            if(Object.prototype.toString.call(detailArr) === "[object Array]"){
                this.akSkDetail = detailArr;
            }else if(Object.prototype.toString.call(detailArr) === "[object Object]"){
                this.akSkDetail = [detailArr];
            }
            if(this.akSkDetail.length >= 2){
                this.canAddKey = true;
            }else{
                this.canAddKey = false;
            }
            if(this.akSkDetail.length > 0){
                window['getParameters'](this.akSkDetail);
            }
        }, (error) => {
            console.log("Something went wrong. Could not fetch the credentials.", error);
            window['akskWarning'] = true;
        })
    }
    addKey(){
        //Gets a safe random number
        let accessKey = this.getRandomstring(16);
        let secretKey = this.getRandomstring(32);
        let blob = "{\"access\":\"" + accessKey + "\",\"secret\":\"" + secretKey +"\"}";
        let request: any = {};
        request = {
            "credential":{
                "blob": blob,
                "project_id": window['projectItemId'],
                "type": "ec2",
                "user_id":  window['userId']
            }
        }
        this.akSkService.createAkSk(request,this.options).subscribe(re=>{
            let response = re.json();
            this.createAkId = JSON.parse(response.credential.blob).access;
            this.credentialId = response.credential.id; 
            this.addAkSkFlag = true;
            window['akskWarning'] = false;
            this.manageAkSk();
        })
    }
    getRandomstring(size){
        let access = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N',
        'O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p',
        'q','r','s','t','u','v','w','x','y','z'];
        this.newRandomValues = "";
        this.randomNum = 0;
        this.getRandomValues(size,access);
        return this.newRandomValues;
    }
    getRandomValues(size,access){
        let array = new Uint8Array(size);
        window.crypto.getRandomValues(array);
        array.forEach(item=>{
            if(item >= 0 && item<= 61 && this.randomNum < size){
                this.newRandomValues += access[item];
                this.randomNum++;
            }
        })
        if(this.randomNum < size){
            this.getRandomValues(size,access);
        }
    }
    DeleteKey(file){
        let msg = "<div>Are you sure you want to delete the File ?</div><h3>[ "+ file.access +" ]</h3>";
        let header ="Delete";
        let acceptLabel = "Delete";
        let warming = true;
        this.confirmDialog([msg,header,acceptLabel,warming,"delete"], file)
    }
    downloadAk(credentialId){
        let credential_id = credentialId;
        this.akSkService.downloadAkSk(credential_id,this.options).subscribe(res=>{
            let object = JSON.parse(res.json().credential.blob);
            let stringAK = "accessKey" + " = " + object.access + " , " + "sercetKey" + " = " + object.secret;
            let blob = new Blob([JSON.stringify(stringAK)]);
            let access = "AK/SK";
            if (typeof window.navigator.msSaveBlob !== 'undefined') {  
                window.navigator.msSaveBlob(blob, access);
            } else {
              let URL = window.URL
              let objectUrl = URL.createObjectURL(blob)
              if (access) {
                let a = document.createElement('a')
                a.href = objectUrl
                a.download = access
                document.body.appendChild(a)
                a.click()
                a.remove()
              }
            }
        })
    }
    confirmDialog([msg,header,acceptLabel,warming=true,func], file){
        this.confirmationService.confirm({
            message: msg,
            header: header,
            acceptLabel: acceptLabel,
            isWarning: warming,
            accept: ()=>{
                try {
                    let credential_id = file.id;
                    this.akSkService.deleteAkSk(credential_id,this.options).subscribe(res=>{
                        this.manageAkSk();
                    })
                }
                catch (e) {
                    console.log(e);
                }
                finally {}
            },
            reject:()=>{}
        })
    }
}
