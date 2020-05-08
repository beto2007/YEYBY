import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SortByDelivererComponent } from './sort-by-deliverer.component';

describe('SortByDelivererComponent', () => {
  let component: SortByDelivererComponent;
  let fixture: ComponentFixture<SortByDelivererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SortByDelivererComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SortByDelivererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
