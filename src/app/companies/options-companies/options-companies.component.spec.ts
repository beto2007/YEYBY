import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionsCompaniesComponent } from './options-companies.component';

describe('OptionsCompaniesComponent', () => {
  let component: OptionsCompaniesComponent;
  let fixture: ComponentFixture<OptionsCompaniesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OptionsCompaniesComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionsCompaniesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
