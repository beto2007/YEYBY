import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AddYeybyUsersComponent } from '../add-yeyby-users/add-yeyby-users.component';
import { Logger } from '@core';
const log = new Logger('DetailYeybyUsersComponent');

@Component({
  selector: 'app-detail-yeyby-users',
  templateUrl: './detail-yeyby-users.component.html',
  styleUrls: ['./detail-yeyby-users.component.scss'],
})
export class DetailYeybyUsersComponent implements OnInit {
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

  constructor(private afs: AngularFirestore, private aRoute: ActivatedRoute, private modalController: ModalController) {
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
    this.dataDocument = this.afs.collection('users').doc(id);
    this.suscription = this.dataDocument.snapshotChanges().subscribe((snap) => {
      if (snap.payload.exists === true) {
        const data: any = snap.payload.data();
        const id: string = snap.payload.id;
        this.data = { id, ...data };
        this.company(id);
      }
    });
  }

  async company(id: string) {
    try {
      const response = await this.afs.collection('companies').ref.where('user', '==', id).get();
      if (response.empty === false) {
        this.data.company = response.docs[0].data();
      }
    } catch (error) {
      log.error(error);
    }
  }

  async add() {
    const modal = await this.modalController.create({
      component: AddYeybyUsersComponent,
      componentProps: { id: this.data.id },
    });
    return await modal.present();
  }
}
