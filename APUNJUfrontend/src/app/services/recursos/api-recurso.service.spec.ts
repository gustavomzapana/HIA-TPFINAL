import { TestBed } from '@angular/core/testing';

import { ApiRecursoService } from './api-recurso.service';

describe('ApiRecursoService', () => {
  let service: ApiRecursoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiRecursoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
