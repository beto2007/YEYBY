import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { ToastController } from '@ionic/angular';
import { AngularFireStorage } from '@angular/fire/storage';

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

  constructor(private toastController: ToastController, private afStorage: AngularFireStorage) {}

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

  async thumbnailify(base64Image: string, targetWidth: number, targetHeight: number) {
    var img = new Image();
    const newImage = () =>
      new Promise((resolve, reject) => {
        img.onload = () => {
          var width = img.width,
            height = img.height,
            canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          ctx.drawImage(
            img,
            width > height ? (width - height) / 2 : 0,
            height > width ? (height - width) / 2 : 0,
            width > height ? height : width,
            width > height ? height : width,
            0,
            0,
            targetWidth,
            targetHeight
          );
          resolve(canvas.toDataURL());
        };
        img.onerror = (error) => reject(error);
      });
    img.src = base64Image;
    return newImage();
  }

  async images(file: File, thumbnailSrc: any, middleSrc: any, bucket: string) {
    let image = {
      main: {
        url: '',
        path: '',
      },
      thumbnail: {
        url: '',
        path: '',
      },
      list: {
        url: '',
        path: '',
      },
    };
    const random = new Date().getMilliseconds();
    const name = random + file.name;
    var storageRef1 = this.afStorage.ref(bucket + '/' + name);
    const imageResponse1 = await storageRef1.put(file);
    const downloadURL1 = await imageResponse1.ref.getDownloadURL();
    image.main.url = downloadURL1;
    image.main.path = bucket + '/' + name;
    var storageRef2 = this.afStorage.ref(bucket + '/thumbnail/' + name);
    const imageResponse2 = await storageRef2.putString(thumbnailSrc, 'data_url');
    const downloadURL2 = await imageResponse2.ref.getDownloadURL();
    image.thumbnail.url = downloadURL2;
    image.thumbnail.path = bucket + '/thumbnail/' + name;
    var storageRef3 = this.afStorage.ref(bucket + '/list/' + name);
    const imageResponse3 = await storageRef3.putString(middleSrc, 'data_url');
    const downloadURL3 = await imageResponse3.ref.getDownloadURL();
    image.list.url = downloadURL3;
    image.list.path = bucket + '/list/' + name;
    return image;
  }

  async deletePast(imagesPath: string[]) {
    let promises: Promise<any>[] = [];
    const storageRef = this.afStorage.storage.ref();
    imagesPath.forEach((element) => {
      promises.push(storageRef.child(element).delete());
    });
    await Promise.all(promises);
  }

  sendInformationToDelverer(phone: string, message: string) {
    var ref = window.open(
      `https://api.whatsapp.com/send?phone=521${phone}&text=${encodeURIComponent(message)}&source=&data=&app_absent=`,
      '_whatsapp'
    );
  }

  randomNumber(length: number): string {
    var result = '';
    var characters = '0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  randomChain(length: number): string {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  public beautyDate(date: any) {
    return this.dateFormatter(date, 'DD/MM/YYYY h:mm A');
  }

  public getMinutes(date: Date): string {
    let times: string;
    let diff: any = moment().diff(date, 'minutes');
    if (diff > 60) {
      const hours = Math.floor(diff / 60);
      let _hour;
      if (hours > 1) {
        _hour = `${hours} horas`;
      } else {
        _hour = '1 hora';
      }
      const minutes = Math.floor(diff % 60);
      let _minutes;
      if (minutes === 0) {
        _minutes = '';
      }
      if (minutes > 1) {
        _minutes = `y ${minutes} minutos`;
      } else {
        _minutes = 'y 1 minuto';
      }
      times = `${_hour} ${_minutes}`;
    } else if (diff === 0) {
      times = 'Hace un momento';
    } else {
      if (diff > 1) {
        times = `${diff} minutos`;
      } else {
        times = '1 minuto';
      }
    }
    return String(times);
  }
}
