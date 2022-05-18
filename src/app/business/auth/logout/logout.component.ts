import { Component, OnInit } from '@angular/core';
import { ParamStorService,} from 'app/shared/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html'
})
export class LogoutComponent implements OnInit {

  constructor(
    private router: Router,
    private paramStor: ParamStorService,
  ) { }

  logout() {
    new Promise<any>((resolve,reject) => {
        this.paramStor.AUTH_TOKEN("");
        this.paramStor.CURRENT_USER("");
        this.paramStor.CURRENT_TENANT("");
        this.paramStor.PASSWORD("");
        this.paramStor.CURRENT_ROLE("")
        this.paramStor.TOKEN_PERIOD("");
        this.paramStor.CURRENT_PROJECTITEMID("")
        this.paramStor.CURRENT_USERID("")
        localStorage.removeItem('userItems')
        resolve(true)
    }).then((redirect) =>{
        if (redirect){
            this.router.navigate(['/']).then(()=>{
                window.location.reload();
            })
        }
    })
}
  ngOnInit() {
    this.logout()
  }

}
