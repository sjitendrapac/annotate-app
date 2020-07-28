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

  constructor() { }

  // tslint:disable-next-line: typedef
  ngOnInit() { }


}
