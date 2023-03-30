import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SplashScreenComponent } from './splash-screen/splash-screen.component';
import { ProjectIntroComponent } from './project-intro/project-intro.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpRequestInterceptor } from './services/http-interceptor'; 
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatTabsModule } from '@angular/material/tabs';
import { SafePipe } from './common/safePipe';

@NgModule({
  declarations: [
    AppComponent,
    SplashScreenComponent,
    ProjectIntroComponent,
    ProjectDetailsComponent,
    SafePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    MatGridListModule,
    MatCardModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    FlexLayoutModule,
    MatTabsModule
  ],
  providers: [
    { 
      provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi:true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
