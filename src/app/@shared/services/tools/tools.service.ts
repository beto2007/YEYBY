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

  async presentToast(message: string, duration?: number) {
    const toast = await this.toastController.create({
      message: message,
      duration: 6000 | duration,
    });
    toast.present();
  }
}
