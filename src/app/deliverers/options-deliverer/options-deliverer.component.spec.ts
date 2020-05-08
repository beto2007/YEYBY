import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionsDelivererComponent } from './options-deliverer.component';

describe('OptionsDelivererComponent', () => {
  let component: OptionsDelivererComponent;
  let fixture: ComponentFixture<OptionsDelivererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OptionsDelivererComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionsDelivererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
