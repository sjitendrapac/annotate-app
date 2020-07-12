import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm, FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { AnnotationdataService } from '../services/annotationdata.service';
import { Subscription } from 'rxjs/internal/Subscription';

export interface TextObject {
  label: any;
  type: any;
  text: any;
}

const textArray: TextObject[] = [];

@Component({
  selector: 'app-annotate',
  templateUrl: './annotate.component.html',
  styleUrls: ['./annotate.component.css']
})


export class AnnotateComponent implements OnInit {
  // @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<any>;
  public dataSource = new MatTableDataSource<any>();

  displayedColumns = ['label', 'type', 'text'];

  @ViewChild('f', { static: true }) signupForm: NgForm;

  types = [
    { value: 'Number', viewValue: 'Number' },
    { value: 'Single-Line Text', viewValue: 'Singe-Line Text' },
    { value: 'Multi-Line Text', viewValue: 'Multi-Line Text' }
  ];

  rectReady = false;
  dataAdded = false;

  uploadForm: FormGroup;

  obj: TextObject = {
    label: '',
    type: '',
    text: '',
  };

  array: TextObject[] = [];

  subscription: Subscription;
  mission = '<no mission announced>';

  constructor(private fb: FormBuilder, private aService: AnnotationdataService) {
    this.subscription = aService.missionAnnounced$.subscribe(
      mission => {
        this.mission = mission;
        this.rectReady = true;
      });
  }

  ngOnInit() {
    this.uploadForm = this.fb.group({
      label: [''],
      name: [''],
      type: [''],
    });
    this.dataSource.data = textArray;
    this.dataSource.sort = this.sort;
    // this.dataSource.paginator = this.paginator;
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy(): void {
    // prevent memory leak when component destroyed
    this.subscription.unsubscribe();
  }

  // tslint:disable-next-line: typedef
  get f() { return this.uploadForm.controls; }

  onSubmit(f) {
    console.log('onSubmit');
    console.log(f);
    this.dataAdded = true;
    this.rectReady = false;
    this.obj.label = f.label.value;
    this.obj.type = f.type.value;
    console.log(this.obj);
    console.log('textArray bef: ', textArray);
    textArray.push(this.obj);
    console.log('textArray aft: ', textArray);
    // textArray = this.array.slice();
    this.dataSource.data = textArray.slice();
    this.uploadForm.reset();
  }
}
