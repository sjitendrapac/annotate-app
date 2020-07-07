import { Injectable } from '@angular/core';
import Konva from 'konva';

@Injectable({
  providedIn: 'root',
})
export class RectangleService {
  constructor() {}

  line(pos, mode: string = 'brush') {
    return new Konva.Line({
      stroke: '#df4b26',
      strokeWidth: 5,
      globalCompositeOperation:
        mode === 'brush' ? 'source-over' : 'destination-out',
      points: [pos.x, pos.y],
      draggable: mode == 'brush',
    });
  }

  rectangle(pos: any, w: number, h: number) {
    return new Konva.Rect({
      x: pos.x,
      y: pos.y,
      width: w,
      height: h,
      stroke: 'black',
      strokeWidth: 4,
      draggable: true,
    });
  }
}
