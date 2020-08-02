import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddYeybyUsersComponent } from './add-yeyby-users.component';

describe('AddYeybyUsersComponent', () => {
  let component: AddYeybyUsersComponent;
  let fixture: ComponentFixture<AddYeybyUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddYeybyUsersComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddYeybyUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
