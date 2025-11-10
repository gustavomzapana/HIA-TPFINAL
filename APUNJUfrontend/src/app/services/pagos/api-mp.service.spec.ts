import { TestBed } from '@angular/core/testing';

import { ApiMpService } from './api-mp.service';

describe('ApiMpService', () => {
  let service: ApiMpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiMpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
