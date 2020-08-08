import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AnnotationdataService } from '../services/annotationdata.service';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  imageSrc;
  imageLoaded = false;
  showUpload = false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private aService: AnnotationdataService,
    public matDialog: MatDialog,
  ) { }
  displayedColumns = ['name', 'is_image', 'operations'];
  dataSource = new MatTableDataSource<any>();

  templateArray = [];

  templateObject = {
    'name': '',
    'file_path': null,
    'is_image': false,
    'is_active': false,
    'document_type': null,
    'created_by': null,
    'updated_by': null
  };

  documentObject = {
    'file_name': '',
    'file_path': null,
    'status': null,
    'is_active': false,
    'batch': null,
    'template': null
  };

  ngOnInit(): void {
    this.aService.getTemplates().subscribe((res) => {
      this.dataSource.data = res;
    });
  }

  onSelectFile(e: { target: { files: string | any[]; }; }): void {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      console.log(e.target.files[0].name);

      reader.addEventListener('load', () => {
        this.imageSrc = reader.result;
      });
      reader.addEventListener('loadend', () => {
        this.imageLoaded = true;
        const name = e.target.files[0].name.split('.');
        console.log(name);
        const obj = {
          name: name[0],
          document_type: 1,
          created_by: 1,
          updated_by: 1,
          file: this.imageSrc
        };

        this.aService.addTemplate(obj).subscribe((res) => {
          console.log(res);
          this.router.navigate(['review'], { queryParams: { template: res.id } });
        });
        // console.log(this.imageSrc);
        // localStorage.setItem('file', this.imageSrc);
        // localStorage.setItem('fileName', e.target.files[0].name)
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  viewTemplate(e) {
    this.router.navigate(['review'], { queryParams: { template: e.id } });
  }

  deleteWorksheet() { }

  addTemplate() {
    this.showUpload = true;
  }
}
