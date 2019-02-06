
import { Injectable } from '@angular/core';
import { AlertController, ToastController, LoadingController } from 'ionic-angular';

/*
  Generated class for the AlertProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AlertProvider {
  loading: any;
  runningRequest:boolean;
  constructor(private alertCtrl: AlertController, private toastCtrl: ToastController, public loadingCtrl: LoadingController) {
    console.log('Hello AlertProvider Provider');
  }

  showError(msg) {   
    let alert = this.alertCtrl.create({
      title: 'Error',
      subTitle: msg,
      buttons: ['OK']
    });
    alert.present();
  }

  showMessage(msg){
    let alert = this.alertCtrl.create({
      title: 'Message',
      subTitle: msg,
      buttons: ['OK']
    });
    alert.present();
  }

  presentConfirm(msg, cancelBtn='Cancel', okBtn='Ok') {
    let alert = this.alertCtrl.create({
      title: 'Confirm',
      message: msg,
      buttons: [
        {
          text: cancelBtn,
          role: 'cancel',
          handler: data => {
            alert.dismiss(false);
            return false;
          }
        },
        {
          text: okBtn,
          handler: data => {
            alert.dismiss(true);
            return false;
          }
        }
      ]
    });
    return alert;
  }

  showNotification(Title, Message){
    let alert = this.alertCtrl.create({
      title: Title,
      subTitle: Message,
      buttons: ['OK']
    });
   return alert.present();
  }

  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom',      
    });  
    toast.present();
  }

  toastForNewMsg(msg){
    let toast = this.toastCtrl.create({
      message: msg,      
      position: 'top',
      cssClass: 'new-message',
      showCloseButton: true,
      closeButtonText: 'View',
      dismissOnPageChange: true,
      duration:2000
    });  
   return toast;
  }


  showPrompt() {
    const prompt = this.alertCtrl.create({
      title: 'Account Verification',
      message: "Enter activation code you received by Email",
      inputs: [
        {
          name: 'activationCode',
          placeholder: 'Activation Code'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            prompt.dismiss('cancel');
            console.log('Cancel clicked');
            return false;
          }
        },
        {
          text: 'Activate',
          handler: data => {
            prompt.dismiss(data);
            console.log('Saved clicked');
            return false;
          }
        }
      ]
    });
      return prompt;
  }

  showForgot(data) {
    const prompt = this.alertCtrl.create({
      title: data.title,
      message: data.msg,
      inputs: [
        {
          type: data.type,
          name: data.name,
          placeholder: data.placeholder
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            prompt.dismiss('cancel');
            console.log('Cancel clicked');
            return false;
          }
        },
        {
          text: 'Reset',
          handler: data => {
            prompt.dismiss(data);
            console.log('Reset clicked');
            return false;
          }
        }
      ]
    });
      return prompt;
  }

  showLoading(message) {
    this.loading = this.loadingCtrl.create({
      content: message,
      dismissOnPageChange:true
    });
    this.loading.present();
  }

  awaitLoading(msg){
    this.loading = this.loadingCtrl.create({
      content: msg,
      dismissOnPageChange:true
    });
    return this.loading;
  }

  hideLoading(){
    if(this.loading){
      console.log('a');
      this.loading.dismiss();
      this.loading = undefined;
    }
  }

  

  // showPrompt(id, activationCode) {
  //   let alert = this.alertCtrl.create({
  //     title: 'Account Verification',
  //     message: 'Enter activation code you received in SMS',
  //     inputs: [{
  //       name: 'activationCode',
  //       placeholder: 'Activation Code'
  //     }],
  //     buttons: [{
  //       text: 'Cancel',
  //       role: 'cancel',
  //       handler: data => {
  //         console.log('Cancel clicked');
  //       }
  //     },
  //     {
  //       text: 'Activate',
  //       handler: data => {
  //         // this.globalVars.showLoading('Validating activation code..')
  //         // console.log('Activation code::' + data.activationCode);
  //         if (activationCode == data.activationCode) {
  //           let payload = {
  //             "actstatus": "Active"
  //           }
  //           // this.httpProvider.updateUserDetail(id, payload)
  //             // .then(data => {
  //             //   this.user = data;
  //             //   this.storage.set('id', this.user.id);
  //             // }, err => {
  //             //   this.globalVars.showAlert('Oops', err.statusMsg)
  //             // });
  //           // this.globalVars.loading.dismiss();
  //           // this.navCtrl.setRoot(HomePage);
  //         } else {
  //           // this.globalVars.showAlert('Invalid code', 'Please enter valid code')
  //           // this.navCtrl.setRoot(Register04VehicleDetailPage);
  //         }
  //       }
  //     }]
  //   });
  //   alert.present();
  // }

}
