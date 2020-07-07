import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import Konva from 'konva';
import { RectangleService } from '../services/rectangle.service';

@Component({
  selector: 'app-konva-shape',
  templateUrl: './konva-shape.component.html',
  styleUrls: ['./konva-shape.component.css'],
})
export class KonvaShapeComponent implements OnInit {
  @ViewChild('konvaContainer') k;
  @Input() imageSrc: Blob;
  parentEl: Element;

  startPos: any = {
    x: Number,
    y: Number,
  };
  shapes: any = [];
  stage: Konva.Stage;
  layer: Konva.Layer;
  rectangle: boolean = true;
  erase: boolean = false;
  rectSelected: boolean = false;
  transformers: Konva.Transformer[] = [];

  constructor(
    private RectangleService: RectangleService,
    private el: ElementRef
  ) { }

  ngOnInit() {
    this.parentEl = this.el.nativeElement.offsetParent;
    this.setupKonva();
    this.loadImage(this.imageSrc);
  }

  setupKonva() {
    // let width = window.innerWidth * 0.9;
    // let height = window.innerHeight;
    let width = this.parentEl.clientHeight;
    let height = this.parentEl.clientWidth;
    this.stage = new Konva.Stage({
      container: 'konvaContainer',
      width: width,
      height: height,
    });
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
    this.addLineListeners();
  }
  addLineListeners() {
    console.log('addListener');
    const component = this;
    let rect;
    let isPaint;
    let w = 0;
    let h = 0;
    component.startPos = {
      x: 0,
      y: 0,
    };
    this.stage.on('mousedown touchstart', function () {
      console.log('mousedown and touchstart');
      // if (!component.selectedButton['line'] && !component.erase) {
      //   return;
      // }
      if (component.rectSelected) {
        return;
      }
      isPaint = true;
      let pos = component.stage.getPointerPosition();
      console.log(component.startPos);
      component.startPos = pos;
      rect = component.RectangleService.rectangle(pos, w, h);
      component.shapes.push(rect);
      component.layer.add(rect);
      component.addTransformerListeners();
    });
    this.stage.on('mouseup touchend', function () {
      console.log('mouseup and touchend');
      component.layer.batchDraw();
      isPaint = false;
      component.startPos = {
        x: 0,
        y: 0,
      };
      h = 0;
      w = 0;
      const rNodes = component.layer.find('Rect');
      const r = rNodes
        .toArray()
        .find((r) => r.attrs.width == 0 && r.attrs.height == 0);
      if (r) {
        r.destroy();
      }
      component.layer.draw();
    });
    // and core function - drawing
    this.stage.on('mousemove touchmove', function () {
      console.log('mousemove and touchmove');
      if (!isPaint) {
        return;
      }
      const pos = component.stage.getPointerPosition();
      w = pos.x - component.startPos.x;
      h = pos.y - component.startPos.y;
      rect.attrs.x = pos.x;
      rect.attrs.y = pos.y;
      rect.attrs.width = w;
      rect.attrs.height = h;
      const currShapeIndex = component.shapes.length - 1;
      component.shapes[currShapeIndex] = rect;
      component.layer.batchDraw();
    });
  }
  undo() {
    const removedShape = this.shapes.pop();
    this.transformers.forEach((t) => {
      t.detach();
    });
    if (removedShape) {
      removedShape.remove();
    }
    this.layer.draw();
  }
  addTransformerListeners() {
    const component = this;
    const tr = new Konva.Transformer();
    this.stage.on('click', function (e) {
      if (!this.clickStartShape) {
        return;
      }
      if (e.target._id == this.clickStartShape._id) {
        component.rectSelected = true;
        component.addDeleteListener(e.target);
        component.layer.add(tr);
        tr.attachTo(e.target);
        component.transformers.push(tr);
        component.layer.draw();
      } else {
        component.rectSelected = false;
        tr.detach();
        component.layer.draw();
      }
    });
  }
  addDeleteListener(shape) {
    const component = this;
    window.addEventListener('keydown', function (e) {
      if (e.keyCode === 46) {
        shape.remove();
        component.transformers.forEach((t) => {
          t.detach();
        });
        const selectedShape = component.shapes.find((s) => s._id == shape._id);
        selectedShape.remove();
        e.preventDefault();
      }
      component.layer.batchDraw();
    });
  }

  loadImage(src) {
    var imageObj = new Image();
    imageObj.src = src;
    let width = this.parentEl.clientHeight;
    let height = this.parentEl.clientWidth;
    var img = new Konva.Image({
      image: imageObj,
      x: 0,
      y: 0,
      width: width,
      height: height,
    });
    this.layer.add(img);
    this.layer.batchDraw();
  }
}
