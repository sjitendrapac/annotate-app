import { KonvaShapeComponent } from './../konva-shape/konva-shape.component';
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

  // Observable string streams
  missionAnnounced$ = this.missionAnnouncedSource.asObservable();

  constructor(private http: HttpClient) { }
  // Service message commands
  announceMission(mission: string) {
    this.missionAnnouncedSource.next(mission);
  }


  // postImage(croppedImage): void {
  //   console.log(croppedImage);
  //   const base64result = croppedImage.split(',')[1];
  //   const obj = {
  //     data: base64result,
  //   };
  //   console.log(JSON.stringify(obj));
  // }
  postImage(croppedImage: string): Observable<any> {
    const base64result = croppedImage.split(',')[1];
    const obj = {
      data: base64result,
    };
    const stringObj = JSON.stringify(obj);

    const params = new HttpHeaders({ accept: 'application/json' });
    const POST_URL: string = environment.API_BASE_URL + '/get_text';
    // const API_BASE_URL = "https://eae70f175346.ngrok.io"
    // const POST_URL = API_BASE_URL + '/get_text';
    return this.http.post<any>(POST_URL, stringObj, { headers: params });
  }



  // confirmMission(astronaut: string) {
  //   console.log("confirmMission: ", astronaut)
  //   this.missionConfirmedSource.next(astronaut);
  // }
}
