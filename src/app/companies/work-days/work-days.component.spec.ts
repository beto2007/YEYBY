import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkDaysComponent } from './work-days.component';

describe('WorkDaysComponent', () => {
  let component: WorkDaysComponent;
  let fixture: ComponentFixture<WorkDaysComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WorkDaysComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkDaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
