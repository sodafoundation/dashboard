import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpModule } from "@angular/http";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { BucketService } from './business/block/buckets.service';
import { HttpService } from './shared/service/Http.service';
import { JoyrideModule } from 'ngx-joyride';
import { LoginComponent } from './business/auth/login/login.component';
import { MessagesModule } from './components/messages/messages';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MessagesModule,
    HttpModule,
    BrowserAnimationsModule,
    SharedModule.forRoot(),
    JoyrideModule.forRoot()
  ],
  providers: [
      { provide: LocationStrategy, useClass: HashLocationStrategy }, BucketService, HttpService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
