import { Component, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { InputCondition } from '../models/inputLocality';
import { AuthenticationService } from '../services/authentication.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-recover-password-form',
  templateUrl: './recover-password-form.component.html',
  styleUrls: ['./recover-password-form.component.css']
})

export class RecoverPasswordFormComponent implements OnInit {
  submitted = false;
  userForm: FormGroup;
  serviceErrors: any = {};
  serverServiceErrors: any = {};
  successLoadCondition: string;
  inputCondition: InputCondition = new InputCondition();
  tittleMain: string;
  errorMessage: string;

  returnMessage: string;

  constructor(
    public elementRef: ElementRef,
    public formBuilder: FormBuilder,
    public auth: AuthenticationService,
    public http: HttpClient) {
    this.tittleMain = 'Password recovery';
  }

  invalidEmail() {
    return (this.submitted && this.userForm.controls.email.errors != null);
  }

  copyServerErrors(returnData: any) {
    this.serverServiceErrors.email = returnData.inputErrorMessage.email;
    this.serverServiceErrors.uploadSuccess = returnData.inputErrorMessage.uploadSuccess;
  }

  cleanServerErrors() {
    this.serverServiceErrors.email = null;
    this.serverServiceErrors.uploadSuccess = null;
  }

  ngOnInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#242020';
    this.userForm = this.formBuilder.group({
      email: ['',],
    },
      { updateOn: "submit" }
    );
  }

  onSubmit() {
    let formData = new FormData();
    let path = '/recoverPassword';
    this.submitted = true;

    if (this.userForm.invalid == true) {

      this.cleanServerErrors();
      this.inputCondition.successLoad = null;
      return;

    }
    else {
      Object.keys(this.userForm.value).forEach(key => {
        formData.append(key, this.userForm.value[key]);
      });

      this.http.post<any>(environment.urlAddress + '/api/v1/user_input/recover', formData).subscribe((returnData: any) => {

        this.inputCondition.errorLoad = null;
        this.copyServerErrors(returnData);
        this.errorMessage = null;

        if (null == returnData.inputErrorMessage.uploadSuccess) {
        }
        else {
          // this.submitted = false;
          // this.userForm.controls.password.setValue('');
          // this.userForm.reset();
          this.returnMessage = returnData.message;
          this.submitted = false;
          this.userForm.reset();
        }

      }, error => {
        this.errorMessage = error.error.message;
      });
    }
  }

}