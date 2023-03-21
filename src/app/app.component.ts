import { Component, OnInit } from '@angular/core';
import { delay } from 'rxjs/operators';
import { LoadingService } from './services/loading.service';
import { HttpService } from './services/http.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  loading: boolean = false;
  siteDetails: any = [];
  
  constructor(
    private _loading: LoadingService,
    private api: HttpService
  ) {}

  ngOnInit() {
    this.listenToLoading();
    this.getBaseData();
  }

  listenToLoading(): void {
    this._loading.loadingSub
      .pipe(delay(0)) // This prevents a ExpressionChangedAfterItHasBeenCheckedError for subsequent requests
      .subscribe((loading) => {
        this.loading = loading;
      });
  }

  getBaseData(){
    this.api.getBaseData().subscribe(data => {
      this.siteDetails = data;
    });
  }

}
