import { LayoutModule } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild } from '@angular/core';
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
  dataSource = new MatTableDataSource<any>();

  displayedColumns = ['label', 'type', 'text'];

  templateForm: FormGroup;
  templateFields: FormGroup;
  templateFieldsArray: FormArray;

  rectReady = false;

  subscription: Subscription;
  mission = '<no mission announced>';
  data = [];
  responseText: string;

  validTypes = [
    { type: 'Numeric' },
    { type: 'Alphanumeric' }
  ];

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
    this.addTemplate();
    this.aService.enableCanvas();
  }

  ngDoCheck() {
    this.data = this.aService.getData();

    // this.responseText = this.aService.getText();

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
    console.log('patch form', obj);
    // for(let)
    const template = {
      label: obj.label,
      text: obj.text,
      type: obj.data_type
    };
    const formObj = { templateArray: [template] };

    console.log(formObj);
    this.templateForm.patchValue([
      formObj
    ]);
    // this.templateFields.patchValue({
    //   text: this.responseText
    // });
  }
  // tslint:disable-next-line: typedef
  // get f() { return this.uploadForm.controls; }

  onTemplateSubmit(t) {
    // console.log('aaaaa', i);
    console.log('bbbbb', t.value);
    // console.log(this.templateForm.value.templateArray[i]);

    const fieldData = {
      label: t.value.label,
      type: t.value.type,
      text: t.value.text,
    };
    // console.log(fieldData);
    this.aService.postTemplateFieldData(fieldData).subscribe(res => {
      console.log(res);
    }, error => console.log(error));
    //   // API Call to confirm field data.
  }
  onSubmit() {
    console.log('onSubmit called');
    console.log(this.templateForm.value);
  }
}
