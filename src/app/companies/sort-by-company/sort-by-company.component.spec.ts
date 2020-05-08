import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SortByCompanyComponent } from './sort-by-company.component';

describe('SortByCompanyComponent', () => {
  let component: SortByCompanyComponent;
  let fixture: ComponentFixture<SortByCompanyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SortByCompanyComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SortByCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
