import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailDelivererComponent } from './detail-deliverer.component';

describe('DetailDelivererComponent', () => {
  let component: DetailDelivererComponent;
  let fixture: ComponentFixture<DetailDelivererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DetailDelivererComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailDelivererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
