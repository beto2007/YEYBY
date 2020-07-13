import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSlides, ModalController, LoadingController } from '@ionic/angular';
import { CompaniesComponent } from '@app/companies/companies.component';
import { CustomersComponent } from '@app/customers/customers.component';
import { AddCustomersComponent } from '@app/customers/add-customers/add-customers.component';

@Component({
  selector: 'app-create-order-by-steps',
  templateUrl: './create-order-by-steps.component.html',
  styleUrls: ['./create-order-by-steps.component.scss'],
})
export class CreateOrderByStepsComponent implements OnInit {
  @ViewChild('sliderRef', { static: false }) slides: IonSlides;
  isLoading: boolean = false;

  constructor(private modalController: ModalController, private loadingController: LoadingController) {}

  ngOnInit(): void {}

  private async getActiveIndex(): Promise<void> {
    try {
      const index = await this.slides.getActiveIndex();
      console.log('getActiveIndex: ' + index);
    } catch (error) {
      console.error(error);
    }
  }

  public async next(): Promise<void> {
    try {
      await this.slides.slideNext(300, true);
    } catch (error) {
      console.error(error);
    }
  }

  public async back(): Promise<void> {
    try {
      await this.slides.slidePrev(300, true);
    } catch (error) {
      console.error(error);
    }
  }

  ionSlideDidChange(e: any) {}

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
        this.next();
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
        this.next();
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
      console.log(response.data);
      this.next();
      // if (response && response.data && response.data.item && response.data.item.id) {
      //   this.next();
      // }
      this.isLoading = false;
      loadingOverlay.dismiss();
    });
    return await modal.present();
  }
}
