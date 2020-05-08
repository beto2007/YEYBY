import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailCustomersComponent } from './detail-customers.component';

describe('DetailCustomersComponent', () => {
  let component: DetailCustomersComponent;
  let fixture: ComponentFixture<DetailCustomersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DetailCustomersComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailCustomersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
