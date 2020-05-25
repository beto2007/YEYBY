import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ToolsService {
  constructor(private toastController: ToastController) {}

  public dateFormatter(date: any, format: string): string {
    return moment(date).format(format);
  }

  async presentToast(message: string, duration?: number, position?: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: message,
      duration: duration | 6000,
      position: position || 'bottom',
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
        },
      ],
    });
    toast.present();
  }
}
