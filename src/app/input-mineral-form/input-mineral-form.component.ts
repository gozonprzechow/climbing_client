import { Component, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { InputCondition } from '../models/inputMineral';
import { AuthenticationService } from '../services/authentication.service';
import { RouterServices } from '../services/router.services';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-input-mineral-form',
  templateUrl: './input-mineral-form.component.html',
  styleUrls: ['./input-mineral-form.component.css']
})
export class InputMineralFormComponent implements OnInit {
  submitted = false;
  userForm: FormGroup;
  serviceErrors: any = {};
  activePage: any = {};
  allLocality: any = [];
  serverServiceErrors: any = {};
  successLoadCondition: string;
  inputCondition: InputCondition = new InputCondition();
  tittleMain: string;
  titleImage: string;

  imgURL: any;

  // @ViewChild(FormGroup, {static: false}) child : FormGroup;

  constructor(
    public elementRef: ElementRef,
    public formBuilder: FormBuilder,
    public http: HttpClient,
    public routerService: RouterServices,
    public auth: AuthenticationService) {
  }

  ngOnInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#242020';
    this.resetTitleImage();
    this.userForm = this.formBuilder.group({
      title: [null, [Validators.required, Validators.maxLength(50)]],
      locality: [null, [Validators.required, Validators.maxLength(50)]],
      comment: [null, [Validators.required, Validators.maxLength(50)]],
      date: [null],
      img: [null],
    },
      { updateOn: "submit" }
    );

    let postedBy = this.auth.getLogUserId();
    this.auth.saveActualUserId(postedBy);
    this.http.get(environment.urlAddress + '/api/v1/user_input/mineral/' + postedBy).subscribe((returnData: any) => {
      this.allLocality = returnData.localities;
      this.activePage = returnData.activePage;
      this.tittleMain = 'Input Mineral';
    }, error => {
      console.log("There was an error generating the proper GUID on the server", error);
    });
  }

  isFieldValid(field: string) {
    return !this.userForm.get(field).valid && this.userForm.get(field).touched;
  }

  displayFieldCss(field: string) {
    return {
      'has-error': this.isFieldValid(field),
      'has-feedback': this.isFieldValid(field)
    };
  }

  resetTitleImage() {
    this.titleImage = "Choose Image";
  }

  invalidTitle() {
    return (this.submitted && this.userForm.controls.title.errors != null);
  }

  invalidLocality() {
    return (this.submitted && this.userForm.controls.locality.errors != null);
  }

  invalidComment() {
    return (this.submitted && this.userForm.controls.comment.errors != null);
  }

  invalidDate() {
    return (this.submitted && this.userForm.controls.date.errors != null);
  }

  invalidImg() {
    return (this.submitted && this.userForm.controls.img.errors != null);
  }

  copyServerErrors(returnData: any) {
    this.serverServiceErrors.title = returnData.inputErrorMessage.title;
    this.serverServiceErrors.locality = returnData.inputErrorMessage.locality;
    this.serverServiceErrors.comment = returnData.inputErrorMessage.comment;
    this.serverServiceErrors.date = returnData.inputErrorMessage.date;
    this.serverServiceErrors.img = returnData.inputErrorMessage.img;
    this.serverServiceErrors.uploadSuccess = returnData.inputErrorMessage.uploadSuccess;
  }

  cleanServerErrors() {
    this.serverServiceErrors.title = null;
    this.serverServiceErrors.locality = null;
    this.serverServiceErrors.comment = null;
    this.serverServiceErrors.date = null;
    this.serverServiceErrors.img = null;
    this.serverServiceErrors.uploadSuccess = null;
  }

  onFileSelect(event) {
    if (1 == event.target.files.length) {
      const file = event.target.files[0];
      this.userForm.get('img').setValue(file);
      this.titleImage = file.name;
      event.srcElement.value = "";

      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (_event) => {
        this.imgURL = reader.result;
      }
    }
  }

  onSubmit() {
    let formData = new FormData();
    this.submitted = true;

    if (this.userForm.invalid == true) {

      this.cleanServerErrors();
      this.inputCondition.successLoad = null;
      this.routerService.inputMineral();
      return;

    }
    else {
      Object.keys(this.userForm.value).forEach(key => {
        formData.append(key, this.userForm.value[key]);
      });
      formData.append("mainImage", "");

      let postedBy = this.auth.getLogUserId();
      this.http.post<any>(environment.urlAddress + '/api/v1/user_input/mineral/' + postedBy, formData).subscribe((returnData: any) => {

        this.inputCondition.errorLoad = null;
        this.activePage = returnData.activePage;
        this.copyServerErrors(returnData);
        this.allLocality = returnData.localities;
        if (null == returnData.inputErrorMessage.uploadSuccess) {
        }
        else {
          this.submitted = false;
          this.userForm.get('img').setValue('', { emitEvent: true });
          this.userForm.get('title').setValue('', { emitEvent: true });
          this.userForm.get('comment').setValue('', { emitEvent: true });
          this.userForm.get('date').setValue('', { emitEvent: true });
          this.resetTitleImage();
          this.imgURL = null;
        }
      }, error => {
        this.routerService.notLoginError();
        this.serverServiceErrors.uploadSuccess = null;
      });

    }
  }

}
