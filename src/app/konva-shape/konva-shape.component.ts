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
import { NgbPopoverConfig, NgbPopover } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-konva-shape',
  templateUrl: './konva-shape.component.html',
  styleUrls: ['./konva-shape.component.css'],
  providers: [NgbPopoverConfig]
})
export class KonvaShapeComponent implements OnInit {
  // tslint:disable-next-line: no-input-rename
  @Input('templateId') templateId;
  @ViewChild('konvaContainer') k: any;
  // @ViewChild('testCanvas') k: any;
  // @Input() imageSrc: Blob;

  @ViewChild('konvaDivId') konvaContainId: any;
  @ViewChild('popOver') popover: NgbPopover;
  @ViewChild('labelPopOver') labelPopOver: NgbPopover;
  fileName: string;
  zoomFactor: number = .10;
  defaultScale: number = 1;
  imageSrc: string;
  parentEl: Element;
  pdfData: String[] = [];
  pageId = 0;
  page_num = 1;
  startPos: any = {
    x: Number,
    y: Number,
  };

  responseText = '';
  label = '';
  boxCoordinates;
  imageWidth;
  imageHeight;

  shapes: any = [];
  stage: Konva.Stage;
  layer: Konva.Layer;
  konvaRect: Konva.Rect;
  rectangle = true;
  erase = false;
  rectSelected = false;
  transformers: Konva.Transformer[] = [];
  subscription: Subscription;
  popoverNow = false;
  allowPaiting = false;
  mouseMoved = false;

  constructor(
    private RectService: RectangleService,
    private el: ElementRef,
    public matDialog: MatDialog,
    private aService: AnnotationdataService,
    private config: NgbPopoverConfig
  ) { }

  ngOnInit() {
    this.aService.getDocument(this.templateId).subscribe((res) => {
      // console.log(res);
      this.imageSrc = res.file;
      this.fileName = res.name + '.pdf';
      if (this.imageSrc.indexOf('application/pdf') != -1) {
        this.createPdfToImage();
      } else {
        this.loadImage(this.imageSrc, this.stage.scaleX(), undefined);
      }
      console.log(this.page_num);
    });
    this.parentEl = this.el.nativeElement;
    // this.imageSrc = localStorage.getItem('file');
    // this.fileName = localStorage.getItem('fileName');
    this.setupKonva();
    // this.allowPaiting = this.aService.isPaintingEnabled();
    // console.log(localStorage.getItem('file'));

    this.config.triggers = 'manual';
    this.config.autoClose = 'outside';
    this.aService.konvaCalled$.subscribe((res) => {
      if (typeof (res) === 'boolean') {
        this.allowPaiting = res;
      } else {
        this.addRectangleFromTemplate(res);
      }
    });
  }

  ngDoCheck() {
    this.allowPaiting = this.aService.isPaintingEnabled();
  }

  closePopover(): void {
    console.log(this.boxCoordinates, this.responseText, this.pageId);
    this.aService.postCoordinates(this.boxCoordinates, this.responseText, this.pageId);
    this.aService.callAnnotateComponent(this.responseText);
    this.clearRectangles();
    this.popover.close();
    //this.popover.ngbPopover.elementRef.nativeElement.remove()
  }

  incorrectText() {
    console.log('incorrectText');
    this.clearRectangles();
    this.popover.close();
  }

  clearRectangles() {
    const rNodes = this.layer.find('Rect');
    rNodes.toArray().forEach(node => {
      console.log('inside', node);
      node.destroy();
    });
    this.layer.batchDraw();
  }

  openPopover(): void {
    console.log('open' + this.popover.isOpen());
    // this.maskEditorAppliedMessage = "Successfully Applied";
    if (!this.popover.isOpen()) {
      this.popover.open();
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
          // var scale = 1;
          console.log('DevicePixelRatio', window.devicePixelRatio);

          var scale = window.devicePixelRatio;
          var viewport = page.getViewport({ scale: scale });
          // Prepare canvas using PDF page dimensions
          const canvas = document.createElement('canvas');
          // var canvas = document.getElementById('the-canvas');
          var context = canvas.getContext('2d');

          // console.log(page.view);
          canvas.height = page.view[3] * scale;//this.konvaContainId.nativeElement.offsetHeight;//this.parentEl.children[0].children[i].clientHeight;//viewport.height;
          canvas.width = page.view[2] * scale;//this.konvaContainId.nativeElement.offsetWidth;//viewport.width;
          // this.stage.width = page.view[2];
          // this.stage.height = page.view[3];

          this.stage.setSize({ width: page.view[2] * scale, height: page.view[3] * scale });
          // Render PDF page into canvas context
          //
          var task = page.render({ canvasContext: context, viewport: viewport });
          var data;
          await task.promise.then(async () => {
            data = await canvas.toDataURL('image/png', 1);
            this.pdfData.push(data);
            if (i === 1) {
              this.pageId++;
              console.log(this.stage.scaleX());
              if (window.devicePixelRatio > 1.5) {
                console.log(scale);
                const zoomOut = this.stage.scaleX() - 0.5;
                this.loadImage(data, zoomOut, undefined);
              } else {
                this.loadImage(data, this.stage.scaleX(), undefined);
              }
              // console.log("new data: "+ data);
            }
          });
        });
      }
    }, (error) => {
      console.log(error);
    });
    // console.log(this.pdfData);
  }

  setupKonva() {
    const width = this.parentEl.children[0].children[1].clientWidth;    //this.parentEl.children[0].clientWidth;
    const height = this.parentEl.children[0].children[1].clientHeight;  //this.parentEl.children[0].clientHeight;
    // console.log(this.parentEl);
    // console.log(this.parentEl.parentElement.offsetHeight);
    // console.log(this.parentEl.parentElement.offsetLeft);
    console.log(window.screenX);
    console.log(window.screenX);
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

  addRectangleFromTemplate(obj) {
    this.clearRectangles();
    this.page_num = obj.page_number;
    this.pageId = obj.page_number;
    this.loadImage(this.pdfData[obj.page_number - 1], this.stage.scaleX(), obj);

  }
  private showSelectionForLabel(obj: any) {
    const rNodes = this.layer.find('Rect');
    // this.layer.clear(rNodes);
    rNodes.toArray().forEach(node => {
      node.destroy();
    });

    console.log(this.imageHeight);
    console.log(this.imageWidth);
    const pos = {
      x: obj.coordinates.pos.x * this.imageWidth * this.stage.scaleX(),
      y: obj.coordinates.pos.y * this.imageHeight * this.stage.scaleY(),
    };
    const w = obj.coordinates.w * this.imageWidth * this.stage.scaleX();
    const h = obj.coordinates.h * this.imageHeight * this.stage.scaleY();
    let rect: Konva.Rect;
    // console.log('Predefined Rectangles: pos.x' + pos.x + ' pos.y' + pos.y + ' w: ' + w + ' h:' + h);
    // TODO: Jump to page using obj.page_number to draw the rectangle.;
    rect = this.RectService.rectangle(pos, w, h);
    this.shapes.push(rect);
    this.layer.add(rect);
    this.layer.batchDraw();
    this.addTransformerListeners();
    // rect.on('')
    rect.on('transformend', () => {
      console.log('transform ended');
    });
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
      if (!this.allowPaiting) {
        return;
      }
      isPaint = true;
      const pos = component.stage.getPointerPosition();
      this.relativeScalePostion(pos);
      component.startPos = pos;
      rect = component.RectService.rectangle(pos, w, h);
      console.log('mousedown touchstart: pos' + pos.x + ' pos.y' + pos.y + ' w: ' + w + ' h:' + h);
      component.shapes.push(rect);
      component.layer.add(rect);
      component.addTransformerListeners();
      // this.closePopover();
    });

    this.stage.on('mouseup touchend', () => {
      if (!this.allowPaiting) {
        return;
      }
      this.allowPaiting = false;
      const pos = component.stage.getPointerPosition();
      this.relativeScalePostion(pos);
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

      // Logic to delete 0 height and width rectangles
      const rNodes = component.layer.find('Rect');
      const r = rNodes
        .toArray()
        .find((r) => r.attrs.width == 0 && r.attrs.height == 0);
      if (r) {
        r.destroy();
      }
      const lastNode = rNodes[rNodes.length - 1];
      console.log('mousedown touchend: ' + lastNode.attrs.x + '  lastNode.attrs.y' + lastNode.attrs.y +
        ' lastNode.attrs.width: ' + lastNode.attrs.width + ' lastNode.attrs.height: ' + lastNode.attrs.height);
      const crop = {
        x: lastNode.attrs.x,
        y: lastNode.attrs.y,
        width: lastNode.attrs.width,
        height: lastNode.attrs.height,
      };
      console.log(lastNode);
      component.layer.draw();
      // component.makeClientCrop(crop);
      // console.log(crop);
      const imageNodes = this.layer.find('Image');
      const image = imageNodes[imageNodes.length - 1];
      const imWidth = image.attrs.image.naturalWidth;
      const imHeight = image.attrs.image.naturalHeight;

      console.log(Object.values(crop));
      if (crop.x < 0) {
        crop.x = crop.x * -1;
      }
      if (crop.y < 0) {
        crop.y = crop.y * -1;
      }
      console.log(crop);
      const coordinates = {
        x: crop.x / this.stage.scaleX() / imWidth,
        y: crop.y / this.stage.scaleY() / imHeight,
        w: crop.width / this.stage.scaleX() / imWidth,
        h: crop.height / this.stage.scaleY() / imHeight
      };
      console.log(coordinates);
      this.aService.extractText(coordinates, this.templateId, this.page_num).subscribe((res) => {
        console.log(res);
        this.responseText = res.text;
        this.boxCoordinates = coordinates;
      }, err => {
        console.log(err);
        this.allowPaiting = true;
      });
      component.config.container = 'konvaDivId';
      // this.popoverNow = true;
      component.openPopover();
      // component.openModal(crop);

    });
    // and core function - drawing
    this.stage.on('mousemove touchmove', () => {
      if (!isPaint) {
        return;
      }
      if (!this.allowPaiting) {
        return;
      }
      const pos = component.stage.getPointerPosition();
      this.relativeScalePostion(pos);
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
    let selectedRect: Konva.Rect;
    const tr = new Konva.Transformer({
      rotateEnabled: false,

    });
    this.stage.on('click', function (e) {
      if (!this.clickStartShape) {
        return;
      }
      if ((e.target._id === this.clickStartShape._id)
        && (e.target.attrs.id !== 'imageNode')) {
        component.rectSelected = true;
        component.addDeleteListener(e.target);
        component.layer.add(tr);
        tr.attachTo(e.target);
        component.transformers.push(tr);
        console.log("isTransforming()", e.target)
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
    // localStorage.clear();
  }

  loadImage(src, currentScale, selectedCordinatesForPageObj) {
    const imageObj = new Image();
    imageObj.src = src;
    imageObj.onload = (() => {
      this.imageHeight = imageObj.naturalHeight;
      this.imageWidth = imageObj.naturalWidth;
      console.log(currentScale);
      const w = imageObj.naturalWidth * currentScale;
      const h = imageObj.naturalHeight * currentScale;
      this.stage.setSize({ width: w * currentScale, height: h * currentScale });
      // const targetW = this.stage.width();// - (2 * padding);
      // const targetH = this.stage.height();// - (2 * padding);

      // // compute the ratios of image dimensions to aperture dimensions
      // const widthFit = targetW / w;
      // const heightFit = targetH / h;

      // // compute a scale for best fit and apply it
      // let scale = (widthFit > heightFit) ? heightFit : widthFit;
      const img = new Konva.Image({
        image: imageObj,
        x: this.stage.width() / 2,
        y: this.stage.height() / 2,
        width: w,
        height: h,
        transformsEnabled: 'none',
        id: 'imageNode',
      });
      this.layer.add(img);
      this.layer.batchDraw();
      if (selectedCordinatesForPageObj) {
        this.showSelectionForLabel(selectedCordinatesForPageObj);
      }
    });

  }

  async makeClientCrop(crop) {
    const imageNodes = this.layer.find('Image');
    const image = imageNodes[imageNodes.length - 1];
    if (image && image.attrs.image.src != null && crop.width && crop.height) {
      const croppedImageUrl = await this.getCroppedImg(
        image.attrs.image,
        crop,
        'newFile.jpeg'
      );
      this.aService.postImage(croppedImageUrl).subscribe(res => {
        console.log(res);
      }, error => {
        // alert(error);
        console.log(error);
      });
    }
  }

  // tslint:disable-next-line: variable-name
  getCroppedImg(image, crop, _fileName) {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / this.stage.width();
    const scaleY = image.naturalHeight / this.stage.height();
    const ctx = canvas.getContext('2d');
    // crop.x/totalwidth
    //y/toalheight
    // width: width/totalwidth
    // height/totalheight//
    ctx.drawImage(
      image,
      crop.x / this.stage.scaleX(),
      crop.y / this.stage.scaleY(),
      crop.width / this.stage.scaleX(),
      crop.height / this.stage.scaleY(),
      0,
      0,
      crop.width,
      crop.height
    );
    const imgBlob = canvas.toDataURL('image/png');
    return imgBlob;
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
    if (isNextTrue && this.page_num < this.pdfData.length) {
      if (this.pageId == 0) {
        this.pageId++;
        this.page_num = 1;
      }
      if (this.pageId == this.pdfData.length - 1) {
        this.page_num++;
        this.loadImage(this.pdfData[this.pageId], this.stage.scaleX(), undefined);
      } else {
        this.page_num++;
        this.loadImage(this.pdfData[this.pageId++], this.stage.scaleX(), undefined);
      }

    } else if (this.pageId > 0) {

      if (this.pageId == this.pdfData.length) {
        this.pageId--;
      }
      this.pageId--;
      this.loadImage(this.pdfData[this.pageId], this.stage.scaleX(), undefined);
      this.page_num = this.pageId + 1;
    }
  }

  relativeScalePostion(pos) {
    if (this.stage.scaleX() > 1) {
      pos.x = this.stage.getPointerPosition().x / this.stage.scaleX();
      pos.y = this.stage.getPointerPosition().y / this.stage.scaleX();
    } else {
      pos.x = this.stage.getPointerPosition().x * this.stage.scaleX();
      pos.y = this.stage.getPointerPosition().y * this.stage.scaleX();
    }
    return pos;
  }

  zoomIn() {
    console.log('zoomin', this.stage.scaleX());
    if (this.stage.scaleX() < 2) {
      console.log(this.zoomFactor);
      const scale = this.stage.scaleX() + this.zoomFactor;
      this.stage.scale({ x: scale, y: scale });
      this.loadImage(this.pdfData[this.pageId - 1], this.stage.scaleX(), undefined);
    }
  }


  zoomOut() {
    if (this.stage.scaleX() > 1) {
      const scale = this.stage.scaleX() - this.zoomFactor;
      this.stage.scale({ x: scale, y: scale });
      // this.layer.scale({x: scale,y:scale});
      // this.layer.draw();
      this.loadImage(this.pdfData[this.pageId - 1], this.stage.scaleX(), undefined);
    }
  }
  reset() {
    this.stage.scale({ x: this.defaultScale, y: this.defaultScale });
    this.loadImage(this.pdfData[this.pageId - 1], this.stage.scaleX(), undefined);
  }
}
