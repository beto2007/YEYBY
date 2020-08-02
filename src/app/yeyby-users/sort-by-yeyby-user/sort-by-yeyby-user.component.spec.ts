import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SortByYeybyUserComponent } from './sort-by-yeyby-user.component';

describe('SortByYeybyUserComponent', () => {
  let component: SortByYeybyUserComponent;
  let fixture: ComponentFixture<SortByYeybyUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SortByYeybyUserComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SortByYeybyUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
