import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-sort-by-order',
  templateUrl: './sort-by-order.component.html',
  styleUrls: ['./sort-by-order.component.scss'],
})
export class SortByOrderComponent implements OnInit {
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
