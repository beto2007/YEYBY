import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, ToastController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { DocumentReference } from '@angular/fire/firestore';
import { ToolsService } from '@app/@shared/services/tools/tools.service';
import { NoWhiteSpaceValidator } from '@shared/validators/noWhiteSpace.validator';
import { EmailValidator } from '@shared/validators/email.validator';
import { MustMatch } from '@shared/helpers/must-match.validator';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-add-yeyby-users',
  templateUrl: './add-yeyby-users.component.html',
  styleUrls: ['./add-yeyby-users.component.scss'],
})
export class AddYeybyUsersComponent implements OnInit {
  error: string | undefined;
  myForm!: FormGroup;
  isLoading = false;
  id: string | undefined;
  imageSrc: any;
  thumbnailSrc: any;
  middleSrc: any;
  file: File;
  imagesPath: string[] = [];
  returnValue: boolean;
  token: string;

  constructor(
    private tools: ToolsService,
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private afs: AngularFirestore,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private http: HttpClient,
    private afAuth: AngularFireAuth
  ) {
    this.createForm();
  }

  async getTOken() {
    this.afAuth.authState.subscribe(async (user) => {
      this.token = await user.getIdToken();
    });
  }

  ngOnInit(): void {
    this.getTOken();
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
      this.thumbnailSrc = await this.tools.thumbnailify(result, 100, 100);
      this.middleSrc = await this.tools.thumbnailify(result, 320, 170);
    }
  }

  async initData(id: string) {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      const response = await this.afs.collection('users').doc(id).ref.get();
      const data = response.data();
      if (data) {
        if (data && data.image) {
          this.imageSrc = data.image.thumbnail.url;
          this.imagesPath.push(data.image.main.path);
          this.imagesPath.push(data.image.thumbnail.path);
          this.imagesPath.push(data.image.list.path);
        }
        this.myForm.clearValidators();
        this.myForm.get('email').clearValidators();
        this.myForm.get('password1').clearValidators();
        this.myForm.get('password2').clearValidators();
        this.myForm.get('name').setValidators([Validators.required]);
        this.myForm.get('phone').setValidators([Validators.required]);
        this.myForm.get('streetAddress').setValidators([Validators.required]);
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
    this.myForm = this.formBuilder.group(
      {
        name: ['', Validators.required],
        phone: ['', Validators.required],
        email: ['', [Validators.required, EmailValidator.isValid]],
        streetAddress: ['', Validators.required],
        references: [''],
        password1: ['', [Validators.required, Validators.minLength(6), NoWhiteSpaceValidator.isValid]],
        password2: ['', [Validators.required]],
      },
      {
        validator: MustMatch('password1', 'password2'),
      }
    );
  }

  fillForm(data: any) {
    this.myForm.setValue({
      name: data && data.name ? data.name : '',
      phone: data && data.phone ? data.phone : '',
      email: data && data.email ? data.email : '',
      streetAddress: data && data.streetAddress ? data.streetAddress : '',
      references: data && data.references ? data.references : '',
      password1: '',
      password2: '',
    });
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 6000,
    });
    toast.present();
  }

  close(data?: any) {
    this.modalController.dismiss(data);
  }

  async add(): Promise<void> {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      if (this.token) {
        const responseInit: any = await this.http
          .post(
            `${environment.firebaseApi}crateUserAuth`,
            {
              token: this.token,
              email: String(this.myForm.get('email').value).toLowerCase(),
              password: String(this.myForm.get('password1').value),
            },
            { observe: 'body' }
          )
          .toPromise();
        if (responseInit && responseInit.status && responseInit.status === 'success') {
          let data: any = this.myForm.value;
          let search: string[] = [];
          data.nameStr = String(data.name).toLocaleLowerCase();
          search = search.concat(this.tools.arraySearch(String(this.myForm.get('name').value)));
          search = search.concat(this.tools.arraySearch(String(this.myForm.get('phone').value)));
          search = search.concat(this.tools.arraySearch(String(this.myForm.get('email').value).toLowerCase()));
          data.search = search;
          data.type = 'yeyby-users';
          data.email = String(this.myForm.get('email').value).toLowerCase();
          data.name = String(data.name).toLocaleLowerCase();
          data.name = String(data.name).replace(/\b(\w)/g, (s) => s.toUpperCase());
          data.date = moment().toDate();
          if (this.file) {
            data.image = await this.tools.images(this.file, this.thumbnailSrc, this.middleSrc, 'users');
          }
          await this.afs.collection('users').doc(responseInit.data.uid).set(data);
          this.presentToast('Usuario agregado correctamente');
        } else {
          this.presentToast('Ha ocurrido un error');
        }
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
      search = search.concat(this.tools.arraySearch(String(this.myForm.get('email').value).toLowerCase()));
      data.search = search;
      data.type = 'yeyby-users';
      data.email = String(this.myForm.get('email').value).toLowerCase();
      data.name = String(data.name).toLocaleLowerCase();
      data.name = String(data.name).replace(/\b(\w)/g, (s) => s.toUpperCase());
      data.date = moment().toDate();
      if (this.file) {
        data.image = await this.tools.images(this.file, this.thumbnailSrc, this.middleSrc, 'users');
      }
      await this.afs.collection('users').doc(id).update(data);
      if (this.file) {
        this.tools.deletePast(this.imagesPath);
      }
      this.close();
      this.presentToast('Cliente actualizado correctamente');
    } catch (error) {
      this.presentToast('Ha ocurrido un error');
      console.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  save() {
    if (this.id) {
      this.update(this.id);
    } else {
      this.add();
    }
  }
}
