import { AnnotationdataService } from './../services/annotationdata.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit {
  disableUntilComplete = true;
  constructor(private router: Router, private aService: AnnotationdataService) { }

  ngOnInit(): void {
  }

  goBack() {
    this.router.navigate(['']);
  }

  addLabel() {
    this.aService.addField();
    this.disableUntilComplete = false;
  }

}
