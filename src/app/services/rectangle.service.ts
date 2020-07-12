import { Injectable } from '@angular/core';
import Konva from 'konva';

@Injectable({
  providedIn: 'root',
})
export class RectangleService {
  constructor() { }

  rectangle(pos: any, w: number, h: number) {
    return new Konva.Rect({
      x: pos.x,
      y: pos.y,
      width: w,
      height: h,
      stroke: 'red',
      strokeWidth: 2,
      draggable: true,
    });
  }
}
