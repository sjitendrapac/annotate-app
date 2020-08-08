import { AnnotateComponent } from './../annotate/annotate.component';
import { AnnotationdataService } from './../services/annotationdata.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit {
  disableUntilComplete = true;
  templateId;
  templateFieldsArray;
  @ViewChild(AnnotateComponent) annotate: AnnotateComponent;
  constructor(
    private router: Router,
    private aService: AnnotationdataService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.templateId = this.route.snapshot.queryParams.template;
    this.getTemplateFields();
  }

  getTemplateFields() {
    this.aService.viewTemplate(this.templateId).subscribe((res) => {
      // console.log(res);
      this.templateFieldsArray = res;
      this.annotate.patchForms(this.templateFieldsArray);
    }, (err => console.log(err)
    ));
  }

  goBack() {
    this.router.navigate(['']);
  }

  addLabel() {
    this.aService.enableCanvas();
    this.annotate.addTemplate();
    // this.disableUntilComplete = false;
  }

}
