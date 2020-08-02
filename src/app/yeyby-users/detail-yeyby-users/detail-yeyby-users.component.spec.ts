import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailYeybyUsersComponent } from './detail-yeyby-users.component';

describe('DetailYeybyUsersComponent', () => {
  let component: DetailYeybyUsersComponent;
  let fixture: ComponentFixture<DetailYeybyUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DetailYeybyUsersComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailYeybyUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
