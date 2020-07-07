import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm, FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { AnnotationdataService } from '../services/annotationdata.service';


@Component({
  selector: 'app-annotate',
  templateUrl: './annotate.component.html',
  styleUrls: ['./annotate.component.css']
})
export class AnnotateComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<any>;
  public dataSource = new MatTableDataSource<any>();
  public dataArr = new Array();

  displayedColumns = ['label', 'name', 'type'];

  @ViewChild('f', { static: true }) signupForm: NgForm;
  types = [
    { value: 'Number', viewValue: 'Number' },
    { value: 'Single-Line Text', viewValue: 'Singe-Line Text' },
    { value: 'Multi-Line Text', viewValue: 'Multi-Line Text' }
  ];
  dataAdded: boolean = false;
  uploadForm: FormGroup;
  dataObj = {
    label: "",
    name: "",
    type: ""
  }

  constructor(private fb: FormBuilder, private aService: AnnotationdataService) { }

  ngOnInit() {
    console.log("ngOnInit called")
    this.uploadForm = this.fb.group({
      label: [''],
      name: [''],
      type: [''],
    });
    // this.dataSource.data = this.dataArr;
    console.log(this.aService.getData())
    this.dataSource.data = this.aService.getData()
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  // ngAfterViewInit() {

  //   // this.table.dataSource = this.dataSource;
  // }

  tableUpdate(obj) {
    console.log("before:", this.dataArr, this.dataSource.data)
    this.dataArr.push(obj)
    console.log("After:", this.dataArr, this.dataSource.data)
    this.dataSource.data = this.dataArr;
  }

  get f() { return this.uploadForm.controls; }

  onSubmit(f) {
    // console.log("Add Pressed", f)
    this.dataAdded = true;
    this.dataObj.label = f.label.value;
    this.dataObj.name = f.name.value;
    this.dataObj.type = f.type.value;
    console.log(this.dataObj)
    console.log(this.dataArr)
    this.dataSource.data = this.aService.addData(this.dataObj);
    // this.tableUpdate(this.dataObj)
    this.uploadForm.reset();
  }
}
