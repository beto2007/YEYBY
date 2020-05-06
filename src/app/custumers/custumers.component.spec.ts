import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustumersComponent } from './custumers.component';

describe('CustumersComponent', () => {
  let component: CustumersComponent;
  let fixture: ComponentFixture<CustumersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CustumersComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustumersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
