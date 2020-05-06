import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionsCustumersComponent } from './options-custumers.component';

describe('OptionsCustumersComponent', () => {
  let component: OptionsCustumersComponent;
  let fixture: ComponentFixture<OptionsCustumersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OptionsCustumersComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionsCustumersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
