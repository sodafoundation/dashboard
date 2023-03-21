import { TestBed } from '@angular/core/testing';

import { LoaderInterceptorService } from './loading.service';

describe('LoaderInterceptorService', () => {
  let service: LoaderInterceptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoaderInterceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
