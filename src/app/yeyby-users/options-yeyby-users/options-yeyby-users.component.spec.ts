import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionsYeybyUsersComponent } from './options-yeyby-users.component';

describe('OptionsYeybyUsersComponent', () => {
  let component: OptionsYeybyUsersComponent;
  let fixture: ComponentFixture<OptionsYeybyUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OptionsYeybyUsersComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionsYeybyUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
