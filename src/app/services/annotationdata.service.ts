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
  data = [];

  templateField =
    {
      name: '',
      abbreviation: '',
      page_number: null,
      level: null,
      sequence_num: null,
      label_name: '',
      bounding_box_x_label: null,
      bounding_box_y_label: null,
      bounding_box_w_label: null,
      bounding_box_h_label: null,
      bounding_box_x_value: null,
      bounding_box_y_value: null,
      bounding_box_w_value: null,
      bounding_box_h_value: null,
      is_bg_colored: false,
      is_active: false,
      template: null,
      data_type: null,
      parent_field: null,
      created_by: null,
      updated_by: null
    };

  constructor(private http: HttpClient) { }
  // Service message commands
  announceMission(mission: string) {
    this.missionAnnouncedSource.next(mission);
  }

  addField() {
    this.data.push({ label: '', type: '', text: '' });
  }

  getData() {
    return this.data;
  }

  postTemplateField(coordinates) {
    console.log(coordinates);
    this.templateField.bounding_box_x_value = coordinates.x;
    this.templateField.bounding_box_y_value = coordinates.y;
    this.templateField.bounding_box_w_value = coordinates.w;
    this.templateField.bounding_box_h_value = coordinates.h;
    this.templateField.bounding_box_x_label = coordinates.x;
    this.templateField.bounding_box_y_label = coordinates.y;
    this.templateField.bounding_box_w_label = coordinates.w;
    this.templateField.bounding_box_h_label = coordinates.h;

  }

  getTemplateFieldData(data) {
    this.templateField.abbreviation = data.label;;
    this.templateField.name = data.label;
    this.templateField.label_name = data.label;
    this.templateField.label_name = data.label;
    this.templateField.data_type = data.type;
    this.templateField.created_by = 'admin';
    this.templateField.updated_by = 'admin';
    this.templateField.page_number = 1;
    this.templateField.level = 1;
    this.templateField.sequence_num = 1;
    this.templateField.template = 1234;
    const stringObj = JSON.stringify(this.templateField);
    console.log(this.templateField);

    const params = new HttpHeaders({ accept: 'application/json', Authorization: 'Basic YWRtaW46YWRtaW4=' });
    const POST_URL: string = environment.API_BASE_URL + '/ocr/template-fields/';
    return this.http.post<any>(POST_URL, stringObj, { headers: params });
  }

  postImage(croppedImage: string): Observable<any> {
    const base64result = croppedImage.split(',')[1];
    const obj = {
      data: base64result,
    };
    const stringObj = JSON.stringify(obj);

    const params = new HttpHeaders({ accept: 'application/json' });
    const POST_URL: string = environment.API_BASE_URL + '/get_text';
    return this.http.post<any>(POST_URL, stringObj, { headers: params });
  }

  getTemplates(): Observable<any> {
    const params = new HttpHeaders({ accept: 'application/json', Authorization: 'Basic YWRtaW46YWRtaW4=' });
    const POST_URL: string = environment.API_BASE_URL + 'templates/';
    return this.http.get(POST_URL, { headers: params });
  }

  addTemplate(obj): Observable<any> {
    const stringObj = JSON.stringify(obj);

    const params = new HttpHeaders({ accept: 'application/json', Authorization: 'Basic YWRtaW46YWRtaW4=' });
    const POST_URL: string = environment.API_BASE_URL + '/templates/';
    return this.http.post<any>(POST_URL, stringObj, { headers: params });
  }

  addDocument(obj): Observable<any> {
    const stringObj = JSON.stringify(obj);

    const params = new HttpHeaders({ accept: 'application/json', Authorization: 'Basic YWRtaW46YWRtaW4=' });
    const POST_URL: string = environment.API_BASE_URL + '/documents/';
    return this.http.post<any>(POST_URL, stringObj, { headers: params });
  }
}
