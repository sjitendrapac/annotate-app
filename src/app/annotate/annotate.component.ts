import { ReviewComponent } from './../review/review.component';
import { LayoutModule } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NgForm, FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
// import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { AnnotationdataService } from '../services/annotationdata.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-annotate',
  templateUrl: './annotate.component.html',
  styleUrls: ['./annotate.component.css']
})


export class AnnotateComponent implements OnInit {
  // @ViewChild(MatPaginator) paginator: MatPaginator;
  // tslint:disable-next-line: no-input-rename
  @Input('templateId') templateId;
  // tslint:disable-next-line: no-input-rename
  @Input('mycheckbox') mycheckbox: MatCheckbox;

  dataSource = new MatTableDataSource<any>();

  fieldSubmitted = true;

  displayedColumns = ['label', 'type', 'text','attachedLabel'];

  templateForm: FormGroup;

  savedTemplateFields;
  storedFieldNames = [];
  selectedFormIndex;
  rectReady = false;

  subscription: Subscription;
  mission = '<no mission announced>';
  data = [];
  responseText: string;
  isBgColored: boolean;

  validTypes;

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
    this.aService.AnnotateCalled$.subscribe((res) => {
      this.patchTextField(res.responseText, res.isBgColored);
      this.isBgColored = res.isBgColored;
      
      // this.selectedFormIndex
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
      checkbox: new FormControl(),
      attachedLabel: new FormControl()
    });
  }

  addTemplate() {
    console.log(this.fieldSubmitted);
    if (this.fieldSubmitted) {
      this.templateArray().push(this.newTemplate());
      this.selectedFormIndex = this.templateArray().length - 1;
      this.fieldSubmitted = false;
    }
  }

  removeTemplate(i: number) {
    this.templateArray().removeAt(i);
    this.fieldSubmitted = true;
  }

  patchForms(obj) {
    this.savedTemplateFields = obj;
    console.log(this.savedTemplateFields);
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
            text: element.value,
            type,
            checkbox: element.is_bg_colored,
            attachedLabel:''
          });

        this.templateArray().push(template);
        // console.log(this.mycheckbox.id);
        // this.storedFieldNames.push(element.name);

      });
    });
  }

  patchTextField(text, isBgColored) {
    const i = this.selectedFormIndex;
    console.log(i);
    if(this.aService.isAddLabelToTemplate()){
    this.templateArray().at(i).get('attachedLabel').patchValue(text);
    this.aService.setAddLabelToTemplate(false);
    }else{
    this.templateArray().at(i).get('text').patchValue(text);
    this.templateArray().at(i).get('checkbox').patchValue(isBgColored);
    console.log(this.templateArray().at(i).get('checkbox').value);
    // this.templateArray().at(i).get('checkbox').value = true;
  }
}
  onTemplateSubmit(t, i) {
    let typeId;
    this.validTypes.forEach(type => {
      if (type.name === t.value.type) {
        typeId = type.id;
      }
    });
    console.log('checlbox:', t.value.checkbox);
    const fieldData = {
      label: t.value.label,
      type: typeId,
      value: t.value.text,
      attachedLabel:t.value.attachedLabel,
      sequence_num: i,
      template: this.templateId,
      is_bg_colored: this.isBgColored
    };
    // console.log(fieldData);
    this.aService.postTemplateFieldData(fieldData).subscribe(res => {
      console.log(res);
      this.fieldSubmitted = true;
      this.aService.enableCanvas();
      this.isBgColored = false;
      // const obj = { id: this.templateId, pageNo: '' };
      // this.aService.viewTemplate(obj).subscribe((res) => {
      //   console.log(res[res.length - 1]);
      //   const element = res[res.length - 1];
      //   t = this.validTypes.find((i) => i.type === element.data_type);
      //   console.log(t);
      //   const template =
      //     this.fb.group({
      //       label: element.name,
      //       text: element.value,
      //       type,
      //     });
      //   this.templateArray().push(template);
      //   // this.patchForms(res);
      // }, (err => console.log(err)
      // ));
      this.addTemplate();
    }, error => console.log(error));
    //   // API Call to confirm field data.
  }
  onSubmit() {
    console.log('onSubmit called');
    console.log(this.templateForm.controls);
  }

  onSelect(f, i) {
    if(this.aService.isAddLabelToTemplate()){
      return;
    }
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


  addLabelToTempateClick(index) {
  // this.isLabelButtonShw = true;
  this.selectedFormIndex = index;
  this.aService.setAddLabelToTemplate(true);
  this.aService.enableCanvas();
    // this.templateFieldObj['fieldData']= this.responseText;
    // this.responseText = '';    
    // const tempNodes = this.layer.find('Rect');
    // this.showLabelBtn=false;
    // this.clearRectangles();    
  }

}
