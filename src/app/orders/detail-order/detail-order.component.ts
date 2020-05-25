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
import { FirebaseService } from '@app/@shared/services/firebase/firebase.service';

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
  flagData1: boolean;
  flagData2: boolean;

  constructor(
    private afs: AngularFirestore,
    private aRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private tools: ToolsService,
    private modalController: ModalController,
    private myFire: FirebaseService
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
      if (this.flagData1 == true) {
        this.flagData1 = false;
      } else {
        this.pickupLocation = '';
        this.pickupLocationReferences = '';
      }
    }
  }

  deliveryLocationChange() {
    if (this.deliveryType === 'default') {
      if (this.data && this.data.customer && this.data.customer.id) {
        this.deliveryLocation = this.data.customer.streetAddress;
        this.deliveryLocationReferences = this.data.customer.references;
      }
    } else {
      if (this.flagData2 == true) {
        this.flagData2 = false;
      } else {
        this.deliveryLocation = '';
        this.deliveryLocationReferences = '';
      }
    }
  }

  beautyDate(date: any) {
    return this.tools.dateFormatter(date, 'DD/MM/YYYY h:mm A');
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

  async initializeMenu(id: string, data: any) {
    this.menuCollection = this.afs.collection('companies').doc(id).collection('menu');
    await this.menuCollection.ref
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
        if (data && data.order && data.order.products) {
          const products: any[] = data.order.products;
          this.menu = this.menu.map((item) => {
            const index: number = products.map((i) => i.id).indexOf(item.id);
            if (index > -1) {
              return products[index];
            } else {
              return item;
            }
          });
        }
      });
  }

  async initializeApp(id: string) {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      await this.getDocData(id);
    } catch (error) {
      console.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  getDocData(id: string) {
    return new Promise(async (resolve, reject) => {
      try {
        this.dataDocument = this.afs.collection('orders').doc(id);
        this.suscription = this.dataDocument.snapshotChanges().subscribe(
          async (snap) => {
            if (snap.payload.exists === true) {
              const data: any = snap.payload.data();
              const id: string = snap.payload.id;
              data.dateStr = data.date && data.date !== '' ? this.beautyDate(data.date.toDate()) : '';
              data.startDateStr =
                data.startDate && data.startDate !== '' ? this.beautyDate(data.startDate.toDate()) : '';
              data.finishDateStr =
                data.finishDate && data.finishDate !== '' ? this.beautyDate(data.finishDate.toDate()) : '';
              let tempData = { id, ...data };
              if (tempData && tempData.company && tempData.company.id) {
                this.pickupLocation = tempData.company.streetAddress;
                this.pickupLocationReferences = tempData.company.references;
                if (
                  !(
                    this.data &&
                    this.data.company &&
                    tempData &&
                    tempData.company &&
                    tempData.company.id &&
                    this.data.company.id === tempData.company.id
                  )
                ) {
                  await this.initializeMenu(tempData.company.id, tempData);
                }
              }
              if (tempData && tempData.customer && tempData.customer.id) {
                this.deliveryLocation = tempData.customer.streetAddress;
                this.deliveryLocationReferences = tempData.customer.references;
              } else {
                switch (this.noCustomerData) {
                  case '1':
                    this.deliveryLocation = 'Se asignará al llegar a empresa';
                    break;
                }
                this.deliveryLocationReferences = '';
              }
              if (tempData && tempData.order) {
                this.flagData1 = true;
                this.flagData2 = true;
                if (tempData.order) {
                  this.otherProduct = tempData.order.otherProduct;
                  this.shippingPrice = tempData.order.shippingPrice;
                }
                if (tempData.order.company.pickupType === 'other') {
                  this.pickupLocation = tempData.order.company.pickupLocation;
                  this.pickupLocationReferences = tempData.order.company.pickupLocationReferences;
                  this.pickupType = tempData.order.company.pickupType;
                }
                if (tempData.order.customer.deliveryType === 'other') {
                  this.deliveryLocation = tempData.order.customer.deliveryLocation;
                  this.deliveryLocationReferences = tempData.order.customer.deliveryLocationReferences;
                  this.deliveryType = tempData.order.customer.deliveryType;
                } else {
                  this.noCustomerData = tempData.order.customer.noCustomerData;
                }
              }
              this.data = tempData;
              resolve(this.data);
            }
          },
          (error) => {
            reject(error);
          }
        );
      } catch (error) {
        reject(error);
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
    modal.onDidDismiss().then(async (response) => {
      this.isLoading = true;
      const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
      loadingOverlay.present();
      if (response && response.data && response.data.item && response.data.item.id) {
        await this.updateCompany(response.data.item);
        await this.initializeMenu(response.data.item.id, this.data);
        this.calculate();
      }
      this.isLoading = false;
      loadingOverlay.dismiss();
    });
    return await modal.present();
  }

  async addCustomerFunc() {
    const modal = await this.modalController.create({
      component: CustomersComponent,
      componentProps: { mode: 'modal' },
    });
    modal.onDidDismiss().then(async (response) => {
      this.isLoading = true;
      const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
      loadingOverlay.present();
      if (response && response.data && response.data.item && response.data.item.id) {
        this.updateCustomer(response.data.item);
      }
      this.isLoading = false;
      loadingOverlay.dismiss();
    });
    return await modal.present();
  }

  async addDelivererFunc() {
    const modal = await this.modalController.create({
      component: DeliverersComponent,
      componentProps: { mode: 'modal' },
    });
    modal.onDidDismiss().then(async (response) => {
      this.isLoading = true;
      const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
      loadingOverlay.present();
      if (response && response.data && response.data.item && response.data.item.id) {
        this.updateDeliverer(response.data.item);
      }
      this.isLoading = false;
      loadingOverlay.dismiss();
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
      this.tools.presentToast('Orden actualizada correctamente', undefined, 'top');
    } catch (error) {
      this.tools.presentToast('Ha ocurrido un error', undefined, 'top');
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
      this.tools.presentToast('Orden actualizada correctamente', undefined, 'top');
    } catch (error) {
      this.tools.presentToast('Ha ocurrido un error', undefined, 'top');
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
      this.tools.presentToast('Orden actualizada correctamente', undefined, 'top');
    } catch (error) {
      this.tools.presentToast('Ha ocurrido un error', undefined, 'top');
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
      this.tools.presentToast('Orden actualizada correctamente', undefined, 'top');
    } catch (error) {
      this.tools.presentToast('Ha ocurrido un error', undefined, 'top');
      console.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  async save(message: boolean) {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    let customer: any = {};
    let products: any[] = [];
    if (this.menu) {
      this.menu.forEach((item) => {
        if (item.active === true && item.isChecked === true && item.quantity > 0) {
          products.push(item);
        }
      });
    }
    if (this.data && this.data.customer && this.data.customer.id) {
      customer = {
        deliveryLocation: this.deliveryLocation,
        deliveryLocationReferences: this.deliveryLocationReferences,
        deliveryType: this.deliveryType,
      };
    } else {
      customer = {
        noCustomerData: this.noCustomerData,
      };
    }
    let order: any = {
      company: {
        pickupLocation: this.pickupLocation,
        pickupLocationReferences: this.pickupLocationReferences,
        pickupType: this.pickupType,
      },
      customer: customer,
      products: products,
      otherProduct: this.otherProduct,
      shippingPrice: this.shippingPrice,
    };
    try {
      await this.afs.collection('orders').doc(this.data.id).update({
        order: order,
      });
      if (message == true) {
        this.tools.presentToast('Orden actualizada correctamente', undefined, 'top');
      }
    } catch (error) {
      this.tools.presentToast('Ha ocurrido un error', undefined, 'top');
      console.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  async completeOrderConfirm() {
    const alert = await this.alertController.create({
      header: 'Completar orden',
      message: `La orden con folio: ${this.data.folio} que intenta iniciar entrega, esta incompleta por favor completa la orden y continua.`,
      buttons: [
        {
          text: 'Ok',
        },
      ],
    });
    await alert.present();
  }

  async startOrderConfirm() {
    const alert = await this.alertController.create({
      header: 'Iniciar entrega',
      message: `¿Está seguro de iniciar la entrega de la orden con folio: ${this.data.folio}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Iniciar',
          handler: () => {
            this.startOrder();
          },
        },
      ],
    });
    await alert.present();
  }

  async startOrder() {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      await this.save(false);
      const canStart = await this.myFire.canStartOrder(this.data.id);
      if (canStart === true) {
        this.tools.presentToast('Orden iniciada', undefined, 'top');
      } else {
        this.completeOrderConfirm();
      }
    } catch (error) {
      console.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  async orderDelivered() {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      await this.myFire.orderDelivered(this.data.id);
    } catch (error) {
      console.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  async cancelDelivery() {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      await this.myFire.cancelDelivery(this.data.id);
    } catch (error) {
      console.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  async cancelOrder() {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      await this.myFire.cancelOrder(this.data.id);
    } catch (error) {
      console.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  async cancelOrderConfirm() {
    const alert = await this.alertController.create({
      header: 'Cancelar orden',
      message: `¿Está seguro de cancelar la orden con folio: ${this.data.folio}?`,
      buttons: [
        {
          text: 'Salir',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Cancelar orden',
          handler: () => {
            this.cancelOrder();
          },
        },
      ],
    });
    await alert.present();
  }

  async cancelDeliveryConfirm() {
    const alert = await this.alertController.create({
      header: 'Cancelar entrega',
      message: `¿Está seguro de cancelar la entrega de la orden con folio: ${this.data.folio}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Cancelar entrega',
          handler: () => {
            this.cancelDelivery();
          },
        },
      ],
    });
    await alert.present();
  }

  async orderDeliveredConfirm() {
    const alert = await this.alertController.create({
      header: 'Orden entregada',
      message: `¿La orden con folio: ${this.data.folio}, ha sido entregada?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Orden entregada',
          handler: () => {
            this.orderDelivered();
          },
        },
      ],
    });
    await alert.present();
  }
}
