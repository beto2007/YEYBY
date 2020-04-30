import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ModalController } from '@ionic/angular';
import { AddCompanyComponent } from './add-company/add-company.component';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss'],
})
export class CompaniesComponent implements OnInit {
  public docs: any[];

  constructor(private afs: AngularFirestore, private modalController: ModalController) {}

  ngOnInit(): void {}

  ionViewDidEnter() {
    this.afs
      .collection('companies', (ref) => ref.orderBy('name', 'desc'))
      .snapshotChanges()
      .subscribe(
        (snap) => {
          this.docs = snap.map((element) => {
            const id: string = element.payload.doc.id;
            const data: any = element.payload.doc.data();
            return { id, ...data };
          });
        },
        (error) => {
          console.error(error);
        }
      );
  }

  async add() {
    const modal = await this.modalController.create({
      component: AddCompanyComponent,
    });
    return await modal.present();
  }
}
