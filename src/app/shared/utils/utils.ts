import {ValidatorFn, AbstractControl } from '@angular/forms';
import { Consts } from './consts';
export class Utils {

    static capacityUnit = {
        KB: "KB",
        MB: "MB",
        GB: "GB",
        TB: "TB",
        PB: "PB",
        EB: "EB",
        BYTE: "BYTE",
        BIT: "BIT"
    }

    /**
     * Formatting data, preserving three decimal (interception)
     * ex. 123456.78901 -> 123,456.789
     *
     * @param number (input)
     * @param decimals (number)
     * @param dec_point (Decimal separator)
     * @param thousands_sep (Thousandth separators)
     * @returns number
     */
    static numberFormat(number, decimals=3, dec_point=".", thousands_sep=",", isCeil=false) {
        number = (String(number)).replace(/[^0-9+-Ee.]/g, '');
        let n = !isFinite(+number) ? 0 : +number,
            prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
            sep = thousands_sep,
            dec = dec_point,
            s = [],
            toFixedFix = function(n, prec, isCeil) {
                var k = Math.pow(10, prec);
                if (isCeil) {
                    return String(Math.ceil(n * k) / k);
                } else {
                    return String(Math.floor(n * k) / k);
                }
            };

        // Fix for IE parseFloat(0.55).toFixed(0) = 0;
        s = (prec ? toFixedFix(n, prec, isCeil) : String(Math.floor(n))).split('.');
        if (s[0].length > 3) {
            s[0] = s[0].replace(/\B(?=(?:d{3})+(?!d))/g, sep);
        }
        if ((s[1] || '').length > prec) {
            s[1] = s[1] || '';
            s[1] += new Array(prec - s[1].length + 1).join('0');
        }
        if (!(s[1])) {
            s[1] = '0';
        }
        while ((s[1] || '').length < prec) {
            s[1] += '0';
        }
        return s.join(dec);
    }

    /**
     * Returns the capacity value of the adaptive unit for display (with units).
     * @param capacity  (byte)
     * @param decimals  (number)
     * @param minUnit   (string) Minimum unit of capacity after conversion
     * @return {[type]} [description]
     */
    static getDisplayCapacity(capacity, decimals = 3, minUnit = "GB") {
        let ret;
        let unit = this.capacityUnit.BYTE;

        if (minUnit == "BYTE" && capacity / 1024 < 1) {
            ret = capacity;
        } else if ("KB".includes(minUnit) && capacity / (1024 * 1024) < 1) {
            ret = capacity / 1024;
            unit = this.capacityUnit.KB;
        } else if ("KB,MB".includes(minUnit) && capacity / (1024 * 1024 * 1024) < 1) {
            ret = capacity / (1024 * 1024);
            unit = this.capacityUnit.MB;
        } else if ("KB,MB,GB".includes(minUnit) && capacity / (1024 * 1024 * 1024 * 1024) < 1) {
            ret = capacity / (1024 * 1024 * 1024);
            unit = this.capacityUnit.GB;
        } else if ("KB,MB,GB,TB".includes(minUnit) && capacity / (1024 * 1024 * 1024 * 1024 * 1024) < 1) {
            ret = capacity / (1024 * 1024 * 1024 * 1024);
            unit = this.capacityUnit.TB;
        } else if ("KB,MB,GB,TB,PB".includes(minUnit) && capacity / (1024 * 1024 * 1024 * 1024 * 1024 * 1024) < 1) {
            ret = capacity / (1024 * 1024 * 1024 * 1024 * 1024);
            unit = this.capacityUnit.PB;
        } else if ("KB,MB,GB,TB,PB,EB".includes(minUnit) && capacity / (1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024) < 1) {
            ret = capacity / (1024 * 1024 * 1024 * 1024 * 1024 * 1024);
            unit = this.capacityUnit.EB;
        }

        ret = this.numberFormat(ret, decimals);
        return ret == 0 ? ret + " " + minUnit : ret + " " + unit;
    }

    /**
     * Returns the capacity value of the adaptive unit for display (with units).
     * @param capacity  (GB)
     * @param decimals  (number)
     * @return {[type]} [description]
     */
    static getDisplayGBCapacity(capacity, decimals = 3) {
        let ret;
        let unit = this.capacityUnit.GB;

        if (capacity / 1024 < 1) {
            ret = capacity;
        } else if (capacity / (1024 * 1024) < 1) {
            ret = capacity / 1024;
            unit = this.capacityUnit.TB;
        } else if (capacity / (1024 * 1024 * 1024) < 1) {
            ret = capacity / (1024 * 1024);
            unit = this.capacityUnit.PB;
        } else if (capacity / (1024 * 1024 * 1024 * 1024) < 1) {
            ret = capacity / (1024 * 1024 * 1024);
            unit = this.capacityUnit.EB;
        }

        ret = this.numberFormat(ret, decimals);
        return ret + " " + unit;
    }
    /***
     * formatBytes(bytes, decimals) Returns the capacity value in appropriate display units
     * @param bytes (byte)
     * @param decimals (number) //defaults to 2
     * 
     * As per https://stackoverflow.com/a/18650828/6303009
     * by Aliceljm (https://stackoverflow.com/users/1596799/aliceljm)
     */
    static formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
    
        const k = Consts.TO_GiB_CONVERTER;
        const dm = decimals < 0 ? 0 : decimals;
        const sizesGiB = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        const sizesGB = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizesGiB[i];
    }

    /**
     * Help get validation information.
     * @param control form information
     * @param page extra validation information param
     * @returns {string}
     */
    static getErrorKey(control,page){
        if(control.errors){
            let key = Object.keys(control.errors)[0];
            return page ? "sds_"+ page +key:"sds_"+key;
        }
    }
    /**
     * remove one of array element
     * @param prevArr origin array
     * @param element remove element
     * @param func remove methods
     */
    static arrayRemoveOneElement(prevArr,element,func){
        let index = prevArr.findIndex(func);
        if(index > -1){
            prevArr.splice(index,1);
        }
    }
    /**
     * 
     * @param time format time
     */
    static formatDate(time){
        if(!time){
            return "--";
        }
        let date = new Date(time);
    
        let year = date.getFullYear(),
            month = ((date.getMonth() + 1) >= 10) ? (date.getMonth()+ 1) : ("0"+(date.getMonth()+1)),
            day = (date.getDate() >= 10) ? date.getDate() : ("0"+date.getDate()),
            hour = (date.getHours() >= 10) ? date.getHours() : ("0"+date.getHours()),
            min = (date.getMinutes() >= 10) ? date.getMinutes() : ("0"+date.getMinutes()),
            sec = (date.getSeconds() >= 10) ? date.getSeconds() : ("0"+date.getSeconds());
        let newTime = year + '-' +
                month + '-' +
                day + ' ' +
                hour + ':' +
                min + ':' +
                sec;
        return newTime;         
    }

    /**
     * check name isExisted
     * @param param name array 
     */
    static isExisted(param:Array<string>) : ValidatorFn{
        return (c: AbstractControl): {[key: string]: any} | null => {
            return param.includes(c.value) ? {"isExisted":true} : null;
        }
    }

    /**
     * prepare a query param string from received object
     * 
     */
    static prePareQuery(object){
        let query = ""
        for (let item in object)
             query += encodeURIComponent(item) + '=' + 
                encodeURIComponent(object[item]) + '&'
        return query.slice(0, -1)
    }

}
