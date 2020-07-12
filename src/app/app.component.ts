import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { KonvaShapeComponent } from './konva-shape/konva-shape.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  @ViewChild(KonvaShapeComponent) child: KonvaShapeComponent;

  title = 'Annotate App';
  imageSrc;
  imageLoaded = false;
  constructor() { }

  // tslint:disable-next-line: typedef
  ngOnInit() { }

  onSelectFile(e: { target: { files: string | any[]; }; }): void {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        this.imageSrc = reader.result;
      });
      reader.addEventListener('loadend', () => {
        this.imageLoaded = true;
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  }
}
