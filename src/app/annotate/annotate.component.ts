import { ReviewComponent } from './../review/review.component';
import { LayoutModule } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NgForm, FormGroup, FormBuilder, FormArray } from '@angular/forms';
// import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { AnnotationdataService } from '../services/annotationdata.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-annotate',
  templateUrl: './annotate.component.html',
  styleUrls: ['./annotate.component.css']
})


export class AnnotateComponent implements OnInit {
  // @ViewChild(MatPaginator) paginator: MatPaginator;
  // tslint:disable-next-line: no-input-rename
  @Input('templateId') templateId;
  dataSource = new MatTableDataSource<any>();

  displayedColumns = ['label', 'type', 'text'];

  templateForm: FormGroup;

  savedTemplateFields;

  rectReady = false;

  subscription: Subscription;
  mission = '<no mission announced>';
  data = [];
  responseText: string;

  validTypes;
  // validTypes = [
  //   { type: 'Numeric' },
  //   { type: 'Alphanumeric' }
  // ];

  constructor(private fb: FormBuilder, private aService: AnnotationdataService) {
    this.templateForm = this.fb.group({
      templateArray: this.fb.array([])
    });

    this.subscription = aService.missionAnnounced$.subscribe(
      mission => {
        this.mission = mission;
        this.rectReady = true;
      });
  }


  ngOnInit() {
    // this.addTemplate();
    // this.aService.enableCanvas();
    // this.patchTextField();

  }

  ngDoCheck() {
    this.data = this.aService.getData();
    this.responseText = this.aService.getText();
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy(): void {
    // prevent memory leak when component destroyed
    this.subscription.unsubscribe();
  }

  templateArray(): FormArray {
    return this.templateForm.get('templateArray') as FormArray;
  }

  newTemplate(): FormGroup {
    return this.fb.group({
      label: '',
      text: '',
      type: '',
    });
  }

  addTemplate() {
    this.templateArray().push(this.newTemplate());
  }

  removeTemplate(i: number) {
    this.templateArray().removeAt(i);
  }

  patchForms(obj) {
    this.savedTemplateFields = obj;
    this.aService.getDataTypes().subscribe((res) => {
      this.validTypes = res;
      let type;
      obj.forEach(element => {
        this.validTypes.forEach(t => {
          if (t.id === element.data_type) {
            type = t.name;
          }
        });
        const template =
          this.fb.group({
            label: element.name,
            text: '',
            type,
          });

        this.templateArray().push(template);

      });
    });
  }

  // patchTextField() {
  //   console.log('patchtextfield');
  //   // const template =
  //   //       this.fb.group({
  //   //         label: element.name,
  //   //         text: this.responseText,
  //   //         type,
  //   //       });
  //   console.log(this.templateArray());
  //   const ta = this.templateArray();
  //   ta.at(0).patchValue({ text: this.responseText });
  //   // ta.patchValue([]);
  // }
  onTemplateSubmit(t, i) {
    // console.log('aaaaa', i);
    // console.log('bbbbb', t.value.type);
    // console.log('bbbbb', this.validTypes);
    // console.log('bbbbb', i);
    // console.log(this.templateForm.value.templateArray[i]);
    let typeId;
    this.validTypes.forEach(type => {
      // console.log(type.name);
      // console.log(t.value.type);
      if (type.name === t.value.type) {
        // console.log("inside if");
        typeId = type.id;
      }
    });

    console.log(this.templateId);
    const fieldData = {
      label: t.value.label,
      type: typeId,
      text: t.value.text,
      sequence_num: i,
      template: this.templateId,
    };
    console.log(fieldData);
    this.aService.postTemplateFieldData(fieldData).subscribe(res => {
      console.log(res);
    }, error => console.log(error));
    //   // API Call to confirm field data.
  }
  onSubmit() {
    console.log('onSubmit called');
    console.log(this.templateForm.controls);
  }

  onSelect(f) {
    // console.log(f.value);

    this.savedTemplateFields.find((t) => {
      if (t.name == f.value.label) {
        console.log(t);

        const coordinates = {
          pos: {
            x: t.bounding_box_x_value,
            y: t.bounding_box_y_value,
          },
          w: t.bounding_box_w_value,
          h: t.bounding_box_h_value
        };
        this.aService.callKonvaComponent(coordinates, t.page_number);
      }
    });
  }
}
