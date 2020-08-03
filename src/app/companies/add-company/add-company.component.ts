import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, ToastController, PopoverController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { DocumentReference } from '@angular/fire/firestore';
import { WorkDaysComponent } from '../work-days/work-days.component';
import * as moment from 'moment';
import { ToolsService } from '@app/@shared/services/tools/tools.service';
import { Logger } from '@core';
const log = new Logger('AddCompanyComponent');

@Component({
  selector: 'app-add-company',
  templateUrl: './add-company.component.html',
  styleUrls: ['./add-company.component.scss'],
})
export class AddCompanyComponent implements OnInit {
  error: string | undefined;
  myForm!: FormGroup;
  isLoading = false;
  id: string | undefined;
  imageSrc: any;
  thumbnailSrc: any;
  middleSrc: any;
  file: File;
  imagesPath: string[] = [];
  days: any[] = [
    {
      title: 'LU',
      name: 'Lunes',
      works: false,
      openingHours: '2020-05-15T09:00:26.813-05:00',
      closingHours: '2020-05-15T21:00:26.813-05:00',
    },
    {
      title: 'MA',
      name: 'Martes',
      works: false,
      openingHours: '2020-05-15T09:00:26.813-05:00',
      closingHours: '2020-05-15T21:00:26.813-05:00',
    },
    {
      title: 'MI',
      name: 'Miércoles',
      works: false,
      openingHours: '2020-05-15T09:00:26.813-05:00',
      closingHours: '2020-05-15T21:00:26.813-05:00',
    },
    {
      title: 'JU',
      name: 'Jueves',
      works: false,
      openingHours: '2020-05-15T09:00:26.813-05:00',
      closingHours: '2020-05-15T21:00:26.813-05:00',
    },
    {
      title: 'VI',
      name: 'Viernes',
      works: false,
      openingHours: '2020-05-15T09:00:26.813-05:00',
      closingHours: '2020-05-15T21:00:26.813-05:00',
    },
    {
      title: 'SA',
      name: 'Sábado',
      works: false,
      openingHours: '2020-05-15T09:00:26.813-05:00',
      closingHours: '2020-05-15T21:00:26.813-05:00',
    },
    {
      title: 'DO',
      name: 'Domingo',
      works: false,
      openingHours: '2020-05-15T09:00:26.813-05:00',
      closingHours: '2020-05-15T21:00:26.813-05:00',
    },
  ];

  constructor(
    private tools: ToolsService,
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private afs: AngularFirestore,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private popoverController: PopoverController
  ) {
    this.createForm();
  }

  beautyDate(date: any) {
    return moment(date).format('HH:mm A');
  }

  async presentPopover(ev: any, day: any, index: number) {
    const popover = await this.popoverController.create({
      component: WorkDaysComponent,
      componentProps: { day: day },
      event: ev,
      translucent: true,
    });
    popover.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.days[index] = data.data;
      }
    });
    return await popover.present();
  }

  ngOnInit(): void {
    if (this.id) {
      this.initData(this.id);
    }
  }

  async readURL(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => (this.imageSrc = reader.result);
      reader.readAsDataURL(this.file);
      const toBase64 = (file: any) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
      const result: string = String(await toBase64(this.file).catch((e) => Error(e)));
      this.thumbnailSrc = await this.tools.thumbnailify(result, 100, 100);
      this.middleSrc = await this.tools.thumbnailify(result, 320, 170);
    }
  }

  async initData(id: string) {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      const response = await this.afs.collection('companies').doc(id).ref.get();
      const data = response.data();
      if (data && data.days) {
        this.days = data.days;
      }
      if (data) {
        if (data && data.image) {
          this.imageSrc = data.image.thumbnail.url;
          this.imagesPath.push(data.image.main.path);
          this.imagesPath.push(data.image.thumbnail.path);
          this.imagesPath.push(data.image.list.path);
        }
        this.fillForm(data);
      }
    } catch (error) {
      this.presentToast('Ha ocurrido un error');
      log.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  private createForm() {
    this.myForm = this.formBuilder.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      description: [''],
      streetAddress: ['', Validators.required],
      references: [''],
    });
  }

  fillForm(data: any) {
    this.myForm.setValue({
      name: data && data.name ? data.name : '',
      phone: data && data.phone ? data.phone : '',
      description: data && data.description ? data.description : '',
      streetAddress: data && data.streetAddress ? data.streetAddress : '',
      references: data && data.references ? data.references : '',
    });
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 6000,
    });
    toast.present();
  }

  close() {
    this.modalController.dismiss({ modification: false });
  }

  async add(): Promise<void> {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      let data: any = this.myForm.value;
      let search: string[] = [];
      data.days = this.days;
      data.nameStr = String(data.name).toLocaleLowerCase();
      search = search.concat(this.tools.arraySearch(String(this.myForm.get('name').value)));
      search = search.concat(this.tools.arraySearch(String(this.myForm.get('phone').value)));
      data.search = search;
      data.name = String(data.name).toLocaleLowerCase();
      data.name = String(data.name).replace(/\b(\w)/g, (s) => s.toUpperCase());
      data.date = moment().toDate();
      if (this.file) {
        data.image = await this.tools.images(this.file, this.thumbnailSrc, this.middleSrc, 'companies');
      }
      const response: DocumentReference = await this.afs.collection('companies').add(data);
      if (response.id) {
        this.close();
        this.presentToast('Empresa agregada correctamente');
      } else {
        this.presentToast('Ha ocurrido un error');
      }
    } catch (error) {
      this.presentToast('Ha ocurrido un error');
      log.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  async update(id: string): Promise<void> {
    this.isLoading = true;
    const loadingOverlay = await this.loadingController.create({ message: 'Cargando' });
    loadingOverlay.present();
    try {
      let data: any = this.myForm.value;
      let search: string[] = [];
      data.days = this.days;
      data.nameStr = String(data.name).toLocaleLowerCase();
      search = search.concat(this.tools.arraySearch(String(this.myForm.get('name').value)));
      search = search.concat(this.tools.arraySearch(String(this.myForm.get('phone').value)));
      data.name = String(data.name).toLocaleLowerCase();
      data.name = String(data.name).replace(/\b(\w)/g, (s) => s.toUpperCase());
      data.search = search;
      if (this.file) {
        data.image = await this.tools.images(this.file, this.thumbnailSrc, this.middleSrc, 'companies');
      }
      await this.afs.collection('companies').doc(id).update(data);
      if (this.file) {
        this.tools.deletePast(this.imagesPath);
      }
      this.close();
      this.presentToast('Empresa actualizada correctamente');
    } catch (error) {
      this.presentToast('Ha ocurrido un error');
      log.error(error);
    }
    this.isLoading = false;
    loadingOverlay.dismiss();
  }

  save() {
    if (this.id) {
      this.update(this.id);
    } else {
      this.add();
    }
  }
}
