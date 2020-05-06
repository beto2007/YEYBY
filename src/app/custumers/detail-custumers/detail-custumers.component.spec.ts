import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailCustumersComponent } from './detail-custumers.component';

describe('DetailCustumersComponent', () => {
  let component: DetailCustumersComponent;
  let fixture: ComponentFixture<DetailCustumersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DetailCustumersComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailCustumersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
