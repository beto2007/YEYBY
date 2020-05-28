import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ToolsService {
  removeAccents = (str: string) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  unique = (value: any, index: any, self: any) => {
    return self.indexOf(value) === index;
  };

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

  public stringSearch(str: string): string {
    str = str.trim();
    var noTildes: string = this.removeAccents(str);
    const search: string = noTildes.replace(/[^a-zA-Z0-9]/g, '').toLocaleLowerCase();
    return search;
  }

  public arraySearch(fullName: string): string[] {
    const minLength = 3;
    fullName = fullName.trim();
    var noTildes: string = this.removeAccents(fullName);
    const search: string = noTildes.replace(/[^a-zA-Z0-9\sñ]/g, '').toLocaleLowerCase();
    let tempArray: string[] = [];
    tempArray = tempArray.concat(fullName.split(' '));
    tempArray = tempArray.concat(noTildes.split(' '));
    tempArray = tempArray.concat(search.split(' '));
    tempArray.forEach((name) => {
      if (name.length > minLength) {
        for (let i = name.length; i >= minLength; i--) {
          tempArray.push(name.substring(0, i));
        }
      }
    });
    if (fullName.length > minLength) {
      for (let i = fullName.length; i >= minLength; i--) {
        tempArray.push(fullName.substring(0, i));
      }
    }
    if (noTildes.length > minLength) {
      for (let i = noTildes.length; i >= minLength; i--) {
        tempArray.push(noTildes.substring(0, i));
      }
    }
    if (search.length > minLength) {
      for (let i = search.length; i >= minLength; i--) {
        tempArray.push(search.substring(0, i));
      }
    }
    tempArray = tempArray.filter(this.unique);
    return tempArray;
  }
}
