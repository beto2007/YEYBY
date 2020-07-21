import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { CompaniesComponent } from '@app/companies/companies.component';
import { CustomersComponent } from '@app/customers/customers.component';
import { AddCustomersComponent } from '@app/customers/add-customers/add-customers.component';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-create-order-by-steps',
  templateUrl: './create-order-by-steps.component.html',
  styleUrls: ['./create-order-by-steps.component.scss'],
})
export class CreateOrderByStepsComponent implements OnInit {
  isLoading: boolean = false;
  customer: any;
  company: any;
  menu: any[];
  companyMenu: any[];
  address: any;
  public otherProduct = {
    isChecked: false,
    description: '',
    price: 0,
    quantity: 1,
  };
  totalOrder: number = 0;
  total: number = 0;
  public shippingPrice: number = 30;
  deliveryLocationReferences: string = '';
  deliveryAddress: string;
  deliveryLocation: string = '';
  public step: number = 1;
  public type: 'orden' | 'envio';

  constructor(
    private afs: AngularFirestore,
    private modalController: ModalController,
    private loadingController: LoadingController
  ) {}

  ngOnInit(): void {}

  public async back(): Promise<void> {
    if (this.step > 1) {
      this.step--;
    }
  }

  public step1(type: 'orden' | 'envio') {
    this.type = type;
    this.step = 2;
  }

  public step2() {
    this.step = 3;
  }

  public step3() {
    this.step = 4;
  }

  public step4() {
    this.step = 5;
  }

  public step5() {
    this.step = 6;
  }

  public finalize() {
    this.reset();
  }

  reset() {
    this.customer = undefined;
    this.company = undefined;
    this.companyMenu = undefined;
    this.menu = undefined;
    this.address = undefined;
    this.otherProduct = {
      isChecked: false,
      description: '',
      price: 0,
      quantity: 1,
    };
    this.totalOrder = 0;
    this.total = 0;
    this.shippingPrice = 30;
    this.deliveryLocationReferences = '';
    this.deliveryAddress = 'default';
    this.deliveryLocation = '';
    this.step = 1;
  }

  public async selectCompany(): Promise<void> {
    const modal = await this.modalController.create({
      component: CompaniesComponent,
      componentProps: { mode: 'modal' },
    });
    modal.onDidDismiss().then(async (response) => {
      this.isLoading = true;
      const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
      loadingOverlay.present();
      if (response && response.data && response.data.item && response.data.item.id) {
        this.company = response.data.item;
        const menu = await this.afs.collection('companies').doc(this.company.id).collection('menu').ref.get();
        this.companyMenu = menu.docs.map((element) => {
          let data = element.data();
          data.quantity = 0;
          const id = element.id;
          return { id, ...data };
        });
        this.step3();
      }
      this.isLoading = false;
      loadingOverlay.dismiss();
    });
    return await modal.present();
  }

  public async selectCustomer(): Promise<void> {
    const modal = await this.modalController.create({
      component: CustomersComponent,
      componentProps: { mode: 'modal' },
    });
    modal.onDidDismiss().then(async (response) => {
      this.isLoading = true;
      const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
      loadingOverlay.present();
      if (response && response.data && response.data.item && response.data.item.id) {
        this.customer = response.data.item;
        this.step2();
      }
      this.isLoading = false;
      loadingOverlay.dismiss();
    });
    return await modal.present();
  }

  public async createCustomer(): Promise<void> {
    const modal = await this.modalController.create({
      component: AddCustomersComponent,
      componentProps: { mode: 'modal' },
    });
    modal.onDidDismiss().then(async (response) => {
      this.isLoading = true;
      const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
      loadingOverlay.present();
      if (response && response.data && response.data.item && response.data.item.id) {
        this.customer = response.data.item;
        this.step2();
      }
      this.isLoading = false;
      loadingOverlay.dismiss();
    });
    return await modal.present();
  }

  calculate() {
    this.totalOrder = 0;
    this.total = 0;

    if (this.companyMenu) {
      this.companyMenu.forEach((item) => {
        if (item.active === true && item.isChecked === true && item.quantity > 0) {
          this.totalOrder = this.totalOrder + item.quantity * item.price;
        }
      });
      this.menu = [];
      this.menu = this.companyMenu.filter((item) => {
        if (item && item.active && item.active === true && item.quantity && item.quantity > 0) {
          return item;
        }
      });
    }
    if (this.otherProduct.isChecked === true && this.otherProduct.quantity > 0) {
      this.totalOrder = this.totalOrder + this.otherProduct.quantity * this.otherProduct.price;
    }
    this.total = this.totalOrder + this.shippingPrice;
  }

  change(event: any) {
    if (event && event.target && event.target.value && event.target.value === 'default') {
      this.address = {
        references: this.customer.references,
        streetAddress: this.customer.streetAddress,
      };
    } else if (event && event.target && event.target.value && event.target.value === 'other') {
      this.address = {
        references: this.deliveryLocationReferences,
        streetAddress: this.deliveryLocation,
      };
    }
  }
}
