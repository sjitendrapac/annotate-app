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
  allowPainting = false;

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
      is_active: true,
      template: null,
      data_type: null,
      parent_field: null,
      created_by: null,
      updated_by: null
    };

  responseText: string;

  // private componentMethodCallSource = new Subject<any>();
  private callKonvaSubject = new Subject<any>();
  // Observable string streams
  // componentMethodCalled$ = this.componentMethodCallSource.asObservable();
  konvaCalled$ = this.callKonvaSubject.asObservable();

  private callAnnotateSubject = new Subject<any>();
  // Observable string streams
  // componentMethodCalled$ = this.componentMethodCallSource.asObservable();
  AnnotateCalled$ = this.callAnnotateSubject.asObservable();


  constructor(private http: HttpClient) { }
  // Service message commands
  announceMission(mission: string) {
    this.missionAnnouncedSource.next(mission);
  }
  // Service message commands
  callKonvaComponent(coordinates, page_number) {
    const obj = {
      coordinates,
      page_number
    }
    this.callKonvaSubject.next(obj);
  }
  callAnnotateComponent(responseText, isBgColored) {
    // responseText
    const obj = {
      responseText,
      isBgColored
    }
    this.callAnnotateSubject.next(obj);
  }

  isPaintingEnabled() {
    if (this.allowPainting) {
      return true;
    } else {
      return false;
    }
  }

  enableCanvas() {
    this.allowPainting = true;
    this.callKonvaSubject.next(this.allowPainting);
  }
  disableCanvas() {
    this.allowPainting = false;
  }

  getData() {
    return this.data;
  }
  getText() {
    return this.responseText;
  }

  postCoordinates(coordinates, text, pageId) {
    console.log(coordinates);
    console.log(text);
    this.responseText = text;
    this.templateField.page_number = pageId;
    this.templateField.bounding_box_x_value = coordinates.x.toFixed(5);
    this.templateField.bounding_box_y_value = coordinates.y.toFixed(5);
    this.templateField.bounding_box_w_value = coordinates.w.toFixed(5);
    this.templateField.bounding_box_h_value = coordinates.h.toFixed(5);

    this.templateField.bounding_box_x_label = coordinates.x.toFixed(5);
    this.templateField.bounding_box_y_label = coordinates.y.toFixed(5);
    this.templateField.bounding_box_w_label = coordinates.w.toFixed(5);
    this.templateField.bounding_box_h_label = coordinates.h.toFixed(5);
    // this.getTemplateFieldData()
  }

  postTemplateFieldData(data) {
    this.templateField.abbreviation = data.label;
    this.templateField.name = data.label;
    this.templateField.label_name = data.label;
    this.templateField.data_type = data.type;
    this.templateField.created_by = 1;
    this.templateField.updated_by = 1;
    this.templateField.level = 1;
    this.templateField.sequence_num = data.sequence_num;
    this.templateField.template = data.template;
    this.templateField.is_bg_colored = data.is_bg_colored;

    this.allowPainting = false;

    console.log(this.templateField);

    const params = new HttpHeaders({ accept: 'application/json', Authorization: 'Basic YWRtaW46YWRtaW4=' });
    const POST_URL: string = environment.API_BASE_URL + 'template-fields/';
    return this.http.post<any>(POST_URL, this.templateField, { headers: params });
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
    const params = new HttpHeaders({ accept: 'application/json', Authorization: 'Basic YWRtaW46YWRtaW4=' });
    const POST_URL: string = environment.API_BASE_URL + 'templates/';
    return this.http.post<any>(POST_URL, obj, { headers: params });
  }
  getDocument(templateId): Observable<any> {
    const params = new HttpHeaders({ accept: 'application/json', Authorization: 'Basic YWRtaW46YWRtaW4=' });
    const POST_URL: string = environment.API_BASE_URL + 'templates/' + templateId + '/';
    return this.http.get<any>(POST_URL, { headers: params });
  }

  viewTemplate(obj): Observable<any> {
    const params = new HttpHeaders({ accept: 'application/json', Authorization: 'Basic YWRtaW46YWRtaW4=' });
    const POST_URL: string = environment.API_BASE_URL + 'template-fields/';
    return this.http.get<any>(POST_URL, { params: { template: obj.id, page_number: '' }, headers: params });
  }

  getDataTypes(): Observable<any> {
    // const obj = { id };
    const params = new HttpHeaders({ accept: 'application/json', Authorization: 'Basic YWRtaW46YWRtaW4=' });
    const POST_URL: string = environment.API_BASE_URL + 'data-types/';
    return this.http.get<any>(POST_URL, { headers: params });
  }
  getDocumentTypes(): Observable<any> {
    const params = new HttpHeaders({ accept: 'application/json', Authorization: 'Basic YWRtaW46YWRtaW4=' });
    const POST_URL: string = environment.API_BASE_URL + 'document-types/';
    return this.http.get<any>(POST_URL, { headers: params });
  }

  addDocument(obj): Observable<any> {
    const stringObj = JSON.stringify(obj);

    const params = new HttpHeaders({ accept: 'application/json', Authorization: 'Basic YWRtaW46YWRtaW4=' });
    const POST_URL: string = environment.API_BASE_URL + 'documents/';
    return this.http.post<any>(POST_URL, stringObj, { headers: params });
  }

  extractText(obj, templateId, page_num, is_bg_colored): Observable<any> {
    // const stringObj = JSON.stringify(obj);

    const object = {
      page_num: page_num,
      coordinates: obj,
      is_bg_colored: false,
    };
    if (is_bg_colored) {
      object.is_bg_colored = is_bg_colored;
    }
    console.log(object);
    // console.log(object.page_num + "" + object.coordinates + "stringjson")
    const params = new HttpHeaders({ accept: 'application/json', Authorization: 'Basic YWRtaW46YWRtaW4=' });
    const POST_URL: string = environment.API_BASE_URL + 'templates/' + templateId + '/extract_text/';
    return this.http.post<any>(POST_URL, object, { headers: params });
  }
}
