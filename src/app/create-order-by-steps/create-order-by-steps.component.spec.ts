import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrderByStepsComponent } from './create-order-by-steps.component';

describe('CreateOrderByStepsComponent', () => {
  let component: CreateOrderByStepsComponent;
  let fixture: ComponentFixture<CreateOrderByStepsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateOrderByStepsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateOrderByStepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
