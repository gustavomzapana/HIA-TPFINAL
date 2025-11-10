import { TestBed } from '@angular/core/testing';

import { ListaExcelService } from './lista-excel.service';

describe('ListaExcelService', () => {
  let service: ListaExcelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListaExcelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
