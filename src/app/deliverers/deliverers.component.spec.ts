import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliverersComponent } from './deliverers.component';

describe('DeliverersComponent', () => {
  let component: DeliverersComponent;
  let fixture: ComponentFixture<DeliverersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DeliverersComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliverersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
