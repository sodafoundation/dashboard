import { Injectable } from '@angular/core';

@Injectable()
export class ParamStorService {
    // Set local storage
    setParam(key, value){
        localStorage[key] = value;
    }

    // Get local storage
    getParam(key){
        return localStorage[key];
    }

    // Current login user
    CURRENT_USER(param?){
        if(param === undefined){
            return this.getParam('current-user');
        } else {
            this.setParam('current-user', param);
        }
    }
    // current user role
    CURRENT_ROLE(param?){
        if(param === undefined){
            return this.getParam('role');
        } else {
            this.setParam('role', param);
        }
    }

    // current user ID
    CURRENT_USERID(param?){
        if(param === undefined){
            return this.getParam('userID');
        } else {
            this.setParam('userId', param);
        }
    }    // current user project item ID
    CURRENT_PROJECTITEMID(param?){
        if(param === undefined){
            return this.getParam('projectItemId');
        } else {
            this.setParam('projectItemId', param);
        }
    }
    // User auth token
    AUTH_TOKEN(param?){
        if(param === undefined){
            return this.getParam('auth-token');
        } else {
            this.setParam('auth-token', param);
        }
    }

    // Current login user
    CURRENT_TENANT(param?){
        if(param === undefined){
            return this.getParam('current-tenant');
        } else {
            this.setParam('current-tenant', param);
        }
    }
    // user password
    PASSWORD(param?){
        if(param === undefined){
            return this.getParam('password');
        } else {
            this.setParam('password', param);
        }
    }
    // token period
    TOKEN_PERIOD(param?){
        if(param === undefined){
            return this.getParam('token_period');
        } else {
            this.setParam('token_period', param);
        }
    }


}
