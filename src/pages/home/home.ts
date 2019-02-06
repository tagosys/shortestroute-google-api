import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AlertProvider } from '../../services/alert';
import { GoogleServicesProvider } from '../../services/google-services';
declare var google;
/**
 * Generated class for the HomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  journeyData: any;
  map: any;
  watch:any;
  @ViewChild('map') mapElement: ElementRef;
  userLocation:any = {from:{lat:'',lng:''}, to:{from:'', to:''}};
  directionsService: any;
  directionsDisplay: any;
  userMarker:any = [];
  autocompleteItems;
  autocompleteItems1;
  userCurrent:any = {lat:'', lng:''};
  autocomplete = {query:''};
  autocomplete1 = {query:''};
  search:any;
  noResult: boolean = false;
  service:any;
  timeCalulated: any = {time:'', distance:''} ;
  constructor(public navCtrl: NavController, public navParams: NavParams, public alert: AlertProvider, public googleSrvc: GoogleServicesProvider, public zone: NgZone) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');
    this.checkPermissions();
  }

  loadMap() {
    console.log(this.userLocation.lat, '  :   ', this.userLocation.lng);
    let latLng = new google.maps.LatLng(this.userLocation.lat, this.userLocation.lng);
    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer({ suppressMarkers: true });

    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

  //  this.userMarker = new google.maps.Marker({
  //     position: latLng,
  //     map: this.map,
  //     title: "Your current location!"
  // });
    this.directionsDisplay.setMap(this.map);

  //  this.calculateAndDisplayRoute();
    //this.watchPosition();
  }

  myLocation(){
    let geocoder = new google.maps.Geocoder;
    let latlng = new google.maps.LatLng(this.userLocation.lat.toFixed(6),this.userLocation.lng.toFixed(6));
    geocoder.geocode({ 'latLng': latlng }, (result, status) => {
      if (status == 'OK') {
        if (result[1]) {
         this.zone.run(()=>{
          this.userLocation.from.lat = this.userCurrent.lat;
          this.userLocation.from.lng = this.userCurrent.lng;
          this.autocomplete.query = result[1].formatted_address;
         })
          console.log(result)
        //  resolve(resR)
        } else {
        //  resolve({ result: false, msg: 'No result found' })
        }
      } else {
       // resolve({ result: false, msg: 'Couldn\'t get fetch location due to: ' + status })
      }
    })
  }
  

  async checkPermissions() {
    this.alert.showLoading('getting map ready')
    let res = await this.googleSrvc.checkGpsOnAndPermission() as any;

    if (res.result) {
      console.log(res.pos.coords);
      this.userLocation.lat = res.pos.coords.latitude;
      this.userLocation.lng = res.pos.coords.longitude;
      this.userCurrent.lat = res.pos.coords.latitude;
      this.userCurrent.lng = res.pos.coords.longitude;
      this.loadMap();
      this.alert.hideLoading();
    } else {
      this.alert.hideLoading();
      if (res.code == 0) {
        this.confirmModal('GPS must be on to use map');
      } else if (res.code == 1 && res.err.code == 1) {
        this.confirmModal('GPS permission require to use map');
      } else if (res.code == 1 && res.err.code == 3) {
        this.confirmModal('There is some problem while getting your device location');
      } else {
        this.confirmModal('Unable to get your device location');
      }
    }
  }

  confirmModal(msg) {
    let confirm = this.alert.presentConfirm(msg, 'Leave', 'Retry');
    confirm.present();
    confirm.onDidDismiss(res => {
      if (res) {
        this.checkPermissions();
      } else {
      //  this.viewCtrl.dismiss();
      }
    })
  }

  calculateAndDisplayRoute() {
    let start = new google.maps.LatLng(this.userLocation.from.lat, this.userLocation.from.lng);
    let end = new google.maps.LatLng(this.userLocation.to.lat, this.userLocation.to.lng)
    
    this.directionsService.route({
      origin: start,
      destination: end,
      travelMode: 'DRIVING',
      unitSystem: google.maps.UnitSystem.IMPERIAL
    }, (response, status) => {
      console.log(response);
      if (status === 'OK') {
        this.clearMarker();
    this.createMarker(start, 'start');
    this.createMarker(end, 'end');
        this.directionsDisplay.setDirections(response);
       this.zone.run(()=>{
        this.timeCalulated.time =  response.routes[0].legs[0].duration.text;
        this.timeCalulated.distance = response.routes[0].legs[0].distance.text;
       })
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }

  clearMarker(){
    for (var i = 0; i < this.userMarker.length; i++) {
      this.userMarker[i].setMap(null);
    }
  }

  createMarker(latlng, title) {

    let marker = new google.maps.Marker({
      position: latlng,
      title: title,
      map: this.map,
      icon: './assets/imgs/' + title + 'marker.png'
    });
    this.userMarker.push(marker);
  }

  updateSearch() {   
    this.userLocation.from.lng = null;
    this.userLocation.from.lat = null;
    if (this.autocomplete.query == '') {
      this.autocompleteItems = [];
      this.noResult = false;
      return;
    }
    let me = this;
    this.service = new google.maps.places.AutocompleteService();   
    this.service.getPlacePredictions({
      input: this.autocomplete.query,
      componentRestrictions: { country: this.googleSrvc.userLocale }
    },  (predictions, status)=> {
      me.autocompleteItems = [];
      console.log(predictions);
      if(predictions && predictions.length > 0){
        this.noResult = false;
        me.zone.run( ()=> {
          predictions.forEach( (prediction)=> {
            me.autocompleteItems.push(prediction.description);
          });
        });
      }else{
        this.zone.run(()=>{
          this.autocompleteItems = [];
        this.noResult = true;
        })
      }
     
      
    });
  }

  updateSearch1() {
    this.userLocation.to.lng = null;
    this.userLocation.to.lat = null;
    if (this.autocomplete1.query == '') {
      this.autocompleteItems1 = [];
      this.noResult = false;
      return;
    }
    let me = this;
    this.service = new google.maps.places.AutocompleteService();    
    this.service.getPlacePredictions({
      input: this.autocomplete1.query,
      componentRestrictions: { country: "IN" }
    },  (predictions, status)=> {
      me.autocompleteItems1 = [];
      console.log(predictions);
      if(predictions && predictions.length > 0){
        this.noResult = false;
        me.zone.run( ()=> {
          predictions.forEach( (prediction)=> {
            me.autocompleteItems1.push(prediction.description);
          });
        });
      }else{
        this.zone.run(()=>{
          this.autocompleteItems1 = [];
        this.noResult = true;
        })
      }
     
      
    });
  }

  chooseItem(address: any, type) {
    //convert Address string to lat and long
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': address }, (results, status) => {
      console.log(status);
      // let payload = { 'loc': address, 'lat': results[0].geometry.location.lat(), 'lng': results[0].geometry.location.lng() }
      if(status == 'OK')
      {
        this.zone.run(()=>{
          if(type == 'from'){
            console.log('from');
            this.autocomplete.query = address;
            this.autocompleteItems = [];
            this.userLocation.from.lat = results[0].geometry.location.lat();
            this.userLocation.from.lng = results[0].geometry.location.lng();
          }else{
            console.log('to address');
            this.autocomplete1.query = address;
            this.autocompleteItems1 = [];
            this.userLocation.to.lat = results[0].geometry.location.lat();
            this.userLocation.to.lng = results[0].geometry.location.lng();
          }       
        })
      }else{
        this.alert.showError(results)
      }
     // this.viewCtrl.dismiss(payload);
    });
  }

  

}
