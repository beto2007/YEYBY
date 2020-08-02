import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YeybyUsersComponent } from './yeyby-users.component';

describe('YeybyUsersComponent', () => {
  let component: YeybyUsersComponent;
  let fixture: ComponentFixture<YeybyUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [YeybyUsersComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YeybyUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
