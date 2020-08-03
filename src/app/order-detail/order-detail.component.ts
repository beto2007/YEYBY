import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import * as moment from 'moment';
import { ToolsService } from '@app/@shared/services/tools/tools.service';
import { FirebaseService } from '@app/@shared/services/firebase/firebase.service';
import { DeliverersComponent } from '@app/deliverers/deliverers.component';
import { Subscription } from 'rxjs';
import { Logger } from '@core';
const log = new Logger('OrderDetailComponent');

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent implements OnInit {
  isLoading: boolean = false;
  public order: any;
  subscription: Subscription;
  document: AngularFirestoreDocument;

  constructor(
    private afs: AngularFirestore,
    private aRoute: ActivatedRoute,
    private loadingController: LoadingController,
    private tools: ToolsService,
    private firebase: FirebaseService
  ) {
    this.aRoute.params.subscribe((params) => {
      this.closeSubscriptions();
      this.initializeApp(params.id);
    });
  }

  ngOnInit(): void {}

  async initializeApp(id: string) {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      this.document = await this.afs.collection('orders').doc(id);
      this.subscription = this.document.snapshotChanges().subscribe((snap) => {
        this.order = snap.payload.data();
        this.order.id = snap.payload.id;
        this.order.dateStr = moment(this.order.date.toDate()).format('LLLL');
      });
    } catch (error) {
      log.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  sendInformationToDelvererCheck() {
    this.tools.sendInformationToDelvererCheck(this.order, 'send');
  }

  ionViewDidLeave() {
    this.closeSubscriptions();
  }

  closeSubscriptions() {
    try {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    } catch (error) {
      log.error(error);
    }
  }

  public async assignDeliverier(): Promise<void> {
    this.firebase.assignDeliverier(this.order, DeliverersComponent);
  }

  finishOrderAlertConfirm() {
    this.firebase.finishOrderAlertConfirm(this.order.id);
  }
}
