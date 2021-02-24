import { Component, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { InputCondition } from '../models/inputLocality';
import { ValidationService } from '../models/validation';
import { AuthenticationService, TokenPayload } from '../services/authentication.service';
import { RouterServices } from '../services/router.services';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-create-account-form',
  templateUrl: './create-account-form.component.html',
  styleUrls: ['./create-account-form.component.css']
})

export class CreateAccountFormComponent implements OnInit {
  credentials: TokenPayload = {
    email: '',
    name: '',
    password: ''
  };

  submitted = false;
  userForm: FormGroup;
  serviceErrors: any = {};
  serverServiceErrors: any = {};
  successLoadCondition: string;
  inputCondition: InputCondition = new InputCondition();
  tittleMain: string;

  constructor(
    public elementRef: ElementRef,
    public formBuilder: FormBuilder,
    public auth: AuthenticationService,
    public http: HttpClient,
    public routerService: RouterServices) {
    this.tittleMain = 'Create account';
  }

  invalidName() {
    return (this.submitted && this.userForm.controls.name.errors != null);
  }

  invalidEmail() {
    return (this.submitted && this.userForm.controls.email.errors != null);
  }

  invalidPassword() {
    return (this.submitted && this.userForm.controls.password.errors != null);
  }

  copyServerErrors(returnData: any) {
    this.serverServiceErrors.name = returnData.inputErrorMessage.name;
    this.serverServiceErrors.email = returnData.inputErrorMessage.email;
    this.serverServiceErrors.password = returnData.inputErrorMessage.password;
    this.serverServiceErrors.uploadSuccess = returnData.inputErrorMessage.uploadSuccess;
  }

  cleanServerErrors() {
    this.serverServiceErrors.name = null;
    this.serverServiceErrors.email = null;
    this.serverServiceErrors.password = null;
    this.serverServiceErrors.uploadSuccess = null;
  }

  ngOnInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#242020';
    this.userForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, ValidationService.emailValidator]],
      password: ['', [Validators.required, ValidationService.passwordValidator]],
    },
      { updateOn: "submit" }
    );
  }

  onSubmit() {
    let formData = new FormData();
    this.submitted = true;

    if (this.userForm.invalid == true) {

      this.cleanServerErrors();
      this.inputCondition.successLoad = null;
      return;

    }
    else {

      this.credentials.name = this.userForm.controls.name.value;
      this.credentials.email = this.userForm.controls.email.value;
      this.credentials.password = this.userForm.controls.password.value;

      this.auth.register(this.credentials).subscribe((returnData: any) => {

        this.inputCondition.errorLoad = null;
        this.copyServerErrors(returnData);
        if (null == returnData.inputErrorMessage.uploadSuccess) {
        }
        else {
          this.routerService.successCreateAccount(returnData.message);
        }

      }, error => {
      });
    }
  }

}