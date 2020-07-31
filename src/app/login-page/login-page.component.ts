import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
// import { WorksheetService } from '../services/worksheet.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';

  loginDetails = {
    "username": "",
    "password": ""
  };

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.loading = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    this.loginDetails.username = this.f.username.value;
    this.loginDetails.password = this.f.password.value;

    console.log(this.loginDetails.username);
    console.log(this.loginDetails.password);
    this.loading = false;

    // this.worksheetService.loginCheck(this.loginDetails)
    //   .subscribe(
    //     data => {
    //       if (data.loginResponse == 'true') {
    //         localStorage.setItem('currentUser', JSON.stringify({ details: this.loginDetails }));
    //         this.loading = false;
    //         this.router.navigate([this.returnUrl]);
    //       } else {
    //         this.error = "Invalid Email Id or Password";
    //         this.loading = false;
    //       }
    //     },
    //     error => {
    //       if (error.status == 401) {
    //         this.error = "Invalid Email Id or Password";
    //       } else {
    //         this.error = "Login failed. Please try again later.";
    //       }
    //       this.loading = false;
    //     });
  }

}
