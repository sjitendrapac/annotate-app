import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
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

  // constructor(private http: HttpClient) { }
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

  postImage(croppedImage): void {
    console.log(croppedImage)
  }
  // postImage(croppedImage): Observable<any> {
  //   const params = new HttpHeaders({ accept: 'application/json' });
  //   const GET_URL: string = environment.API_BASE_URL + '/worksheets/';
  //   return this.http.get<any>(GET_URL, { headers: params });
  // }

  // confirmMission(astronaut: string) {
  //   console.log("confirmMission: ", astronaut)
  //   this.missionConfirmedSource.next(astronaut);
  // }
}
