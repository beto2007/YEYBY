import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { CompaniesComponent } from '@app/companies/companies.component';
import { CustomersComponent } from '@app/customers/customers.component';
import { AngularFirestore } from '@angular/fire/firestore';
import * as moment from 'moment';
import { ToolsService } from '@app/@shared/services/tools/tools.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Logger } from '@core';
const log = new Logger('CreateOrderByStepsComponent');

@Component({
  selector: 'app-create-order-by-steps',
  templateUrl: './create-order-by-steps.component.html',
  styleUrls: ['./create-order-by-steps.component.scss'],
})
export class CreateOrderByStepsComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  customer: any;
  company: any;
  menu: any[];
  companyMenu: any[];
  address: any;
  address2: any;
  totalOrder: number = 0;
  total: number = 0;
  public shippingPrice: number = 30;
  deliveryLocationReferences: string = '';
  collectionLocationReferences: string = '';
  deliveryAddress: string = 'default';
  collectionAddress: string = 'default';
  deliveryLocation: string = '';
  collectionLocation: string = '';
  public step: number = 1;
  public type: 'orden' | 'envio';

  constructor(
    private afs: AngularFirestore,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private tools: ToolsService,
    private aRoute: ActivatedRoute,
    private router: Router
  ) {
    this.aRoute.params.subscribe((params) => {
      if (params && params.type && (params.type === 'orden' || params.type === 'envio')) {
        this.step1(params.type);
      }
    });
  }

  reset() {
    this.type = undefined;
    this.customer = undefined;
    this.company = undefined;
    this.companyMenu = undefined;
    this.menu = undefined;
    this.address = undefined;
    this.totalOrder = 0;
    this.total = 0;
    this.shippingPrice = 30;
    this.deliveryLocationReferences = '';
    this.deliveryAddress = 'default';
    this.deliveryLocation = '';
    this.collectionLocationReferences = '';
    this.collectionAddress = 'default';
    this.collectionLocation = '';
    this.step = 1;
  }

  result() {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  async save() {
    try {
      let order = {};
      if (this.type === 'orden') {
        order = {
          search: [],
          type: this.type,
          deliveryPlace: this.address,
          collectionPlace: {
            streetAddress: this.company.streetAddress,
            references: this.company.references,
          },
          customer: {
            id: this.customer.id,
            folio: this.customer.folio,
            name: this.customer.name,
            phone: this.customer.phone,
            image: this.customer && this.customer.image ? this.customer.image : {},
          },
          menu: this.menu,
          company: {
            id: this.company.id,
            folio: this.company.folio,
            name: this.company.name,
            phone: this.company.phone,
            streetAddress: this.company.streetAddress,
            references: this.company.references,
            image: this.company && this.company.image ? this.company.image : {},
          },
          totalOrder: this.totalOrder,
          shippingPrice: this.shippingPrice,
          total: this.total,
          date: moment().toDate(),
          status: 'pending',
        };
      } else {
        order = {
          search: [],
          type: this.type,
          deliveryPlace: this.address,
          collectionPlace: this.address2,
          customer: {
            id: this.customer.id,
            folio: this.customer.folio,
            name: this.customer.name,
            phone: this.customer.phone,
            image: this.customer && this.customer.image ? this.customer.image : {},
          },
          totalOrder: this.totalOrder,
          shippingPrice: this.shippingPrice,
          total: this.total,
          date: moment().toDate(),
          status: 'pending',
        };
      }
      await this.afs.collection('orders').add(order);
    } catch (error) {
      log.error(error);
    }
  }

  public async back(): Promise<void> {
    if (this.step > 1) {
      this.step--;
    }
  }

  public step1(type: 'orden' | 'envio') {
    this.type = type;
    if (this.type === 'envio') {
      this.deliveryAddress = 'other';
    }
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

  public async finalize() {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      await this.save();
      this.reset();
      const buttons = [
        {
          text: 'Ir',
          handler: () => {
            this.router.navigate(['/pending-orders']);
          },
        },
        {
          text: '',
          icon: 'close',
          role: 'cancel',
        },
      ];
      this.tools.presentToast('¡Órden creada con éxito! <br/> ¿Ir a órdenes en espera?', 60000, 'top', buttons);
    } catch (error) {
      log.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
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
        if (this.type === 'orden') {
          this.address = {
            references: this.customer.references,
            streetAddress: this.customer.streetAddress,
          };
        } else {
          this.address2 = {
            references: this.customer.references,
            streetAddress: this.customer.streetAddress,
          };
          this.address = {
            references: '',
            streetAddress: '',
          };
          this.calculate();
        }
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
    this.total = this.totalOrder + this.shippingPrice;
  }

  changeDelivery(event: any) {
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

  changeCollection(event: any) {
    if (event && event.target && event.target.value && event.target.value === 'default') {
      this.address2 = {
        references: this.customer.references,
        streetAddress: this.customer.streetAddress,
      };
    } else if (event && event.target && event.target.value && event.target.value === 'other') {
      this.address2 = {
        references: this.collectionLocationReferences,
        streetAddress: this.collectionLocation,
      };
    }
  }

  changeDeliveryAddress(event: any) {
    if (event && event.target && event.target.value) {
      this.address = {
        references: this.deliveryLocationReferences,
        streetAddress: this.deliveryLocation,
      };
    }
  }

  changeCollectionAddress(event: any) {
    if (event && event.target && event.target.value) {
      this.address2 = {
        references: this.collectionLocationReferences,
        streetAddress: this.collectionLocation,
      };
    }
  }

  addressTwist() {
    const _collectionAddress = this.collectionAddress;
    const _deliveryAddress = this.deliveryAddress;
    const _collectionLocationReferences = this.collectionLocationReferences;
    const _deliveryLocationReferences = this.deliveryLocationReferences;
    const _collectionLocation = this.collectionLocation;
    const _deliveryLocation = this.deliveryLocation;
    this.collectionAddress = _deliveryAddress;
    this.deliveryAddress = _collectionAddress;
    this.collectionLocationReferences = _deliveryLocationReferences;
    this.deliveryLocationReferences = _collectionLocationReferences;
    this.collectionLocation = _deliveryLocation;
    this.deliveryLocation = _collectionLocation;
    this.address = {
      references: this.deliveryLocationReferences,
      streetAddress: this.deliveryLocation,
    };
    this.address2 = {
      references: this.collectionLocationReferences,
      streetAddress: this.collectionLocation,
    };
  }
}
