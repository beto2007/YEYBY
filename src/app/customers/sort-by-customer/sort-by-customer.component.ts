import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-sort-by-customer',
  templateUrl: './sort-by-customer.component.html',
  styleUrls: ['./sort-by-customer.component.scss'],
})
export class SortByCustomerComponent implements OnInit {
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
