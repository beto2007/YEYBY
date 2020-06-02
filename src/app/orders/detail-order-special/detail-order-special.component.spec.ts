import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailOrderSpecialComponent } from './detail-order-special.component';

describe('DetailOrderSpecialComponent', () => {
  let component: DetailOrderSpecialComponent;
  let fixture: ComponentFixture<DetailOrderSpecialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DetailOrderSpecialComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailOrderSpecialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
