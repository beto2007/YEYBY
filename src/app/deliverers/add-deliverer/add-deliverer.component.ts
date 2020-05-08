import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, ToastController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { DocumentReference } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';

@Component({
  selector: 'app-add-deliverer',
  templateUrl: './add-deliverer.component.html',
  styleUrls: ['./add-deliverer.component.scss'],
})
export class AddDelivererComponent implements OnInit {
  error: string | undefined;
  myForm!: FormGroup;
  isLoading = false;
  id: string | undefined;
  imageSrc: any;
  thumbnailSrc: any;
  middleSrc: any;
  file: File;
  imagesPath: string[] = [];

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private afs: AngularFirestore,
    private afStorage: AngularFireStorage,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    if (this.id) {
      this.initData(this.id);
    }
  }

  async readURL(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => (this.imageSrc = reader.result);
      reader.readAsDataURL(this.file);
      const toBase64 = (file: any) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
      const result: string = String(await toBase64(this.file).catch((e) => Error(e)));
      this.thumbnailSrc = await this.thumbnailify(result, 100, 100);
      this.middleSrc = await this.thumbnailify(result, 320, 170);
    }
  }

  async initData(id: string) {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      const response = await this.afs.collection('deliverers').doc(id).ref.get();
      const data = response.data();
      if (data) {
        if (data && data.image) {
          this.imageSrc = data.image.thumbnail.url;
          this.imagesPath.push(data.image.main.path);
          this.imagesPath.push(data.image.thumbnail.path);
          this.imagesPath.push(data.image.list.path);
        }
        this.fillForm(data);
      }
    } catch (error) {
      this.presentToast('Ha ocurrido un error');
      console.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  private createForm() {
    this.myForm = this.formBuilder.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      email: [''],
      streetAddress: ['', Validators.required],
      references: [''],
    });
  }

  fillForm(data: any) {
    this.myForm.setValue({
      name: data && data.name ? data.name : '',
      phone: data && data.phone ? data.phone : '',
      email: data && data.owner ? data.owner : '',
      streetAddress: data && data.streetAddress ? data.streetAddress : '',
      references: data && data.references ? data.references : '',
    });
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
    });
    toast.present();
  }

  close() {
    this.modalController.dismiss({ modification: false });
  }

  async add(): Promise<void> {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      this.createSearchLabels([String(this.myForm.get('name').value), String(this.myForm.get('phone').value)]);
      let data: any = this.myForm.value;
      data.nameStr = String(data.name).toLocaleLowerCase();
      data.search = this.createSearchLabels([
        String(this.myForm.get('name').value),
        String(this.myForm.get('phone').value),
      ]);
      data.date = new Date();
      if (this.file) {
        data.image = await this.images();
      }
      const response: DocumentReference = await this.afs.collection('deliverers').add(data);
      if (response.id) {
        this.close();
        this.presentToast('Repartidor agregado correctamente');
      } else {
        this.presentToast('Ha ocurrido un error');
      }
    } catch (error) {
      this.presentToast('Ha ocurrido un error');
      console.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  async update(id: string): Promise<void> {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      let data: any = this.myForm.value;
      data.nameStr = String(data.name).toLocaleLowerCase();
      data.search = this.createSearchLabels([
        String(this.myForm.get('name').value),
        String(this.myForm.get('phone').value),
      ]);
      if (this.file) {
        data.image = await this.images();
      }
      await this.afs.collection('deliverers').doc(id).update(data);
      this.deletePast();
      this.close();
      this.presentToast('Repartidor actualizado correctamente');
    } catch (error) {
      this.presentToast('Ha ocurrido un error');
      console.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  async images() {
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
    const name = random + this.file.name;
    var storageRef1 = this.afStorage.ref('deliverers/' + name);
    const imageResponse1 = await storageRef1.put(this.file);
    const downloadURL1 = await imageResponse1.ref.getDownloadURL();
    image.main.url = downloadURL1;
    image.main.path = 'deliverers/' + name;
    var storageRef2 = this.afStorage.ref('deliverers/thumbnail/' + name);
    const imageResponse2 = await storageRef2.putString(this.thumbnailSrc, 'data_url');
    const downloadURL2 = await imageResponse2.ref.getDownloadURL();
    image.thumbnail.url = downloadURL2;
    image.thumbnail.path = 'deliverers/thumbnail/' + name;
    var storageRef3 = this.afStorage.ref('deliverers/list/' + name);
    const imageResponse3 = await storageRef3.putString(this.middleSrc, 'data_url');
    const downloadURL3 = await imageResponse3.ref.getDownloadURL();
    image.list.url = downloadURL3;
    image.list.path = 'deliverers/list/' + name;
    return image;
  }

  createSearchLabels(searchTerms: string[]): string[] {
    let chars = {
      á: 'a',
      é: 'e',
      í: 'i',
      ó: 'o',
      ú: 'u',
      à: 'a',
      è: 'e',
      ì: 'i',
      ò: 'o',
      ù: 'u',
      ñ: 'n',
      Á: 'A',
      É: 'E',
      Í: 'I',
      Ó: 'O',
      Ú: 'U',
      À: 'A',
      È: 'E',
      Ì: 'I',
      Ò: 'O',
      Ù: 'U',
      Ñ: 'N',
    };
    let expr1 = /[áàéèíìóòúùñ]/gi;
    let expr2 = /[`~!@#$%^&*()_|+\-=?;:'",.<>´\{\}\[\]\\\/]/gi;
    let tempArray: string[] = [];
    const unique = (value: any, index: any, self: any) => {
      return self.indexOf(value) === index;
    };
    for (let i = 0; i < searchTerms.length; i++) {
      const str = searchTerms[i];

      const strToLowerCase = str.toLocaleLowerCase();
      const strSinAcentos = str.replace(expr1, function (e) {
        return chars[e];
      });
      const toLocaleLCSA = strToLowerCase.replace(expr1, function (e) {
        return chars[e];
      });
      const strNoEspChar = str.replace(expr2, '');
      const toLocaleLCEP = toLocaleLCSA.replace(expr1, function (e) {
        return chars[e];
      });
      const includeAll = str
        .toLocaleLowerCase()
        .replace(expr1, function (e) {
          return chars[e];
        })
        .replace(expr2, '');

      const strNoWhite1 = str.replace(/\s/g, '');
      const strNoWhite2 = strToLowerCase.replace(/\s/g, '');
      const strNoWhite3 = strSinAcentos.replace(/\s/g, '');
      const strNoWhite4 = strNoEspChar.replace(/\s/g, '');
      const strNoWhite5 = toLocaleLCSA.replace(/\s/g, '');
      const strNoWhite6 = toLocaleLCEP.replace(/\s/g, '');
      const strNoWhite7 = includeAll.replace(/\s/g, '');

      const array1 = str.split(' ');
      const array2 = strToLowerCase.split(' ');
      const array3 = strSinAcentos.split(' ');
      const array4 = strNoEspChar.split(' ');
      const array5 = strSinAcentos.split(' ');
      const array6 = strNoEspChar.split(' ');
      const array7 = includeAll.split(' ');

      tempArray.push(str);
      tempArray.push(strToLowerCase);
      tempArray.push(strSinAcentos);
      tempArray.push(strNoEspChar);
      tempArray.push(toLocaleLCSA);
      tempArray.push(toLocaleLCEP);
      tempArray.push(includeAll);

      tempArray.push(strNoWhite1);
      tempArray.push(strNoWhite2);
      tempArray.push(strNoWhite3);
      tempArray.push(strNoWhite4);
      tempArray.push(strNoWhite5);
      tempArray.push(strNoWhite6);
      tempArray.push(strNoWhite7);

      tempArray = tempArray.concat(array1);
      tempArray = tempArray.concat(array2);
      tempArray = tempArray.concat(array3);
      tempArray = tempArray.concat(array4);
      tempArray = tempArray.concat(array5);
      tempArray = tempArray.concat(array6);
      tempArray = tempArray.concat(array7);
    }
    const minLenght: number = 5;
    tempArray = tempArray.filter(unique);
    let tempArray2: string[] = [];
    for (let i = 0; i < tempArray.length; i++) {
      const str = tempArray[i];
      if (str.length > minLenght) {
        for (let ii = str.length; ii >= minLenght; ii--) {
          tempArray2.push(str.substring(0, ii));
        }
      }
    }
    tempArray = tempArray.concat(tempArray2);
    tempArray = tempArray.filter(unique);
    tempArray = tempArray.filter((element) => {
      if (element.length >= minLenght) {
        return element;
      }
    });
    return tempArray;
  }

  save() {
    if (this.id) {
      this.update(this.id);
    } else {
      this.add();
    }
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

  async deletePast() {
    let promises: Promise<any>[] = [];
    const storageRef = this.afStorage.storage.ref();
    this.imagesPath.forEach((element) => {
      promises.push(storageRef.child(element).delete());
    });
    await Promise.all(promises);
  }
}
