import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxPackingCameraComponent } from './ngx-packing-camera.component';

describe('NgxPackingCameraComponent', () => {
  let component: NgxPackingCameraComponent;
  let fixture: ComponentFixture<NgxPackingCameraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxPackingCameraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxPackingCameraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
