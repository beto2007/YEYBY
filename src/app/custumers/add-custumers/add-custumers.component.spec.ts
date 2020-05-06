import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCustumersComponent } from './add-custumers.component';

describe('AddCustumersComponent', () => {
  let component: AddCustumersComponent;
  let fixture: ComponentFixture<AddCustumersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddCustumersComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCustumersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
