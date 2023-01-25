import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { InputCondition } from '../models/inputMineral';
import { AuthenticationService } from '../services/authentication.service';
import { RouterServices } from '../services/router.services';
import { environment } from 'src/environments/environment';
import { LanguageService, TextTranslator } from '../services/language.service';
import { ResizeService, SCREEN_SIZE } from '../services/resize.service';
import { MobileService } from '../services/mobile.service';

@Component({
  selector: 'app-mondify-mineral-form',
  templateUrl: './mondify-mineral-form.component.html',
  styleUrls: ['./mondify-mineral-form.component.css', '../models/mobile.css'],
  providers: [DatePipe],
})
export class MondifyMineralFormComponent implements OnInit {
  submitted = false;
  userForm: FormGroup;
  serviceErrors: any = {};
  activePage: any = {};
  achatdbCollection: any = {};
  previousRoute: string;
  allLocality: any = [];
  serverServiceErrors: any = {};
  successLoadCondition: string;
  inputCondition: InputCondition = new InputCondition();
  titleImage: string;

  imgURL: any;
  product: any = {};

  is_submit_in_progress: Boolean = false;

  titleMain_txt: string;
  titleMainTranslation: TextTranslator = {
    cz: 'Upravit minerál',
    en: 'Modify mineral',
  };
  title_txt: string;
  titleTranslation: TextTranslator = {
    cz: 'Popisek',
    en: 'Title',
  };
  locality_txt: string;
  localityTranslation: TextTranslator = {
    cz: 'Lokalita',
    en: 'Locality',
  };
  comment_txt: string;
  commentTranslation: TextTranslator = {
    cz: 'Komentář',
    en: 'Comment',
  };
  priority_txt: string;
  priorityTranslation: TextTranslator = {
    cz: 'Priorita <0, 1000>',
    en: 'Priority <0, 1000>',
  };
  date_txt: string;
  dateTranslation: TextTranslator = {
    cz: 'Datum',
    en: 'Date',
  };
  chooseImage_txt: string;
  chooseImageTranslation: TextTranslator = {
    cz: 'Změnit obrázek',
    en: 'Change image',
  };
  store_txt: string;
  storeTranslation: TextTranslator = {
    cz: 'Uložit',
    en: 'Store',
  };
  submitInProgress_txt: string;
  submitInProgressTranslation: TextTranslator = {
    cz: 'Čekej. . .',
    en: 'Wait. . .',
  };

  constructor(
    public elementRef: ElementRef,
    public formBuilder: FormBuilder,
    public http: HttpClient,
    public auth: AuthenticationService,
    public routerService: RouterServices,
    public languageService: LanguageService,
    public datePipe: DatePipe,
    public resizeSvc: ResizeService,
    public mobileService: MobileService,
  ) {
    this.titleMain_txt = this.languageService.getNativeLanguageText(
      this.titleMainTranslation,
    );
    this.title_txt = this.languageService.getNativeLanguageText(this.titleTranslation);
    this.locality_txt = this.languageService.getNativeLanguageText(
      this.localityTranslation,
    );
    this.comment_txt = this.languageService.getNativeLanguageText(
      this.commentTranslation,
    );
    this.priority_txt = this.languageService.getNativeLanguageText(
      this.priorityTranslation,
    );
    this.date_txt = this.languageService.getNativeLanguageText(this.dateTranslation);
    this.chooseImage_txt = this.languageService.getNativeLanguageText(
      this.chooseImageTranslation,
    );
    this.store_txt = this.languageService.getNativeLanguageText(this.storeTranslation);
    this.submitInProgress_txt = this.languageService.getNativeLanguageText(
      this.submitInProgressTranslation,
    );
  }

  ngOnInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#242020';
    this.resizeSvc.refreshScreenSize(window.innerWidth);
    this.resetTitleImage();

    this.product = history.state;
    if (this.product.data == null) {
      this.routerService.inputMineral();
    } else {
      this.achatdbCollection = this.product.data.achatdbCollection;
      this.previousRoute = this.product.data.previousRoute;
    }

    this.achatdbCollection.date = this.datePipe.transform(
      this.achatdbCollection.date,
      'yyyy-MM-dd',
    );
    this.imgURL = this.getImageLarge(
      this.achatdbCollection.imgName,
      this.achatdbCollection.imgPath,
    );

    this.userForm = this.formBuilder.group(
      {
        title: [
          this.achatdbCollection.title,
          [Validators.required, Validators.maxLength(50)],
        ],
        locality: [
          this.achatdbCollection.locality,
          [Validators.required, Validators.maxLength(50)],
        ],
        comment: [this.achatdbCollection.comment, [Validators.maxLength(300)]],
        priority: [this.achatdbCollection.priority, [Validators.maxLength(100), Validators.pattern('^[0-9]+$')]],
        date: [this.achatdbCollection.date],
        img: [null],
      },
      { updateOn: 'submit' },
    );

    let postedBy = this.auth.getLogUserId();
    this.http
      .get(environment.urlAddress + '/api/v1/user_input/modifyMineral/' + postedBy)
      .subscribe(
        (returnData: any) => {
          this.allLocality = returnData.localities;
          this.activePage = returnData.activePage;
        },
        (error) => {
          console.log(
            'There was an error generating the proper GUID on the server',
            error,
          );
        },
      );
  }

  @HostListener('window:resize', [])
  onResize() {
    this.resizeSvc.refreshScreenSize(window.innerWidth);
  }

  isFieldValid(field: string) {
    return !this.userForm.get(field).valid && this.userForm.get(field).touched;
  }

  displayFieldCss(field: string) {
    return {
      'has-error': this.isFieldValid(field),
      'has-feedback': this.isFieldValid(field),
    };
  }

  displayImgFieldCss(field: string) {
    return {
      'has-error': true,
      'has-feedback': true,
    };
  }

  resetTitleImage() {
    this.titleImage = this.chooseImage_txt;
  }

  invalidTitle() {
    return this.submitted && this.userForm.controls.title.errors != null;
  }

  invalidLocality() {
    return this.submitted && this.userForm.controls.locality.errors != null;
  }

  invalidComment() {
    return this.submitted && this.userForm.controls.comment.errors != null;
  }

  invalidPriority() {
    return this.submitted && this.userForm.controls.priority.errors != null;
  }

  invalidDate() {
    return this.submitted && this.userForm.controls.date.errors != null;
  }

  invalidImg() {
    return this.submitted && this.userForm.controls.img.errors != null;
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

  public getImageLarge(imgName, imgPath): string {
    return environment.serverUrl + '/' + imgPath + imgName + '.jpg';
  }

  onFileSelect(event) {
    if (1 == event.target.files.length) {
      const file = event.target.files[0];
      this.userForm.get('img').setValue(file);
      if (17 < file.name.length) {
        this.titleImage = file.name.substr(0, 14) + '...';
      } else {
        this.titleImage = file.name;
      }
      event.srcElement.value = '';

      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (_event) => {
        this.imgURL = reader.result;
      };
    }
  }

  onSubmit() {
    if (this.is_submit_in_progress) {
      return;
    }
    this.is_submit_in_progress = true;
    let formData = new FormData();
    this.submitted = true;

    if (this.userForm.invalid == true) {
      this.is_submit_in_progress = false;
      this.invalidFormAction();
      return;
    } else {
      formData = this.appendFormData(formData);
      let postedBy = this.auth.getLogUserId();
      this.http
        .post<any>(
          environment.urlAddress + '/api/v1/user_input/modifyMineral/' + postedBy,
          formData,
        )
        .subscribe(
          (returnData: any) => {
            this.is_submit_in_progress = false;
            this.copyReturnData(returnData);
            if (null == returnData.inputErrorMessage.uploadSuccess) {
            } else {
              this.setDataOnUploadSuccess();
            }
          },
          (error) => {
            this.routerService.notLoginError();
            this.serverServiceErrors.uploadSuccess = null;
          },
        );
    }
  }

  invalidFormAction() {
    this.cleanServerErrors();
    this.inputCondition.successLoad = null;
  }

  appendFormData(formData) {
    Object.keys(this.userForm.value).forEach((key) => {
      formData.append(key, this.userForm.value[key]);
    });
    formData.append('achatdbCollection', JSON.stringify(this.achatdbCollection));
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
    // console.log(this.previousRoute);
    this.routerService.returnToPreviousPage(this.previousRoute);
  }
}
