import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SortByCustomerComponent } from './sort-by-customer.component';

describe('SortByCustomerComponent', () => {
  let component: SortByCustomerComponent;
  let fixture: ComponentFixture<SortByCustomerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SortByCustomerComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SortByCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
