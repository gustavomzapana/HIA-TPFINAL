import { TestBed } from '@angular/core/testing';

import { ApiReservaService } from './api-reserva.service';

describe('ApiReservaService', () => {
  let service: ApiReservaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiReservaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
