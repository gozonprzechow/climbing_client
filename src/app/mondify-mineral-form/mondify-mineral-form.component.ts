import { Component, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { DatePipe } from '@angular/common';
import { InputCondition } from '../models/inputMineral';
import { AuthenticationService } from '../services/authentication.service';
import { RouterServices } from '../services/router.services';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-mondify-mineral-form',
  templateUrl: './mondify-mineral-form.component.html',
  styleUrls: ['./mondify-mineral-form.component.css'],
  providers: [DatePipe]
})

export class MondifyMineralFormComponent implements OnInit {
  submitted = false;
  userForm: FormGroup;
  prefix: string;
  serviceErrors: any = {};
  activePage: any = {};
  achatdbCollection: any = {};
  previousRoute: string;
  allLocality: any = [];
  serverServiceErrors: any = {};
  successLoadCondition: string;
  inputCondition: InputCondition = new InputCondition();
  tittleMain: string;
  titleImage: string;

  imgURL: any;
  product: any = {};

  constructor(
    public elementRef: ElementRef,
    public formBuilder: FormBuilder,
    public http: HttpClient,
    public auth: AuthenticationService,
    public routerService: RouterServices,
    public datePipe: DatePipe) {
    this.prefix = "http://server.sutrak.net/static/uploads/images/";
  }

  ngOnInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#242020';
    this.resetTitleImage();

    this.product = history.state;
    if (this.product.data == null) {
      this.routerService.inputMineral();
    }
    else {
      this.achatdbCollection = this.product.data.achatdbCollection;
      this.previousRoute = this.product.data.previousRoute;
    }

    this.achatdbCollection.date = this.datePipe.transform(this.achatdbCollection.date, 'yyyy-MM-dd');
    this.imgURL = this.getImageLarge(this.achatdbCollection.imgName);

    this.userForm = this.formBuilder.group({
      title: [this.achatdbCollection.title, [Validators.required, Validators.maxLength(50)]],
      locality: [this.achatdbCollection.locality, [Validators.required, Validators.maxLength(50)]],
      comment: [this.achatdbCollection.comment, [Validators.required, Validators.maxLength(50)]],
      date: [this.achatdbCollection.date],
      img: [null],
    },
      { updateOn: "submit" }
    );

    let postedBy = this.auth.getLogUserId();
    this.http.get(environment.urlAddress + '/api/v1/user_input/modifyMineral/' + postedBy).subscribe((returnData: any) => {
      this.allLocality = returnData.localities;
      this.activePage = returnData.activePage;
      this.tittleMain = 'Modify mineral';
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

  displayImgFieldCss(field: string) {
    return {
      'has-error': true,
      'has-feedback': true
    };
  }

  resetTitleImage() {
    this.titleImage = "Change Image";
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

  public getImageLarge(imgName): string {
    return this.prefix + imgName;
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
      this.invalidFormAction();
      return;

    }
    else {
      formData = this.appendFormData(formData);
      let postedBy = this.auth.getLogUserId();
      this.http.post<any>(environment.urlAddress + '/api/v1/user_input/modifyMineral/' + postedBy, formData).subscribe((returnData: any) => {

        this.copyReturnData(returnData);
        if (null == returnData.inputErrorMessage.uploadSuccess) {
        }
        else {
          this.setDataOnUploadSuccess();
        }
      }, error => {
        this.routerService.notLoginError();
        this.serverServiceErrors.uploadSuccess = null;
      });

    }
  }

  invalidFormAction() {
    this.cleanServerErrors();
    this.inputCondition.successLoad = null;
  }

  appendFormData(formData) {
    Object.keys(this.userForm.value).forEach(key => {
      formData.append(key, this.userForm.value[key]);
    });
    formData.append("achatdbCollection", JSON.stringify(this.achatdbCollection));
    return formData;
  }

  copyReturnData(returnData) {
    this.inputCondition.errorLoad = null;
    this.activePage = returnData.activePage;
    this.copyServerErrors(returnData);
    this.allLocality = returnData.localities;
  }

  setDataOnUploadSuccess() {
    this.submitted = false;
    this.userForm.get('img').setValue('', { emitEvent: true });
    this.userForm.reset();
    this.resetTitleImage();
    this.imgURL = null;
    this.routerService.returnToPreviousPage(this.previousRoute);
  }

}

