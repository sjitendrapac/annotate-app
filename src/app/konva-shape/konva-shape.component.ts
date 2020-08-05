import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import Konva from 'konva';
import { RectangleService } from '../services/rectangle.service';
import { AnnotationdataService } from '../services/annotationdata.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ModalComponent } from '../modal/modal.component';
import { Subscription } from 'rxjs';
// import tippy from 'tippy.js';
import PDFJS from 'pdfjs-dist/build/pdf';
import PDFSWorker from 'pdfjs-dist/build/pdf.worker.entry';

@Component({
  selector: 'app-konva-shape',
  templateUrl: './konva-shape.component.html',
  styleUrls: ['./konva-shape.component.css'],
})
export class KonvaShapeComponent implements OnInit {
  @ViewChild('konvaContainer') k: any;
  // @ViewChild('testCanvas') k: any;
  // @Input() imageSrc: Blob;

  @ViewChild('konvaDivId') konvaContainId: any;
  imageSrc: string;
  parentEl: Element;
  pdfData: String[] = [];
  pageId = 1;
  startPos: any = {
    x: Number,
    y: Number,
  };

  responseText = "Response Text";
  label = "Consignee";

  shapes: any = [];
  stage: Konva.Stage;
  layer: Konva.Layer;
  rectangle = true;
  erase = false;
  rectSelected = false;
  transformers: Konva.Transformer[] = [];
  subscription: Subscription;

  constructor(
    private RectService: RectangleService,
    private el: ElementRef,
    public matDialog: MatDialog,
    private aService: AnnotationdataService
  ) {
    console.log('contructor');
  }

  ngOnInit() {
    this.parentEl = this.el.nativeElement;
    this.setupKonva();
    // console.log(localStorage.getItem('file'));
    this.imageSrc = localStorage.getItem('file');
    if (this.imageSrc.indexOf("application/pdf") != -1) {
      this.createPdfToImage();
    } else {
      this.loadImage(this.imageSrc);
    }
  }

  createPdfToImage() {
    // PDFJS.disableWorker = true;
    PDFJS.GlobalWorkerOptions.workerSrc = PDFSWorker;

    PDFJS.getDocument(this.imageSrc).promise.then(async pdf => {
      //
      // Fetch the first page
      //
      for (var i = 1; i <= pdf.numPages; i++) {
        await pdf.getPage(i).then(async page => {
          var scale = 1;
          var viewport = page.getViewport({ scale: scale });

          //
          // Prepare canvas using PDF page dimensions
          const canvas = document.createElement('canvas');
          // var canvas = document.getElementById('the-canvas');
          var context = canvas.getContext('2d');

          canvas.height = this.konvaContainId.nativeElement.offsetHeight; //this.parentEl.children[0].children[i].clientHeight;//viewport.height;
          canvas.width = this.konvaContainId.nativeElement.offsetWidth; //viewport.width;

          //
          // Render PDF page into canvas context
          //
          var task = page.render({ canvasContext: context, viewport: viewport })
          var data;
          await task.promise.then(async () => {
            data = await canvas.toDataURL('image/jpeg');
            this.pdfData.push(data);
            if (i == 1) {
              this.loadImage(data);
              // console.log("new data: "+ data);
            }
          });
        });
      }
    }, function (error) {
      console.log(error);
    });
    console.log(this.pdfData);
  }

  setupKonva() {
    const width = this.parentEl.children[0].children[1].clientWidth;    //this.parentEl.children[0].clientWidth;
    const height = this.parentEl.children[0].children[1].clientHeight; //this.parentEl.children[0].clientHeight;
    console.log(this.parentEl);
    console.log(this.parentEl.parentElement.offsetHeight);
    console.log(this.parentEl.parentElement.offsetLeft);
    this.stage = new Konva.Stage({
      container: 'konvaContainer',
      width,
      height,
      x: window.screenX,
      y: window.screenY
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
      console.log("mousedown touchstart: pos" + pos.x + " pos.y" + pos.y + " w: " + w + " h:" + h);
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
      console.log("mousedown touchend: " + lastNode.attrs.x + "  lastNode.attrs.y" + lastNode.attrs.y + " lastNode.attrs.width: " + lastNode.attrs.width + " lastNode.attrs.height: " + lastNode.attrs.height);
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
      component.openModal(crop);

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
  addDeleteListener(shape: import('konva/types/Stage').Stage | import('konva/types/Shape').Shape<import('konva/types/Shape').ShapeConfig>) {
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

  ngOnDestroy() {
    // console.log("ngondestroy");
    localStorage.clear();
  }

  loadImage(src) {
    console.log('inside loadimage');

    const imageObj = new Image();
    imageObj.src = src;
    imageObj.onload = (() => {
      console.log(imageObj.naturalHeight);
      console.log(imageObj.naturalWidth);

      // if (imageObj.naturalHeight && imageObj.naturalWidth) {

      const w = imageObj.naturalWidth;
      const h = imageObj.naturalHeight;
      const padding = 10;
      const targetW = this.stage.width();// - (2 * padding);
      const targetH = this.stage.height();// - (2 * padding);

      // compute the ratios of image dimensions to aperture dimensions
      const widthFit = targetW / w;
      const heightFit = targetH / h;

      // compute a scale for best fit and apply it
      let scale = (widthFit > heightFit) ? heightFit : widthFit;

      // console.log(widthFit, heightFit);
      // console.log(scale);
      // console.log(w * scale, h * scale);
      // scale = 0.7;
      // console.log(scale);
      // console.log(w * scale, h * scale);

      const img = new Konva.Image({
        image: imageObj,
        x: this.stage.width() / 2,
        y: this.stage.height() / 2,
        width: w * widthFit,
        height: h * heightFit,
        transformsEnabled: 'none',
        id: 'imageNode',
      });
      this.layer.add(img);
      this.layer.batchDraw();
    });

  }

  async makeClientCrop(crop) {
    const imageNodes = this.layer.find('Image');
    const image = imageNodes[imageNodes.length - 1];
    if (image && image.attrs.image.src != null && crop.width && crop.height) {
      const croppedImageUrl = await this.getCroppedImg(
        image.attrs.image,
        crop
      );
      // this.aService.postImage(croppedImageUrl).subscribe(res => {
      //   console.log(res);
      // }, error => {
      //   // alert(error);
      //   console.log(error);
      // });
    }
  }

  // tslint:disable-next-line: variable-name
  getCroppedImg(image, crop) {
    console.log(" test", image.naturalWidth, image.naturalHeight)
    const coordinates_to_send = {
      x: crop.x / image.naturalWidth,
      y: crop.y / image.naturalHeight,
      h: crop.height / image.naturalHeight,
      w: crop.width / image.naturalWidth
    };

    this.aService.postTemplateField(coordinates_to_send);

    // const canvas = document.createElement('canvas');
    // const scaleX = image.naturalWidth / this.stage.width();
    // const scaleY = image.naturalHeight / this.stage.height();
    // const ctx = canvas.getContext('2d');

    // ctx.drawImage(
    //   image,
    //   crop.x * scaleX,
    //   crop.y * scaleY,
    //   crop.width * scaleX,
    //   crop.height * scaleY,
    //   0,
    //   0,
    //   crop.width,
    //   crop.height
    // );
    // const imgBlob = canvas.toDataURL('image/png');
    // return imgBlob;
  }

  openModal(crop) {
    const dialogConfig = new MatDialogConfig();
    // The user can't close the dialog by clicking outside its body
    // dialogConfig.disableClose = true;
    // leftPos = 20%;
    dialogConfig.id = 'modal-component';
    dialogConfig.width = '200px';
    dialogConfig.height = '100px';
    dialogConfig.position = {
      top: crop.y,
      left: crop.x,
    }

    // https://material.angular.io/components/dialog/overview
    const modalDialog = this.matDialog.open(ModalComponent, dialogConfig);
  }

  loadNextPage(isNextTrue: boolean) {
    console.log(this.pdfData.length)
    if (isNextTrue && this.pageId < this.pdfData.length) {
      this.pageId++;
      this.loadImage(this.pdfData[this.pageId])
    } else if (this.pageId > 0) {
      this.pageId--;
      this.loadImage(this.pdfData[this.pageId])
    }
  }
}