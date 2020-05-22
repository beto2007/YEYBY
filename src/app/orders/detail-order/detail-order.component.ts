import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToolsService } from '@shared/services/tools/tools.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadingController, AlertController, ModalController } from '@ionic/angular';
import { CompaniesComponent } from '@app/companies/companies.component';
import { CustomersComponent } from '@app/customers/customers.component';
import { DeliverersComponent } from '@app/deliverers/deliverers.component';

@Component({
  selector: 'app-detail-order',
  templateUrl: './detail-order.component.html',
  styleUrls: ['./detail-order.component.scss'],
})
export class DetailOrderComponent implements OnInit {
  error: string | undefined;
  isLoading = false;
  dataDocument: AngularFirestoreDocument<any>;
  menuCollection: AngularFirestoreCollection<any>;
  suscription: Subscription;
  suscription2: Subscription;
  data: any;
  myForm1!: FormGroup;
  myForm2!: FormGroup;
  viewForm: boolean = false;

  pickupLocation: string;
  pickupLocationReferences: string;
  pickupType: string = 'default';

  deliveryLocation: string;
  deliveryLocationReferences: string;
  deliveryType: string = 'default';
  noCustomerData: string = '1';
  public menu: any[];
  public shippingPrice: number = 30;
  public otherProduct = {
    isChecked: false,
    description: '',
    price: 0,
    quantity: 1,
  };
  totalOrder: number = 0;
  total: number = 0;

  constructor(
    private afs: AngularFirestore,
    private aRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private tools: ToolsService,
    private modalController: ModalController
  ) {
    this.createForm1();
    this.createForm2();
    this.aRoute.params.subscribe((params) => {
      this.initializeApp(params.id);
    });
  }

  pickupLocationChange() {
    if (this.pickupType === 'default') {
      if (this.data && this.data.company && this.data.company.id) {
        this.pickupLocation = this.data.company.streetAddress;
        this.pickupLocationReferences = this.data.company.references;
      }
    } else {
      this.pickupLocation = '';
      this.pickupLocationReferences = '';
    }
  }

  deliveryLocationChange() {
    if (this.deliveryType === 'default') {
      if (this.data && this.data.customer && this.data.customer.id) {
        this.deliveryLocation = this.data.customer.streetAddress;
        this.deliveryLocationReferences = this.data.customer.references;
      }
    } else {
      this.deliveryLocation = '';
      this.deliveryLocationReferences = '';
    }
  }

  beautyDate(date: any) {
    return this.tools.dateFormatter(date, 'HH:mm A');
  }

  private createForm1() {
    this.myForm1 = this.formBuilder.group({
      add: ['', Validators.required],
      price: [0],
      description: [''],
      observations: [''],
      active: [true],
    });
  }

  private createForm2() {
    this.myForm2 = this.formBuilder.group({
      name: ['', Validators.required],
      price: [0],
      description: [''],
      observations: [''],
      active: [true],
    });
  }

  ngOnInit(): void {}

  initializeMenu(id: string) {
    this.menuCollection = this.afs.collection('companies').doc(id).collection('menu'); //ref.orderBy('nameStr', 'asc');
    this.menuCollection.ref
      .orderBy('nameStr', 'asc')
      .get()
      .then((snap) => {
        this.menu = snap.docs.map((element) => {
          const data: any = element.data();
          data.isChecked = false;
          data.quantity = 1;
          const id: string = element.id;
          return { id, ...data };
        });
      });

    // this.menuCollection = this.afs.collection('companies').doc(id).collection("menu", ref => ref.orderBy('nameStr', 'asc'));
    // this.suscription2 = this.menuCollection.snapshotChanges().subscribe((snap) => {
    //   this.menu = snap.map(element => {
    //     const data: any = element.payload.doc.data();
    //     data.isChecked = false;
    //     data.quantity = 1;
    //     const id: string = element.payload.doc.id;
    //     return { id, ...data }
    //   });
    // });
  }

  initializeApp(id: string) {
    this.dataDocument = this.afs.collection('orders').doc(id);
    this.suscription = this.dataDocument.snapshotChanges().subscribe((snap) => {
      if (snap.payload.exists === true) {
        const data: any = snap.payload.data();
        const id: string = snap.payload.id;
        this.data = { id, ...data };
        if (this.data && this.data.company && this.data.company.id) {
          this.pickupLocation = this.data.company.streetAddress;
          this.pickupLocationReferences = this.data.company.references;
          this.initializeMenu(this.data.company.id);
        }
        if (this.data && this.data.customer && this.data.customer.id) {
          this.deliveryLocation = this.data.customer.streetAddress;
          this.deliveryLocationReferences = this.data.customer.references;
        } else {
          switch (this.noCustomerData) {
            case '1':
              this.deliveryLocation = 'Se asignará al llegar a empresa';
              break;
          }
          this.deliveryLocationReferences = '';
        }
      }
    });
  }

  calculate() {
    this.totalOrder = 0;
    this.total = 0;
    if (this.menu) {
      this.menu.forEach((item) => {
        if (item.active === true && item.isChecked === true && item.quantity > 0) {
          this.totalOrder = this.totalOrder + item.quantity * item.price;
        }
      });
    }
    if (this.otherProduct.isChecked === true && this.otherProduct.quantity > 0) {
      this.totalOrder = this.totalOrder + this.otherProduct.quantity * this.otherProduct.price;
    }
    this.total = this.totalOrder + this.shippingPrice;
  }

  async addCompanyFunc() {
    const modal = await this.modalController.create({
      component: CompaniesComponent,
      componentProps: { mode: 'modal' },
    });
    modal.onDidDismiss().then((response) => {
      if (response && response.data && response.data.item && response.data.item.id) {
        this.updateCompany(response.data.item);
        this.initializeMenu(response.data.item.id);
        this.calculate();
      }
    });
    return await modal.present();
  }

  async addCustomerFunc() {
    const modal = await this.modalController.create({
      component: CustomersComponent,
      componentProps: { mode: 'modal' },
    });
    modal.onDidDismiss().then((response) => {
      if (response && response.data && response.data.item && response.data.item.id) {
        this.updateCustomer(response.data.item);
      }
    });
    return await modal.present();
  }

  async addDelivererFunc() {
    const modal = await this.modalController.create({
      component: DeliverersComponent,
      componentProps: { mode: 'modal' },
    });
    modal.onDidDismiss().then((response) => {
      if (response && response.data && response.data.item && response.data.item.id) {
        this.updateDeliverer(response.data.item);
      }
    });
    return await modal.present();
  }

  async updateCompany(company: any): Promise<void> {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      await this.afs.collection('orders').doc(this.data.id).update({
        company: company,
      });
      this.tools.presentToast('Orden actualizada correctamente');
    } catch (error) {
      this.tools.presentToast('Ha ocurrido un error');
      console.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  async updateCustomer(customer: any): Promise<void> {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      await this.afs.collection('orders').doc(this.data.id).update({
        customer: customer,
      });
      this.tools.presentToast('Orden actualizada correctamente');
    } catch (error) {
      this.tools.presentToast('Ha ocurrido un error');
      console.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  async updateDeliverer(deliverer: any): Promise<void> {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      await this.afs.collection('orders').doc(this.data.id).update({
        deliverer: deliverer,
      });
      this.tools.presentToast('Orden actualizada correctamente');
    } catch (error) {
      this.tools.presentToast('Ha ocurrido un error');
      console.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  async deleteCustomerFunc() {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      await this.afs.collection('orders').doc(this.data.id).update({
        customer: {},
      });
      this.tools.presentToast('Orden actualizada correctamente');
    } catch (error) {
      this.tools.presentToast('Ha ocurrido un error');
      console.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  save() {
    console.log('Guardado');
  }
}
