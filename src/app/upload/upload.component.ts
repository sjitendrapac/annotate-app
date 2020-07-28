import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AnnotationdataService } from '../services/annotationdata.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  imageSrc;
  imageLoaded = false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private aService: AnnotationdataService
  ) { }

  ngOnInit(): void {
  }
  onSelectFile(e: { target: { files: string | any[]; }; }): void {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        this.imageSrc = reader.result;
      });
      reader.addEventListener('loadend', () => {
        this.imageLoaded = true;
        console.log(
          'image loadend', this.imageSrc
        );
        this.aService.loadImage(this.imageSrc);
        this.router.navigate(['review']);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  }
}
