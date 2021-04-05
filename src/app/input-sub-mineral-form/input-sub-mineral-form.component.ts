import { Component, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { InputCondition } from '../models/inputMineral';
import { AuthenticationService } from '../services/authentication.service';
import { RouterServices } from '../services/router.services';
import { environment } from 'src/environments/environment';
import { LanguageService, TextTranslator } from '../services/language.service';

@Component({
  selector: 'app-input-sub-mineral-form',
  templateUrl: './input-sub-mineral-form.component.html',
  styleUrls: ['./input-sub-mineral-form.component.css']
})
export class InputSubMineralFormComponent implements OnInit {
  submitted = false;
  userForm: FormGroup;
  serviceErrors: any = {};
  activePage: any = {};
  allLocality: any = [];
  serverServiceErrors: any = {};
  successLoadCondition: string;
  inputCondition: InputCondition = new InputCondition();
  titleImage: string;

  imgURL: any;
  mainImage: any;
  product: any = {};

  titleMain_txt: string;
  titleMainTranslation: TextTranslator = {
    cz: "Vložit pod-minerál",
    en: "Input sub-mineral"
  };
  comment_txt: string;
  commentTranslation: TextTranslator = {
    cz: "Komentář",
    en: "Comment"
  };
  chooseImage_txt: string;
  chooseImageTranslation: TextTranslator = {
    cz: "Vybrat obrázek",
    en: "Choose image"
  };
  store_txt: string;
  storeTranslation: TextTranslator = {
    cz: "Uložit",
    en: "Store"
  };

  constructor(
    public elementRef: ElementRef,
    public formBuilder: FormBuilder,
    public http: HttpClient,
    public auth: AuthenticationService,
    public languageService: LanguageService,
    public routerService: RouterServices) {
    this.titleMain_txt = this.languageService.getNativeLanguageText(this.titleMainTranslation);
    this.comment_txt = this.languageService.getNativeLanguageText(this.commentTranslation);
    this.chooseImage_txt = this.languageService.getNativeLanguageText(this.chooseImageTranslation);
    this.store_txt = this.languageService.getNativeLanguageText(this.storeTranslation);
    this.resetTitleImage();
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
    this.titleImage = this.chooseImage_txt;
  }

  invalidComment() {
    return (this.submitted && this.userForm.controls.comment.errors != null);
  }

  invalidImg() {
    return (this.submitted && this.userForm.controls.img.errors != null);
  }

  copyServerErrors(returnData: any) {
    this.serverServiceErrors.comment = returnData.inputErrorMessage.comment;
    this.serverServiceErrors.img = returnData.inputErrorMessage.img;
    this.serverServiceErrors.uploadSuccess = returnData.inputErrorMessage.uploadSuccess;
  }

  cleanServerErrors() {
    this.serverServiceErrors.comment = null;
    this.serverServiceErrors.img = null;
    this.serverServiceErrors.uploadSuccess = null;
  }

  ngOnInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#242020';
    this.product = history.state;
    if (this.product.data == null) {
      this.routerService.inputMineral();
    }
    else {
      this.mainImage = this.product.data.achatdbCollection._id;
    }

    this.userForm = this.formBuilder.group({
      comment: [null, [Validators.required, Validators.maxLength(50)]],
      img: [null],
    },
      { updateOn: "submit" }
    );

    this.resetTitleImage();

    this.http.get(environment.urlAddress + '/api/v1/user_input/subMineral').subscribe((data: any) => {
      this.allLocality = data.localities;
      this.activePage = data.activePage;
    }, error => {
    });
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
      return;

    }
    else {
      Object.keys(this.userForm.value).forEach(key => {
        formData.append(key, this.userForm.value[key]);
      });
      formData.append("mainImage", this.mainImage);

      this.http.post<any>(environment.urlAddress + '/api/v1/user_input/subMineral', formData).subscribe((returnData: any) => {

        this.inputCondition.errorLoad = returnData.inputErrorMessage.uploadError;
        this.activePage = returnData.activePage;
        this.copyServerErrors(returnData);
        this.allLocality = returnData.localities;
        if (null == returnData.inputErrorMessage.uploadSuccess) {
        }
        else {
          this.submitted = false;
          this.userForm.get('img').setValue('', { emitEvent: true });
          this.userForm.reset();
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

