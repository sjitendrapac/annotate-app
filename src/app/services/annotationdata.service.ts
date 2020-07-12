import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
// import { AnnotateTableDataSource, AnnotateTableItem } from '../annotate-table/annotate-table-datasource';

@Injectable({
  providedIn: 'root'
})
export class AnnotationdataService {
  // Observable string sources
  private missionAnnouncedSource = new Subject<string>();
  private missionConfirmedSource = new Subject<string>();

  // Observable string streams
  missionAnnounced$ = this.missionAnnouncedSource.asObservable();
  missionConfirmed$ = this.missionConfirmedSource.asObservable();

  constructor() { }
  dataTable = new Array();

  addData(obj) {
    this.dataTable.push(obj);
    return this.dataTable;
  }

  getData() {
    return this.dataTable;
  }

  // Service message commands
  announceMission(mission: string) {
    this.missionAnnouncedSource.next(mission);
  }

  // confirmMission(astronaut: string) {
  //   console.log("confirmMission: ", astronaut)
  //   this.missionConfirmedSource.next(astronaut);
  // }
}
