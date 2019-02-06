import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { GoogleServicesProvider } from '../services/google-services';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = 'HomePage';

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, public googleSrvc: GoogleServicesProvider) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      this.googleSrvc.getUserLocale().subscribe((locale: any) => {
        console.log(locale);
        this.googleSrvc.userLocale = locale.countryCode;
      })
    });
  }
}

