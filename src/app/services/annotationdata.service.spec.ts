import { TestBed } from '@angular/core/testing';

import { AnnotationdataService } from './annotationdata.service';

describe('AnnotationdataService', () => {
  let service: AnnotationdataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnnotationdataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
