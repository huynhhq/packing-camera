import { TestBed } from '@angular/core/testing';

import { NgxPackingCameraService } from './ngx-packing-camera.service';

describe('NgxPackingCameraService', () => {
  let service: NgxPackingCameraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxPackingCameraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
