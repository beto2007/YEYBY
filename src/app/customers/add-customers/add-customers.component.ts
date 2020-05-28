import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, ToastController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { DocumentReference } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { ToolsService } from '@app/@shared/services/tools/tools.service';

@Component({
  selector: 'app-add-customers',
  templateUrl: './add-customers.component.html',
  styleUrls: ['./add-customers.component.scss'],
})
export class AddCustomersComponent implements OnInit {
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
    private tools: ToolsService,
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
      const response = await this.afs.collection('customers').doc(id).ref.get();
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
      duration: 6000,
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
      let data: any = this.myForm.value;
      let search: string[] = [];
      data.nameStr = String(data.name).toLocaleLowerCase();
      search = search.concat(this.tools.arraySearch(String(this.myForm.get('name').value)));
      search = search.concat(this.tools.arraySearch(String(this.myForm.get('phone').value)));
      data.search = search;
      data.date = new Date();
      if (this.file) {
        data.image = await this.images();
      }
      const response: DocumentReference = await this.afs.collection('customers').add(data);
      if (response.id) {
        this.close();
        this.presentToast('Cliente agregado correctamente');
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
      let search: string[] = [];
      data.nameStr = String(data.name).toLocaleLowerCase();
      search = search.concat(this.tools.arraySearch(String(this.myForm.get('name').value)));
      search = search.concat(this.tools.arraySearch(String(this.myForm.get('phone').value)));
      data.search = search;
      if (this.file) {
        data.image = await this.images();
      }
      await this.afs.collection('customers').doc(id).update(data);
      this.deletePast();
      this.close();
      this.presentToast('Cliente actualizado correctamente');
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
    var storageRef1 = this.afStorage.ref('customers/' + name);
    const imageResponse1 = await storageRef1.put(this.file);
    const downloadURL1 = await imageResponse1.ref.getDownloadURL();
    image.main.url = downloadURL1;
    image.main.path = 'customers/' + name;
    var storageRef2 = this.afStorage.ref('customers/thumbnail/' + name);
    const imageResponse2 = await storageRef2.putString(this.thumbnailSrc, 'data_url');
    const downloadURL2 = await imageResponse2.ref.getDownloadURL();
    image.thumbnail.url = downloadURL2;
    image.thumbnail.path = 'customers/thumbnail/' + name;
    var storageRef3 = this.afStorage.ref('customers/list/' + name);
    const imageResponse3 = await storageRef3.putString(this.middleSrc, 'data_url');
    const downloadURL3 = await imageResponse3.ref.getDownloadURL();
    image.list.url = downloadURL3;
    image.list.path = 'customers/list/' + name;
    return image;
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
