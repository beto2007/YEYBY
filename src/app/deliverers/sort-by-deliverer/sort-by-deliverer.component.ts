import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-sort-by-deliverer',
  templateUrl: './sort-by-deliverer.component.html',
  styleUrls: ['./sort-by-deliverer.component.scss'],
})
export class SortByDelivererComponent implements OnInit {
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
