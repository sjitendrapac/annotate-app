import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm, FormGroup, FormBuilder } from '@angular/forms';
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

  templateFields: FormGroup;

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
    this.subscription = aService.missionAnnounced$.subscribe(
      mission => {
        this.mission = mission;
        this.rectReady = true;
      });
  }


  ngOnInit() {
    this.templateFields = this.fb.group({
      label: [''],
      text: [''],
      type: [''],
    });
  }

  ngDoCheck() {
    this.data = this.aService.getData();
    this.responseText = this.aService.getText();
    this.templateFields.patchValue({
      text: this.responseText
    });
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy(): void {
    // prevent memory leak when component destroyed
    this.subscription.unsubscribe();
  }

  // tslint:disable-next-line: typedef
  // get f() { return this.uploadForm.controls; }

  onSubmit() {
    // console.log(this.templateFields.controls);
    const fieldData = {
      label: this.templateFields.controls.label.value,
      type: this.templateFields.controls.type.value,
      text: this.templateFields.controls.text.value,
    };
    this.aService.postTemplateFieldData(fieldData).subscribe(res => {
      console.log(res);

    }, error => console.log(error));
    // API Call to confirm field data.
  }
}
