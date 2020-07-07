import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KonvaShapeComponent } from './konva-shape.component';

describe('KonvaShapeComponent', () => {
  let component: KonvaShapeComponent;
  let fixture: ComponentFixture<KonvaShapeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KonvaShapeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KonvaShapeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
