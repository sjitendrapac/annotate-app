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
  totalPages;
  currentPage;
  disablePrevPage = true;
  disableNextPage = false;
  pageId = 0;
  pdfData: string[] = [];
  zoomLevel = 0;

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

  // ngDoCheck() {
  //   this.allowPaiting = this.aService.isPaintingEnabled();
  // }

  closePopover(): void {
    // console.log("data passed for template Field: ", this.boxCoordinates, this.responseText, this.pageId);
    this.aService.postCoordinates(this.boxCoordinates, this.responseText, this.pageId);
    this.aService.callAnnotateComponent(this.responseText);
    this.clearRectangles();
    this.popover.close();
    this.responseText = '';
    //this.popover.ngbPopover.elementRef.nativeElement.remove()
  }

  incorrectText() {
    // console.log('incorrectText');
    this.allowPaiting = this.aService.isPaintingEnabled();
    this.clearRectangles();
    this.popover.close();
    this.responseText = '';
  }

  clearRectangles() {
    const rNodes = this.layer.find('Rect');
    const tr = this.layer.find('Transformer');
    rNodes.toArray().forEach(node => {
      // console.log('inside', node);
      node.destroy();
    });
    // console.log(tr);
    // tr.toArray().forEach(t => {
    //   t.detach();
    // });
    this.allowPaiting = this.aService.isPaintingEnabled();
    this.layer.batchDraw();
  }

  openPopover(): void {
    // console.log('open' + this.popover.isOpen());
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
      // console.log('total pages', pdf.numPages);
      this.totalPages = pdf.numPages;
      for (var i = 1; i <= pdf.numPages; i++) {
        await pdf.getPage(i).then(async page => {
          // var scale = 1;
          // console.log('DevicePixelRatio', window.devicePixelRatio);

          var scale = window.devicePixelRatio;
          // var scale = 2;
          var viewport = page.getViewport({ scale: scale });
          // Prepare canvas using PDF page dimensions
          const canvas = document.createElement('canvas');
          // var canvas = document.getElementById('the-canvas');
          var context = canvas.getContext('2d');

          canvas.height = page.view[3] * scale;
          canvas.width = page.view[2] * scale;
          // this.stage.setSize({ width: page.view[2] * scale, height: page.view[3] * scale });
          // console.log('stage Size After', this.stage.getSize());
          // Render PDF page into canvas context
          //
          var task = page.render({ canvasContext: context, viewport: viewport });
          var data;
          await task.promise.then(async () => {
            data = await canvas.toDataURL('image/png', 1);
            this.pdfData.push(data);
            // console.log(i, this.pdfData.length);
            // console.log('pageID', this.pageId);
            if (i === 1) {
              // this.pageId++;
              // console.log('scale: ', window.devicePixelRatio);
              // console.log('scalex', this.stage.scaleX());
              this.currentPage = i - 1;
              this.pageId = i;
              this.loadImage(data, this.stage.scaleX(), undefined);
              if (window.devicePixelRatio >= 1.25) {
                this.defaultScale = (1 / window.devicePixelRatio) + 0.25;
                this.stage.setSize({ width: page.view[2] * this.defaultScale, height: page.view[3] * this.defaultScale });
                this.reset();
              }
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
    // console.log(window.screenX);
    // console.log(window.screenX);
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
    this.currentPage = obj.page_number - 1;
    this.pageId = obj.page_number;
    // console.log('pageId: ', this.pageId, 'currentPage: ', this.currentPage);
    const pageData = this.pdfData[this.currentPage];
    // console.log(pageData);
    this.loadImage(pageData, this.stage.scaleX(), obj);
    // this.loadImage(this.pdfData[obj.page_number - 1], this.stage.scaleX(), obj);

  }
  private showSelectionForLabel(obj: any) {
    const rNodes = this.layer.find('Rect');
    // this.layer.clear(rNodes);
    rNodes.toArray().forEach(node => {
      node.destroy();
    });

    // console.log(this.imageHeight);
    // console.log(this.imageWidth);
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
    // rect.on('transformend', () => {
    //   console.log('transform ended');
    // });
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
      // console.log('mousedown touchstart: pos' + pos.x + ' pos.y' + pos.y + ' w: ' + w + ' h:' + h);
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
      const mission = 'Rectangle Created';
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
      // console.log('mousedown touchend: ' + lastNode.attrs.x + '  lastNode.attrs.y' + lastNode.attrs.y +
      //   ' lastNode.attrs.width: ' + lastNode.attrs.width + ' lastNode.attrs.height: ' + lastNode.attrs.height);
      const crop = {
        x: lastNode.attrs.x,
        y: lastNode.attrs.y,
        width: lastNode.attrs.width,
        height: lastNode.attrs.height,
      };
      // console.log(lastNode);
      component.layer.draw();
      // component.makeClientCrop(crop);
      // console.log(crop);
      const imageNodes = this.layer.find('Image');
      const image = imageNodes[imageNodes.length - 1];
      const imWidth = image.attrs.image.naturalWidth;
      const imHeight = image.attrs.image.naturalHeight;

      // console.log(Object.values(crop));
      if (crop.x < 0) {
        crop.x = crop.x * -1;
      }
      if (crop.y < 0) {
        crop.y = crop.y * -1;
      }
      // console.log(crop);
      const coordinates = {
        x: crop.x / this.stage.scaleX() / imWidth,
        y: crop.y / this.stage.scaleY() / imHeight,
        w: crop.width / this.stage.scaleX() / imWidth,
        h: crop.height / this.stage.scaleY() / imHeight
      };
      // console.log(coordinates);
      this.aService.extractText(coordinates, this.templateId, this.pageId).subscribe((res) => {
        // console.log(res);
        this.responseText = res.text;
        this.boxCoordinates = coordinates;
      }, err => {
        // console.log(err);
        this.allowPaiting = true;
      });
      component.config.container = 'konvaDivId';
      // this.popoverNow = true;
      component.openPopover();
      this.allowPaiting = false;
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
        component.openPopover();
        // TODO: Call extracttext when transformer select.
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
      // console.log('currentScale: ', currentScale);
      const w = imageObj.naturalWidth * currentScale;
      const h = imageObj.naturalHeight * currentScale;
      // console.log('imw & imh: ', this.imageWidth, this.imageHeight);
      // console.log('w & h: ', w, h);
      // console.log('stage Size before', this.stage.getSize());
      // console.log('currentScale in LoadImage', currentScale);


      // console.log('stage Size bLI', this.stage.getSize());
      this.stage.setSize({ width: w * currentScale, height: h * currentScale });
      // console.log('stage Size', this.stage.getSize());
      // const targetW = this.stage.width();// - (2 * padding);
      // const targetH = this.stage.height();// - (2 * padding);

      // // compute the ratios of image dimensions to aperture dimensions
      // const widthFit = targetW / w;
      // const heightFit = targetH / h;

      // // compute a scale for best fit and apply it
      // let scale = (widthFit > heightFit) ? heightFit : widthFit;
      const imageNodes = this.layer.find('Image');
      // console.log(imageNodes);
      imageNodes.toArray().forEach((i) => i.destroy());
      // console.log('after:', imageNodes);
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
      this.layer.clearBeforeDraw();
      this.layer.draw();
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

  nextPage() {
    // console.log('nextPage', this.currentPage);
    if (this.currentPage < this.totalPages) {
      this.disablePrevPage = false;
      this.currentPage = this.currentPage + 1;
      this.pageId = this.pageId + 1;
      if (this.pageId === this.totalPages) {
        this.disableNextPage = true;
        this.disablePrevPage = false;
      };
      const pageData = this.pdfData[this.currentPage];
      this.loadImage(pageData, this.stage.scaleX(), undefined);
    }
  }

  prevPage() {
    // console.log('prevPage', this.currentPage);
    if (this.currentPage >= 1) {
      this.disableNextPage = false;
      this.currentPage = this.currentPage - 1;
      this.pageId = this.pageId - 1;
      if (this.pageId === 1) {
        this.disablePrevPage = true;
        this.disableNextPage = false;
      };
      const pageData = this.pdfData[this.currentPage];
      this.loadImage(pageData, this.stage.scaleX(), undefined);
    }
  }

  // loadNextPage(isNextTrue: boolean) {
  //   if (isNextTrue && this.page_num < this.pdfData.length) {
  //     if (this.pageId == 0) {
  //       this.pageId++;
  //       this.page_num = 1;
  //     }
  //     if (this.pageId == this.pdfData.length - 1) {
  //       this.page_num++;
  //       this.loadImage(this.pdfData[this.pageId], this.stage.scaleX(), undefined);
  //     } else {
  //       this.page_num++;
  //       this.loadImage(this.pdfData[this.pageId++], this.stage.scaleX(), undefined);
  //     }

  //   } else if (this.pageId > 0) {

  //     if (this.pageId == this.pdfData.length) {
  //       this.pageId--;
  //     }
  //     this.pageId--;
  //     this.loadImage(this.pdfData[this.pageId], this.stage.scaleX(), undefined);
  //     this.page_num = this.pageId + 1;
  //   }
  // }

  relativeScalePostion(pos) {
    // if (this.stage.scaleX() > 1) {
    pos.x = this.stage.getPointerPosition().x / this.stage.scaleX();
    pos.y = this.stage.getPointerPosition().y / this.stage.scaleX();
    // }
    // } else {
    //   pos.x = this.stage.getPointerPosition().x * this.stage.scaleX();
    //   pos.y = this.stage.getPointerPosition().y * this.stage.scaleX();
    // }
    return pos;
  }

  zoomIn() {
    console.log('zoomin', this.stage.scaleX());
    console.log('zoomin default', this.defaultScale);
    console.log('zoomin level', this.zoomLevel);
    if (this.stage.scaleX() < 2 && this.zoomLevel < 4) {
      this.zoomLevel = this.zoomLevel + 1;
      const scale = this.stage.scaleX() + this.zoomFactor;
      this.stage.scale({ x: scale, y: scale });
      console.log('zoomin', this.stage.scaleX());
      const pageData = this.pdfData[this.currentPage];
      this.loadImage(pageData, this.stage.scaleX(), undefined);
    }
  }


  zoomOut() {
    console.log('zoomout stage', this.stage.scaleX());
    console.log('zoomout default', this.defaultScale);
    console.log('zoomout level', this.zoomLevel);
    if (this.stage.scaleX() > this.defaultScale + 0.001 && this.zoomLevel >= 0) {
      this.zoomLevel = this.zoomLevel - 1;
      const scale = this.stage.scaleX() - this.zoomFactor;
      this.stage.scale({ x: scale, y: scale });
      console.log('zoomout', this.stage.scaleX());
      const pageData = this.pdfData[this.currentPage];
      this.loadImage(pageData, this.stage.scaleX(), undefined);
    }
  }
  reset() {
    this.stage.scale({ x: this.defaultScale, y: this.defaultScale });
    console.log('zoomreset', this.stage.scaleX());
    this.zoomLevel = 0;
    const pageData = this.pdfData[this.currentPage];
    this.loadImage(pageData, this.stage.scaleX(), undefined);
  }
}
