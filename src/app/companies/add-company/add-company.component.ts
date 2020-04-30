import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-add-company',
  templateUrl: './add-company.component.html',
  styleUrls: ['./add-company.component.scss'],
})
export class AddCompanyComponent implements OnInit {
  constructor(private modalController: ModalController) {}

  ngOnInit(): void {}

  close() {
    this.modalController.dismiss({ modification: false });
  }
}
