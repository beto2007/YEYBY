import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';
import * as moment from 'moment';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent implements OnInit {
  isLoading: boolean = false;
  public data: any;

  constructor(
    private afs: AngularFirestore,
    private aRoute: ActivatedRoute,
    private loadingController: LoadingController
  ) {
    this.aRoute.params.subscribe((params) => {
      this.initializeApp(params.id);
    });
  }

  ngOnInit(): void {}

  async initializeApp(id: string) {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      const response = await this.afs.collection('orders').doc(id).ref.get();
      this.data = response.data();
      this.data.date = moment(this.data.date.toDate()).format('LLLL');
    } catch (error) {
      console.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }
}
