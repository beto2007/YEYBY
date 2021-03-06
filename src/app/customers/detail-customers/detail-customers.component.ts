import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { FirebaseService } from '@app/@shared/services/firebase/firebase.service';
import { AddCustomersComponent } from '../add-customers/add-customers.component';
import { Logger } from '@core';
const log = new Logger('DetailCustomersComponent');

@Component({
  selector: 'app-detail-customers',
  templateUrl: './detail-customers.component.html',
  styleUrls: ['./detail-customers.component.scss'],
})
export class DetailCustomersComponent implements OnInit {
  error: string | undefined;
  isLoading = false;
  id: string | undefined;
  imageSrc: any;
  thumbnailSrc: any;
  middleSrc: any;
  file: File;
  imagesPath: string[] = [];

  dataDocument: AngularFirestoreDocument<any>;
  suscription: Subscription;
  data: any;

  constructor(
    private afs: AngularFirestore,
    private aRoute: ActivatedRoute,
    private alertController: AlertController,
    private myFire: FirebaseService,
    private modalController: ModalController
  ) {
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
    } catch (error) {
      log.error(error);
    }
  }

  ngOnInit(): void {}

  initializeApp(id: string) {
    this.dataDocument = this.afs.collection('customers').doc(id);
    this.suscription = this.dataDocument.snapshotChanges().subscribe((snap) => {
      if (snap.payload.exists === true) {
        const data: any = snap.payload.data();
        const id: string = snap.payload.id;
        this.data = { id, ...data };
      }
    });
  }

  async add() {
    const modal = await this.modalController.create({
      component: AddCustomersComponent,
      componentProps: { id: this.data.id },
    });
    return await modal.present();
  }
}
