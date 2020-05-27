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
import { LoadingController, AlertController } from '@ionic/angular';
import { FirebaseService } from '@app/@shared/services/firebase/firebase.service';

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

  constructor(
    private afs: AngularFirestore,
    private aRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private tools: ToolsService,
    private myFire: FirebaseService
  ) {
    this.createForm();
    this.aRoute.params.subscribe((params) => {
      this.initializeApp(params.id);
    });
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
    this.suscription = this.dataDocument.snapshotChanges().subscribe((snap) => {
      if (snap.payload.exists === true) {
        const data: any = snap.payload.data();
        const id: string = snap.payload.id;
        this.data = { id, ...data };
      }
    });
    this.menuCollection = this.afs
      .collection('companies')
      .doc(id)
      .collection('menu', (ref) => ref.orderBy('nameStr'));
    this.suscription = this.menuCollection.snapshotChanges().subscribe((snap) => {
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

  async generateOrderConfirm() {
    const alert = await this.alertController.create({
      header: 'Generar orden',
      message: `¿Está seguro de generar nueva orden?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Generar orden',
          handler: () => {
            this.myFire.createOrder(this.data.id, 'company');
          },
        },
      ],
    });
    await alert.present();
  }
}
