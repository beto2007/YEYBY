import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-sort-by-yeyby-user',
  templateUrl: './sort-by-yeyby-user.component.html',
  styleUrls: ['./sort-by-yeyby-user.component.scss'],
})
export class SortByYeybyUserComponent implements OnInit {
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
