//import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocationAccuracy } from '@ionic-native/location-accuracy';

import { Geolocation } from '@ionic-native/geolocation';
import { Platform } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';


declare var google;
var directionsRenderer, directionsService;


@Injectable()
export class GoogleServicesProvider {
  userDetails: any = {};
  userLocale:any;
  constructor(private la: LocationAccuracy, private geolocation: Geolocation, public platform: Platform, public http: HttpClient) {
    console.log('Hello GoogleServicesProvider Provider');
  }

  

  calcRoute(start, end) {
    //  this.maps.calcRoute (start, end)
    return new Promise((resolve, reject) => {
      directionsService = new google.maps.DirectionsService();
      directionsRenderer = new google.maps.DirectionsRenderer();
      var request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL
      };
      directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          console.log(response);
          resolve(response.routes[0].legs[0]);
        } else {
          reject(false)
        }
      });
    })

  }

  getDistance(start, end) {
    return new Promise((resolve, reject) => {
      let unitSystem =  this.userDetails.distanceunit.toLowerCase().startsWith('k') ? google.maps.UnitSystem.METRIC : google.maps.UnitSystem.IMPERIAL;
      let distanceService = new google.maps.DistanceMatrixService();
      let request = {
        origins: [start],
        destinations: [end],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: unitSystem
      }
      distanceService.getDistanceMatrix(request, (response, status) => {
        if (status == 'OK') {
          if (response && response.rows[0].elements[0].status == 'OK') {
            console.log(response.rows[0].elements[0]);
            let gRes: any = {};
            gRes.duration = response.rows[0].elements[0].duration.value;
            if (unitSystem == google.maps.UnitSystem.METRIC) {
              gRes.distance = (response.rows[0].elements[0].distance.value / 1000).toFixed(0);
              // resolve({distance: (response.rows[0].elements[0].distance.value / 1000).toFixed(0) +' '+ this.userSrvc.userDetails.distanceunit, duration:response.rows[0].elements[0].duration.value});
            } else {
              gRes.distance = (response.rows[0].elements[0].distance.value * 0.000621371192).toFixed(0);
              // resolve({distance: (response.rows[0].elements[0].distance.value * 0.000621371192 ).toFixed(0) +' '+ this.userSrvc.userDetails.distanceunit, duration:response.rows[0].elements[0].duration.value} );
            }
            if (gRes.distance < 1) {
              reject('Journey is too short');
            } else if (gRes.distance > 1000) {
              reject('Journey should not exceed to 1000 ' + this.userDetails.distanceunit);
            }
            else {
              gRes.distance += ' ' + this.userDetails.distanceunit;
              resolve(gRes);
            }
            //resolve(response.rows[0].elements[0])
          } else {
            reject(false);
          }
        } else {
          reject(false)
        }
      })

    })

  }


  async getAddressByLatLng() {
    let res = await this.checkGpsOnAndPermission() as any;

    return new Promise(resolve => {
      if (res.result) {
        console.log(res.pos.coords.latitude, res.pos.coords.latitude);
        let geocoder = new google.maps.Geocoder;
        let latlng = new google.maps.LatLng(res.pos.coords.latitude.toFixed(6), res.pos.coords.longitude.toFixed(6));
        geocoder.geocode({ 'latLng': latlng }, (result, status) => {
          if (status == 'OK') {
            if (result[1]) {
              let resR = { result: true, loc: result[1].formatted_address, pos: { lat: res.pos.coords.latitude, lng: res.pos.coords.longitude } }
              console.log(resR)
              resolve(resR)
            } else {
              resolve({ result: false, msg: 'No result found' })
            }
          } else {
            resolve({ result: false, msg: 'Couldn\'t get fetch location due to: ' + status })
          }
        })
        //   console.log(res.pos.coords);
        //  resolve({status:true, pos: res.pos.coords})     
      } else {

        if (res.code == 0) {
          resolve({ status: false, msg: 'GPS must be on to use map' });
        } else if (res.code == 1 && res.err.code == 1) {
          resolve({ status: false, msg: 'GPS permission require to use map' });
        } else if (res.code == 1 && res.err.code == 3) {
          resolve({ status: false, msg: 'There is some problem while getting your device location' });
        } else {
          resolve({ status: false, msg: 'Unable to get your device location' });

        }
      }
    })

  }

  checkGpsOnAndPermission() {

    return new Promise(resolve => {
      let options = {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
      };
      if(this.platform.is('cordova')){
        this.la.request(this.la.REQUEST_PRIORITY_HIGH_ACCURACY).then(() => {
          this.geolocation.getCurrentPosition(options).then((pos) => {
            console.log('pos: ', pos);
            console.log('gps has been on');
            resolve({ result: true, pos });
          })
            .catch(err => {
              console.log('geo location err: ', err);
              resolve({ result: false, err: err, code: 1 });
            })
        })
          .catch(err => {
            console.log('gps on error', err);
            resolve({ result: false, err: err, code: 0 });
          })
      }else{
        this.geolocation.getCurrentPosition(options).then((pos) => {
          console.log('pos: ', pos);
          console.log('gps has been on');
          resolve({ result: true, pos });
        })
          .catch(err => {
            console.log('geo location err: ', err);
            resolve({ result: false, err: err, code: 1 });
          })
      }
   
    })
  }

  askGpsPermission() {
    return this.geolocation.getCurrentPosition();
    // return this.dg.requestLocationAuthorization();
  }

  getGpsOn() {
    return this.la.request(this.la.REQUEST_PRIORITY_HIGH_ACCURACY);
  }

  getUserLocale() {
    return this.http.get('http://ip-api.com/json/');
  }

  






}
