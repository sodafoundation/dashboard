import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallProjectComponent } from './install-project.component';

describe('InstallProjectComponent', () => {
  let component: InstallProjectComponent;
  let fixture: ComponentFixture<InstallProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstallProjectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstallProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
