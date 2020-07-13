import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import Konva from 'konva';
import { RectangleService } from '../services/rectangle.service';
import { AnnotationdataService } from '../services/annotationdata.service';

@Component({
  selector: 'app-konva-shape',
  templateUrl: './konva-shape.component.html',
  styleUrls: ['./konva-shape.component.css'],
})
export class KonvaShapeComponent implements OnInit {
  @ViewChild('konvaContainer') k: any;
  @Input() imageSrc: Blob;
  parentEl: Element;

  startPos: any = {
    x: Number,
    y: Number,
  };

  shapes: any = [];
  stage: Konva.Stage;
  layer: Konva.Layer;
  rectangle = true;
  erase = false;
  rectSelected = false;
  transformers: Konva.Transformer[] = [];

  constructor(
    private RectService: RectangleService,
    private el: ElementRef,
    private aService: AnnotationdataService
  ) {
    aService.missionConfirmed$.subscribe();
  }

  ngOnInit() {
    this.parentEl = this.el.nativeElement.offsetParent;
    this.setupKonva();
    this.loadImage(this.imageSrc);
  }

  setupKonva() {
    const width = this.parentEl.clientWidth;
    const height = this.parentEl.clientHeight * 0.8;
    // const width = window.innerWidth * 0.9;
    // const height = window.innerHeight;

    this.stage = new Konva.Stage({
      container: 'konvaContainer',
      width,
      height,
      // x: window.screenX,
      // y: window.screenY
    });
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
    this.addLineListeners();
  }



  addLineListeners() {
    const component = this;
    let rect: Konva.Rect;
    let isPaint: boolean;
    let w = 0;
    let h = 0;
    component.startPos = {
      x: 0,
      y: 0,
    };
    this.stage.on('mousedown touchstart', () => {
      if (component.rectSelected) {
        return;
      }
      isPaint = true;
      const pos = component.stage.getPointerPosition();
      component.startPos = pos;
      rect = component.RectService.rectangle(pos, w, h);
      component.shapes.push(rect);
      component.layer.add(rect);
      component.addTransformerListeners();
    });

    this.stage.on('mouseup touchend', () => {
      const pos = component.stage.getPointerPosition();
      component.layer.batchDraw();
      w = pos.x - component.startPos.x;
      h = pos.y - component.startPos.y;
      rect.attrs.x = component.startPos.x;
      rect.attrs.y = component.startPos.y;
      rect.attrs.width = w;
      rect.attrs.height = h;
      const currShapeIndex = component.shapes.length - 1;
      component.shapes[currShapeIndex] = rect;
      component.layer.batchDraw();
      isPaint = false;
      const mission = 'Rectangle Created'
      component.aService.announceMission(mission);
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
      const lastNode = rNodes[rNodes.length - 1];
      // const crop = {
      //   x: component.startPos.x,
      //   y: component.startPos.y,
      //   width: w,
      //   height: h,
      // }
      const crop = {
        x: lastNode.attrs.x,
        y: lastNode.attrs.y,
        width: lastNode.attrs.width,
        height: lastNode.attrs.height,
      };
      // const croppedRect = lastNode.toCanvas({
      //   callback(img) {
      //     console.log(img);
      //   }
      // });
      // const i = croppedRect.toDataURL();
      // console.log(croppedRect);
      // console.log(i);

      component.layer.draw();
      component.makeClientCrop(crop);
    });
    // and core function - drawing
    this.stage.on('mousemove touchmove', () => {
      if (!isPaint) {
        return;
      }
      const pos = component.stage.getPointerPosition();
      w = pos.x - component.startPos.x;
      h = pos.y - component.startPos.y;
      // rect.attrs.x = pos.x;
      // rect.attrs.y = pos.y;
      rect.attrs.x = component.startPos.x;
      rect.attrs.y = component.startPos.y;
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
      if ((e.target._id == this.clickStartShape._id)
        && (e.target.attrs.id !== 'imageNode')) {
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
  addDeleteListener(shape: import("konva/types/Stage").Stage | import("konva/types/Shape").Shape<import("konva/types/Shape").ShapeConfig>) {
    const component = this;
    window.addEventListener('keydown', (e) => {
      if (e.keyCode === 46) {
        shape.remove();
        component.transformers.forEach((t) => {
          t.detach();
        });
        const selectedShape = component.shapes.find((s: { _id: any; }) => s._id === shape._id);
        selectedShape.remove();
        e.preventDefault();
      }
      component.layer.batchDraw();
    });
  }

  loadImage(src) {
    const imageObj = new Image();
    imageObj.src = src;
    const width = this.stage.width();
    const height = this.stage.height();

    const img = new Konva.Image({
      image: imageObj,
      width,
      height,
      transformsEnabled: 'none',
      id: 'imageNode',
    });
    this.layer.add(img);
    this.layer.batchDraw();
  }
  async makeClientCrop(crop) {
    const imageNodes = this.layer.find('Image');
    const image = imageNodes[imageNodes.length - 1];
    if (image.attrs.image.src != null && crop.width && crop.height) {
      const croppedImageUrl = await this.getCroppedImg(
        image.attrs.image,
        crop,
        'newFile.jpeg'
      );
      this.aService.postImage(croppedImageUrl);
    }
  }

  // tslint:disable-next-line: variable-name
  getCroppedImg(image, crop, _fileName) {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / this.stage.width();
    const scaleY = image.naturalHeight / this.stage.height();
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );
    const imgBlob = canvas.toDataURL('image/png');
    return imgBlob;
  }

}
