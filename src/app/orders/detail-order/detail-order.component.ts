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

  async resetOrderConfirm() {
    const alert = await this.alertController.create({
      header: 'Solicitar orden nuevamente',
      message: `¿Está seguro de solicitar nuevamente esta orden?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Solicitar',
          handler: () => {
            this.resetOrder();
          },
        },
      ],
    });
    await alert.present();
  }

  async resetOrder() {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      await this.afs.collection('orders').doc(this.data.id).update({
        status: 'created',
      });
      this.tools.presentToast('Orden actualizada correctamente', undefined, 'top');
    } catch (error) {
      console.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

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

  async sendInformationToDelvererCheck() {
    const alert = await this.alertController.create({
      cssClass: 'ion-text-wrap',
      header: 'Enviar información a repartidor',
      message: `¿Desea enviar la información de la orden generada al repartidor "${this.data.deliverer.name}"?`,
      inputs: [
        // {
        //   name: 'checkbox1',
        //   type: 'checkbox',
        //   label: 'Nombre de la empresa',
        //   value: 'value1',
        //   checked: true
        // },

        {
          name: 'checkbox2',
          type: 'checkbox',
          label: 'Folio de la empresa',
          value: 'value2',
          checked: true,
        },

        {
          name: 'checkbox3',
          type: 'checkbox',
          label: 'Teléfono de la empresa',
          value: 'value3',
          checked: true,
        },

        // {
        //   name: 'checkbox4',
        //   type: 'checkbox',
        //   label: 'Dirección de la empresa',
        //   value: 'value4',
        //   checked: true
        // },

        // {
        //   name: 'checkbox5',
        //   type: 'checkbox',
        //   label: 'Referencias de la empresa',
        //   value: 'value5',
        //   checked: true
        // },

        {
          name: 'checkbox6',
          type: 'checkbox',
          label: 'Nombre de cliente',
          value: 'value6',
          checked: true,
        },

        {
          name: 'checkbox7',
          type: 'checkbox',
          label: 'Folio de cliente',
          value: 'value7',
          checked: true,
        },
        {
          name: 'checkbox8',
          type: 'checkbox',
          label: 'Teléfono de cliente',
          value: 'value8',
          checked: true,
        },
        // {
        //   name: 'checkbox9',
        //   type: 'checkbox',
        //   label: 'Dirección de cliente',
        //   value: 'value9',
        //   checked: true
        // },
        // {
        //   name: 'checkbox10',
        //   type: 'checkbox',
        //   label: 'Referencias de cliente',
        //   value: 'value10',
        //   checked: true
        // }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Enviar',
          handler: (filters: any[]) => {
            this.sendInformationToDelverer(
              this.data.deliverer.phone,
              this.mapInformation(this.filterInformation(filters))
            );
          },
        },
      ],
    });
    await alert.present();
  }

  filterInformation(filters: any[]): any {
    let order: any = {
      folio: this.data.folio,
      date: this.data.startDateStr,
      company: {
        name: this.data.company.name,
        pickupLocation: this.pickupLocation,
        pickupLocationReferences: this.pickupLocationReferences,
      },
      deliverer: {
        name: this.data.deliverer.name,
        folio: this.data.deliverer.folio,
      },
      customer: {},
    };
    let customer: any = {};
    if (this.data && this.data.customer && this.data.customer.id) {
      customer = {
        deliveryLocation: this.deliveryLocation,
        deliveryLocationReferences: this.deliveryLocationReferences,
      };
      customer.exists = true;
    } else {
      customer.name = 'Sin cliente';
      customer.exists = false;
      if (this.noCustomerData === '1') {
        customer.deliveryLocation = 'Se asignará al llegar a empresa';
      }
    }
    order.customer = customer;
    let products: any[] = [];
    this.totalOrder = 0;
    this.total = 0;
    if (this.menu) {
      products = this.menu.filter((item) => {
        if (item.active === true && item.isChecked === true && item.quantity > 0) {
          this.totalOrder = this.totalOrder + item.quantity * item.price;
          return item;
        }
      });
    }
    if (this.otherProduct.isChecked === true && this.otherProduct.quantity > 0) {
      this.totalOrder = this.totalOrder + this.otherProduct.quantity * this.otherProduct.price;
      products.push(this.otherProduct);
    }
    products = products.map((entry) => {
      const data = {
        name: entry && entry.name ? entry.name : entry && entry.description ? entry.description : '',
        observations: entry && entry.observations ? entry.observations : '',
        price: entry && entry.price ? entry.price : '',
        quantity: entry && entry.quantity ? entry.quantity : '',
      };
      return data;
    });
    this.total = this.totalOrder + this.shippingPrice;
    order.total = this.total;
    order.totalOrder = this.totalOrder;
    order.shippingPrice = this.shippingPrice;
    order.products = products;
    filters.forEach((element) => {
      switch (element) {
        case 'value2':
          order.company.folio = this.data.company.folio;
          break;
        case 'value3':
          order.company.phone = this.data.company.phone;
          break;
        case 'value6':
          if (customer.exists === true) {
            order.customer.name = this.data.customer.name;
          }
          break;
        case 'value7':
          if (customer.exists === true) {
            order.customer.folio = this.data.customer.folio;
          }
          break;
        case 'value8':
          if (customer.exists === true) {
            order.customer.phone = this.data.customer.phone;
          }
          break;
      }
    });
    return order;
  }

  mapInformation(order: any): string {
    let message: string = '';
    //Company Info
    message = message + `Orden: ${order.folio}\n`;
    message = message + '---------------------------\n';
    message = message + `Fecha de inicio: ${order.date}\n`;
    message = message + '\n';

    message = message + `Lugar de recolección\n`;
    message = message + '---------------------------\n';
    if (order && order.company && order.company.name) {
      message = message + `Empresa: ${order.company.name}\n`;
    }
    if (order && order.company && order.company.folio) {
      message = message + `Folio: ${order.company.folio}\n`;
    }
    if (order && order.company && order.company.phone) {
      message = message + `Teléfono: ${order.company.phone}\n`;
    }
    if (order && order.company && order.company.pickupLocation) {
      message = message + `Dirección: ${order.company.pickupLocation}\n`;
    }
    if (order && order.company && order.company.pickupLocationReferences) {
      message = message + `Referencias: ${order.company.pickupLocationReferences}\n`;
    }
    message = message + '\n';
    //Products Info
    if (order && order.products) {
      message = message + `Productos:\n`;
      message = message + '---------------------------\n';
      let productStr: string = '';
      Array.from(order.products).forEach((product: any) => {
        if (product && product.name && product.name !== '') {
          productStr = productStr + `(${product.quantity}) ${product.name}\n`;
        }
        if (product && product.observations && product.observations !== '') {
          productStr = productStr + `${product.observations}\n`;
        }
        if (product && product.price && product.price !== '') {
          productStr = productStr + `Precio: $${new Intl.NumberFormat('en-IN').format(Number(product.price))}\n`;
        }
      });
      message = message + productStr;
      message = message + '---------------------------\n';
      message = message + `Costo de orden: $${new Intl.NumberFormat('en-IN').format(Number(order.totalOrder))}\n`;
      message = message + `Costo de envío: $${new Intl.NumberFormat('en-IN').format(Number(order.shippingPrice))}\n`;
      message = message + `Total: $${new Intl.NumberFormat('en-IN').format(Number(order.total))}\n`;
      message = message + '\n';
    }
    //Customer Info
    message = message + `Lugar de entrega\n`;
    message = message + '---------------------------\n';
    if (order && order.customer && order.customer.name) {
      message = message + `Cliente: ${order.customer.name}\n`;
    }
    if (order && order.customer && order.customer.folio) {
      message = message + `Folio: ${order.customer.folio}\n`;
    }
    if (order && order.customer && order.customer.phone) {
      message = message + `Teléfono: ${order.customer.phone}\n`;
    }
    if (order && order.customer && order.customer.deliveryLocation) {
      message = message + `Dirección: ${order.customer.deliveryLocation}\n`;
    }
    if (order && order.customer && order.customer.deliveryLocationReferences) {
      message = message + `Referencias: ${order.customer.deliveryLocationReferences}\n`;
    }
    //Deliverer Info
    message = message + '\n';
    message = message + `El que entrega\n`;
    message = message + '---------------------------\n';
    if (order && order.deliverer && order.deliverer.name) {
      message = message + `Repartidor: ${order.deliverer.name}\n`;
    }
    if (order && order.deliverer && order.deliverer.folio) {
      message = message + `Folio: ${order.deliverer.folio}\n`;
    }
    console.log(message);
    return message;
  }

  sendInformationToDelverer(phone: string, message: string) {
    var ref = window.open(
      `https://api.whatsapp.com/send?phone=521${phone}&text=${encodeURIComponent(message)}&source=&data=&app_absent=`,
      '_whatsapp'
    );
  }
}
