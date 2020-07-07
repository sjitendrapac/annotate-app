import { Injectable } from '@angular/core';
// import { AnnotateTableDataSource, AnnotateTableItem } from '../annotate-table/annotate-table-datasource';

@Injectable({
  providedIn: 'root'
})
export class AnnotationdataService {
  constructor() { }
  dataTable = new Array();

  addData(obj) {
    this.dataTable.push(obj);
    return this.dataTable;
  }

  getData() {
    return this.dataTable;
  }
}
