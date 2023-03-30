import { Component, OnInit } from "@angular/core";

@Component({
  selector: "splash-screen",
  templateUrl: "./splash-screen.component.html",
  styleUrls: ["./splash-screen.component.scss"]
})
export class SplashScreenComponent implements OnInit {
  windowWidth: any;
  showSplash = false;

  ngOnInit(): void {
    if(undefined === window.sessionStorage.getItem('showSplash') || !window.sessionStorage.getItem('showSplash')){
      this.showSplash = true;
      window.sessionStorage.setItem('showSplash', '1');
      setTimeout(() => {
        this.windowWidth = "-" + window.innerWidth + "px";
  
        setTimeout(() => {
          this.showSplash = !this.showSplash;
        }, 500);
      }, 3000);
    }
    
  }
}