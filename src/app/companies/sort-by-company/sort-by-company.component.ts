import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-sort-by-company',
  templateUrl: './sort-by-company.component.html',
  styleUrls: ['./sort-by-company.component.scss'],
})
export class SortByCompanyComponent implements OnInit {
  constructor(private popoverController: PopoverController) {}

  ngOnInit(): void {}

  dismissPopover() {
    this.popoverController.dismiss();
  }

  public filter(filter: string) {
    this.popoverController.dismiss({
      filter: filter,
    });
  }
}
