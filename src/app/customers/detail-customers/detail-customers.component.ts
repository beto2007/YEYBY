import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, ToastController } from '@ionic/angular';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

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
    private modalController: ModalController,
    private afs: AngularFirestore,
    private aRoute: ActivatedRoute,
    private afStorage: AngularFireStorage,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.aRoute.params.subscribe((params) => {
      this.initializeApp(params.id);
    });
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
}
