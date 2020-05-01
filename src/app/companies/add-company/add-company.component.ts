import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, ToastController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { DocumentReference } from '@angular/fire/firestore';
import { from } from 'rxjs';
import { database } from 'firebase';

@Component({
  selector: 'app-add-company',
  templateUrl: './add-company.component.html',
  styleUrls: ['./add-company.component.scss'],
})
export class AddCompanyComponent implements OnInit {
  error: string | undefined;
  myForm!: FormGroup;
  isLoading = false;
  id: string | undefined;

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private afs: AngularFirestore,
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

  async initData(id: string) {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    from(loadingOverlay.present());
    try {
      const response = await this.afs.collection('companies').doc(id).ref.get();
      const data = response.data();
      if (data) {
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
      owner: ['', Validators.required],
      description: [''],
      streetAddress: ['', Validators.required],
      references: ['', Validators.required],
    });
  }

  fillForm(data: any) {
    this.myForm.setValue({
      name: data && data.name ? data.name : '',
      phone: data && data.phone ? data.phone : '',
      owner: data && data.owner ? data.owner : '',
      description: data && data.description ? data.description : '',
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
    from(loadingOverlay.present());
    try {
      let data: any = this.myForm.value;
      data.nameStr = String(data.name).toLocaleLowerCase();
      data.date = new Date();
      const response: DocumentReference = await this.afs.collection('companies').add(data);
      if (response.id) {
        this.close();
        this.presentToast('Empresa agregada correctamente');
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
    from(loadingOverlay.present());
    try {
      let data: any = this.myForm.value;
      data.nameStr = String(data.name).toLocaleLowerCase();
      await this.afs.collection('companies').doc(id).update(data);
      this.close();
      this.presentToast('Empresa actualizada correctamente');
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
