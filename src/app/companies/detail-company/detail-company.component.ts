import { Component, OnInit } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  DocumentReference,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToolsService } from '@shared/services/tools/tools.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadingController, AlertController, ModalController } from '@ionic/angular';
import { FirebaseService } from '@app/@shared/services/firebase/firebase.service';
import { AddCompanyComponent } from '../add-company/add-company.component';
import { Logger } from '@core';
import { CredentialsService } from '@app/auth';
const log = new Logger('Login');

@Component({
  selector: 'app-detail-company',
  templateUrl: './detail-company.component.html',
  styleUrls: ['./detail-company.component.scss'],
})
export class DetailCompanyComponent implements OnInit {
  error: string | undefined;
  isLoading = false;
  id: string | undefined;
  imageSrc: any;
  thumbnailSrc: any;
  middleSrc: any;
  file: File;
  imagesPath: string[] = [];
  dataDocument: AngularFirestoreDocument<any>;
  menuCollection: AngularFirestoreCollection<any>;
  menu: any[];
  suscription: Subscription;
  suscription2: Subscription;
  data: any;
  myForm!: FormGroup;
  viewForm: boolean = false;
  isAdmin: boolean = false;

  constructor(
    private afs: AngularFirestore,
    private aRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private tools: ToolsService,
    private myFire: FirebaseService,
    private modalController: ModalController,
    private credentialsService: CredentialsService
  ) {
    this.isAdmin =
      this.credentialsService &&
      this.credentialsService.credentials &&
      this.credentialsService.credentials.type &&
      this.credentialsService.credentials.type === 'admin'
        ? true
        : false;
    this.createForm();
    this.aRoute.params.subscribe((params) => {
      this.initializeApp(params.id);
    });
  }

  ionViewDidLeave() {
    this.closeSubscriptions();
  }

  closeSubscriptions() {
    try {
      if (this.suscription) {
        this.suscription.unsubscribe();
      }
      if (this.suscription2) {
        this.suscription2.unsubscribe();
      }
    } catch (error) {
      console.error(error);
    }
  }

  private createForm() {
    this.myForm = this.formBuilder.group({
      name: ['', Validators.required],
      price: [0],
      description: [''],
      observations: [''],
      active: [true],
    });
  }
  ngOnInit(): void {}

  initializeApp(id: string) {
    this.dataDocument = this.afs.collection('companies').doc(id);
    this.suscription = this.dataDocument.snapshotChanges().subscribe(async (snap) => {
      if (snap.payload.exists === true) {
        let data: any = snap.payload.data();
        const id: string = snap.payload.id;
        if (data.user) {
          data.user = (await this.afs.collection('users').doc(data.user).ref.get()).data();
        }
        this.data = { id, ...data };
      }
    });
    this.menuCollection = this.afs
      .collection('companies')
      .doc(id)
      .collection('menu', (ref) => ref.orderBy('nameStr'));
    this.suscription2 = this.menuCollection.snapshotChanges().subscribe((snap) => {
      this.menu = snap.map((item) => {
        const data: any = item.payload.doc.data();
        const id: string = item.payload.doc.id;
        return { id, ...data };
      });
    });
  }

  beautyDate(date: any) {
    return this.tools.dateFormatter(date, 'HH:mm A');
  }

  save() {
    this.add();
  }

  async add(): Promise<void> {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      let data: any = this.myForm.value;
      data.date = new Date();
      data.nameStr = String(data.name).toLocaleLowerCase();
      const response: DocumentReference = await this.afs
        .collection('companies')
        .doc(this.data.id)
        .collection('menu')
        .add(data);
      if (response.id) {
        this.tools.presentToast('Producto agregado correctamente');
        this.myForm.reset();
        this.viewForm = false;
      } else {
        this.tools.presentToast('Ha ocurrido un error');
      }
    } catch (error) {
      this.tools.presentToast('Ha ocurrido un error');
      console.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  async delete(id: string): Promise<void> {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      await this.afs.collection('companies').doc(this.data.id).collection('menu').doc(id).delete();
      this.tools.presentToast('Producto eliminado correctamente');
    } catch (error) {
      console.error(error);
      this.tools.presentToast('Ha ocurrido un error');
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  async presentAlertConfirm(item: any) {
    const alert = await this.alertController.create({
      header: 'Eliminar producto',
      message: `¿Está seguro de eliminar el producto "${item.name}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.delete(item.id);
          },
        },
      ],
    });
    await alert.present();
  }

  async activate(id: string, active: boolean) {
    if (this.isLoading == false) {
      this.isLoading = true;
      const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
      loadingOverlay.present();
      try {
        let data: any = this.myForm.value;
        data.date = new Date();
        data.nameStr = String(data.name).toLocaleLowerCase();
        await this.afs
          .collection('companies')
          .doc(this.data.id)
          .collection('menu')
          .doc(id)
          .update({ active: Boolean(active) });
        this.tools.presentToast('Producto actualizado correctamente');
      } catch (error) {
        this.tools.presentToast('Ha ocurrido un error');
        console.error(error);
      }
      this.isLoading = false;
      loadingOverlay.dismiss();
    }
  }

  async updateCompany() {
    const modal = await this.modalController.create({
      component: AddCompanyComponent,
      componentProps: { id: this.data.id },
    });
    return await modal.present();
  }

  async code() {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      const response1 = (await this.afs.collection('invites').doc(this.data.id).ref.get()).data();
      const response2 = (await this.afs.collection('companies').doc(this.data.id).ref.get()).data();
      if (response1 && response2 && response1.status === 'assigned' && response2.user) {
        this.tools.presentToast(`La empresa '${this.data.name}' ya cuenta con un usuario asignado.`);
      } else {
        if (response1 && response1.code && response1.status === 'pending') {
          this.presentCode(response1.code);
        } else {
          const code: string = this.tools.randomNumber(6);
          const response = await this.afs.collection('invites').doc(this.data.id).set({
            code: code,
            date: new Date(),
            company: this.data.id,
            status: 'pending',
          });
          this.presentCode(code);
        }
      }
    } catch (error) {
      log.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  async presentCode(code: string) {
    const alert = await this.alertController.create({
      header: 'Código de asignación de usuario',
      subHeader: `Empresa: ${this.data.name}`,
      message: `Código: ${code}`,
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
        },
      ],
    });
    await alert.present();
  }
}
