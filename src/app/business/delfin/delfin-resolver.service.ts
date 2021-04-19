import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { I18NService, HttpService, ParamStorService, Utils, Consts } from '../../shared/api';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DelfinService } from './delfin.service';

let _ = require("underscore");

@Injectable()
export class DelfinResolver implements Resolve<any> {
  allStorages;
  delfinStoragesUrl = Consts.API.DELFIN.storages;
  delfinStoragePoolsUrl = Consts.API.DELFIN.storagePools;
  delfinVolumesUrl = Consts.API.DELFIN.volumes;
  delfinControllersUrl = Consts.API.DELFIN.controllers;
  delfinQtreesUrl = Consts.API.DELFIN.qtrees;
  delfinFilesystemsUrl = Consts.API.DELFIN.filesystems;
  delfinSharesUrl = Consts.API.DELFIN.shares;
  delfinQuotasUrl = Consts.API.DELFIN.quotas;
  delfinPortsUrl = Consts.API.DELFIN.ports;
  delfinDisksUrl = Consts.API.DELFIN.disks;
  delfinAlertsUrl = Consts.API.DELFIN.alerts;
  constructor(
      private http: HttpService,
      private paramStor: ParamStorService,
      public ds: DelfinService
    ) 
    { 
      this.ds.getAllStorages().subscribe((res)=>{
        let storages = res.json().storages;
        this.allStorages = storages;
        this.allStorages.forEach((element, index, array) => {
            //Calculate the capacities for the Widgets
            element['capacity'] = {};
            let percentUsage = Math.ceil((element['used_capacity']/element['total_capacity']) * 100);
            element['capacity'].used = Utils.formatBytes(element['used_capacity']);
            element['capacity'].free = Utils.formatBytes(element['free_capacity']);
            element['capacity'].total = Utils.formatBytes(element['total_capacity']);
            element['capacity'].raw = Utils.formatBytes(element['raw_capacity']);
            element['capacity'].subscribed = Utils.formatBytes(element['subscribed_capacity']);
            let system_used = Math.ceil((element['raw_capacity'] - element['total_capacity']));
            element['system_used_capacity'] = system_used;
            element['capacity'].system_used = Utils.formatBytes(element['system_used_capacity']) ;
            element['capacity'].usage = percentUsage;
            let capData = {
                labels: ['Used','Free'],
                datasets: [
                    {
                        data: [element['used_capacity'], element['free_capacity']],
                        backgroundColor: [
                            "#FF6384",
                            "#45e800"
                        ],
                        hoverBackgroundColor: [
                            "#FF6384",
                            "#45e800"
                        ]
                    }]    
            };

            let opt = {
                legend:{
                    position: 'bottom'
                }
            }
            element['capacityData'] = capData;
            element['chartOptions'] = opt;
            this.ds.getAccessinfoByStorageId(element['id']).subscribe((res)=>{                    
                let accessInfo = res.json();
                element['delfin_model'] = accessInfo['model'];
                element['volumesExist'] = _.contains(Consts.STORAGES.resources.volumes, accessInfo['model']);
                element['poolsExist'] = _.contains(Consts.STORAGES.resources.pools, accessInfo['model']);
                element['controllersExist'] = _.contains(Consts.STORAGES.resources.controllers, accessInfo['model']);
                element['portsExist'] = _.contains(Consts.STORAGES.resources.ports, accessInfo['model']);
                element['disksExist'] = _.contains(Consts.STORAGES.resources.disks, accessInfo['model']);
                element['qtreesExist'] = _.contains(Consts.STORAGES.resources.qtrees, accessInfo['model']);
                element['filesystemsExist'] = _.contains(Consts.STORAGES.resources.filesystems, accessInfo['model']);
                element['sharesExist'] = _.contains(Consts.STORAGES.resources.shares, accessInfo['model']);
                element['quotasExist'] = _.contains(Consts.STORAGES.resources.quotas, accessInfo['model']);
                if(element['volumesExist']){
                    // Get all the volumes associated with the Storage device
                    this.ds.getAllVolumes(element['id']).subscribe((res)=>{
                        let vols = res.json().volumes;
                        element['volumes'] = vols;
                    }, (error)=>{
                        console.log("Something went wrong. Could not fetch Volumes.", error)
                    });
                }

                if(element['poolsExist']){
                    // Get all the Storage pools associated with the Storage device 
                    this.ds.getAllStoragePools(element['id']).subscribe((res)=>{
                        let pools = res.json().storage_pools;
                        element['storagePools'] = pools;
                    }, (error)=>{
                        console.log("Something went wrong. Could not fetch Storage Pools.", error)
                    });
                }
                if(element['controllersExist']){
                    // Get all the Controllers associated with the Storage device
                    this.ds.getAllControllers(element['id']).subscribe((res)=>{
                        let controllers = res.json().controllers;
                        element['controllers'] = controllers;
                    }, (error)=>{
                        console.log("Something went wrong. Could not fetch Controllers.", error)
                    });
                }
                if(element['portsExist']){
                    
                    // Get all the Ports associated with the Storage device
                    this.ds.getAllPorts(element['id']).subscribe((res)=>{
                        let ports = res.json().ports;
                        element['ports'] = ports;
                    }, (error)=>{
                        console.log("Something went wrong. Could not fetch Ports.", error)
                    });
                } 
                if(element['disksExist']){
                    // Get all the Disks associated with the Storage device
                    this.ds.getAllDisks(element['id']).subscribe((res)=>{
                        let disks = res.json().disks;
                        element['disks'] = disks;
                    }, (error)=>{
                        console.log("Something went wrong. Could not fetch Disks.", error)
                    });
                }
                if(element['qtreesExist']){
                    // Get all the Qtrees associated with the Storage device
                    this.ds.getAllQtrees(element['id']).subscribe((res)=>{
                        let qtrees = res.json().qtrees;
                        element['qtrees'] = qtrees;
                    }, (error)=>{
                        console.log("Something went wrong. Could not fetch Qtrees.", error)
                    });
                }
                if(element['filesystemsExist']){
                    // Get all the Filesystems associated with the Storage device
                    this.ds.getAllFilesystems(element['id']).subscribe((res)=>{
                        let filesystems = res.json().filesystems;
                        element['filesystems'] = filesystems;
                    }, (error)=>{
                        console.log("Something went wrong. Could not fetch Filesystems.", error)
                    });
                }
                if(element['sharesExist']){
                    // Get all the Shares associated with the Storage device
                    this.ds.getAllShares(element['id']).subscribe((res)=>{
                        let shares = res.json().shares;
                        element['shares'] = shares;
                    }, (error)=>{
                        console.log("Something went wrong. Could not fetch Shares.", error)
                    });
                } 
                if(element['quotasExist']){
                    // Get all the Quotas associated with the Storage device
                    this.ds.getAllQuotas(element['id']).subscribe((res)=>{
                        console.log("Quotas fetched")
                        let quotas = res.json().quotas;
                        element['quotas'] = quotas;
                    }, (error)=>{
                        console.log("Something went wrong. Could not fetch Quotas.", error)
                    });
                } 
            }, (error) =>{
                console.log("Something went wrong. Could not fetch access info in resolver.");    
            });
        });
      }, (error)=>{
        console.log("Something went wrong. Could not fetch all storages in resolver.");
      });
    }
  resolve(): Observable<any> {
    return this.allStorages;
  }
}