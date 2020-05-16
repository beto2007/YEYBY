import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionsOrderComponent } from './options-order.component';

describe('OptionsOrderComponent', () => {
  let component: OptionsOrderComponent;
  let fixture: ComponentFixture<OptionsOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OptionsOrderComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionsOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
