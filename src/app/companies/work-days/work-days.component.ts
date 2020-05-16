import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import * as moment from 'moment';

@Component({
  selector: 'app-work-days',
  templateUrl: './work-days.component.html',
  styleUrls: ['./work-days.component.scss'],
})
export class WorkDaysComponent implements OnInit {
  error: string | undefined;
  myForm!: FormGroup;
  isLoading = false;
  day: any;
  validDate: boolean;

  constructor(private formBuilder: FormBuilder, private popoverController: PopoverController) {
    this.createForm();
  }

  private createForm() {
    this.myForm = this.formBuilder.group({
      title: '',
      name: '',
      works: [false, Validators.required],
      openingHours: ['2020-05-15T09:00:26.813-05:00', Validators.required],
      closingHours: ['2020-05-15T21:00:26.813-05:00', Validators.required],
    });
    this.validateDate();
  }

  validateDate() {
    if (moment(this.myForm.value.openingHours).valueOf() < moment(this.myForm.value.closingHours).valueOf()) {
      this.validDate = true;
    } else {
      this.validDate = false;
    }
  }

  public changeDate(ev?: any) {
    this.validateDate();
  }

  private refillForm() {
    this.myForm.setValue({
      title: this.day.title,
      name: this.day.name,
      works: this.day.works,
      openingHours: this.day.openingHours,
      closingHours: this.day.closingHours,
    });
    this.validateDate();
  }

  save() {
    this.popoverController.dismiss(this.myForm.value);
  }

  ngOnInit(): void {
    this.refillForm();
  }
}
