import { ReviewComponent } from './../review/review.component';
import { LayoutModule } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NgForm, FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
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
  fieldSubmitted: true;

  displayedColumns = ['label', 'type', 'text'];

  templateForm: FormGroup;

  savedTemplateFields;
  storedFieldNames = [];
  selectedFormIndex;

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
    this.aService.AnnotateCalled$.subscribe((res) => {
      this.patchTextField(res);
    });

  }

  // ngDoCheck() {
  //   this.data = this.aService.getData();
  //   this.responseText = this.aService.getText();
  // }

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
      label: new FormControl(),
      text: new FormControl(),
      type: new FormControl(),
    });
  }

  addTemplate() {
    this.templateArray().push(this.newTemplate());
    this.selectedFormIndex = this.templateArray().length - 1;
  }

  removeTemplate(i: number) {
    this.templateArray().removeAt(i);
  }
  // checkSubmission(f) {
  //   // if (t.value.label ==)
  //   console.log('checkSubmission');
  //   this.savedTemplateFields.find((t) => {
  //     if (t.name === f.value.label) {
  //       console.log('true', t.name, f.value.label);
  //       return true;
  //     } else {
  //       console.log('false', t.name, f.value.label);
  //       return false;
  //     }
  //   });
  // }
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
        // this.storedFieldNames.push(element.name);

      });
    });
  }

  patchTextField(text) {
    const i = this.selectedFormIndex;
    console.log(i);
    this.templateArray().at(i).get('text').patchValue(text);
  }
  onTemplateSubmit(t, i) {
    let typeId;
    this.validTypes.forEach(type => {
      if (type.name === t.value.type) {
        typeId = type.id;
      }
    });

    const fieldData = {
      label: t.value.label,
      type: typeId,
      text: t.value.text,
      sequence_num: i,
      template: this.templateId,
    };
    // console.log(fieldData);
    this.aService.postTemplateFieldData(fieldData).subscribe(res => {
      console.log(res);
      this.fieldSubmitted = true;
    }, error => console.log(error));
    //   // API Call to confirm field data.
  }
  onSubmit() {
    console.log('onSubmit called');
    console.log(this.templateForm.controls);
  }

  onSelect(f, i) {
    this.selectedFormIndex = i;
    this.savedTemplateFields.find((t) => {
      if (t.name === f.value.label) {
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
