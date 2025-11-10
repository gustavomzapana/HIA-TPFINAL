import { TestBed } from '@angular/core/testing';

import { ApiFechaService } from './api-fecha.service';

describe('ApiFechaService', () => {
  let service: ApiFechaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiFechaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
