import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SortByOrderComponent } from './sort-by-order.component';

describe('SortByOrderComponent', () => {
  let component: SortByOrderComponent;
  let fixture: ComponentFixture<SortByOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SortByOrderComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SortByOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
