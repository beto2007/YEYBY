import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionsCustomersComponent } from './options-customers.component';

describe('OptionsCustomersComponent', () => {
  let component: OptionsCustomersComponent;
  let fixture: ComponentFixture<OptionsCustomersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OptionsCustomersComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionsCustomersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
