import { Component, OnInit, HostListener, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { InputCondition } from '../models/inputMineral';
import { AuthenticationService } from '../services/authentication.service';
import { ConfirmModalComponent } from '../models/confirm-modal/confirm-modal.component';
import { RouterServices } from '../services/router.services';
import { environment } from 'src/environments/environment';
import { LanguageService, TextTranslator } from '../services/language.service';
import { ResizeService, SCREEN_SIZE } from '../services/resize.service';
import { MobileService } from '../services/mobile.service';

@Component({
    selector: 'app-mondify-photo-form',
    templateUrl: './mondify-photo-form.component.html',
    styleUrls: ['./mondify-photo-form.component.css', '../models/mobile.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class MondifyPhotoFormComponent implements OnInit {
  submitted = false;
  userForm: UntypedFormGroup;
  serviceErrors: any = {};
  activePage: any = {};
  achatdbCollection: any = {};
  actualSlide: any = {};
  subMineralId: any = {};
  previousRoute: string;
  allLocality: any = [];
  serverServiceErrors: any = {};
  successLoadCondition: string;
  inputCondition: InputCondition = new InputCondition();
  titleImage: string;

  imgURL: any;
  product: any = {};
  confirmModalMessage: string;
  confirmModalTitle: string;

  modalRef: BsModalRef;
  is_submit_in_progress: Boolean = false;

  titleMain_txt: string;
  titleMainTranslation: TextTranslator = {
    cz: 'Upravit fotku',
    en: 'Modify photo',
  };
  comment_txt: string;
  commentTranslation: TextTranslator = {
    cz: 'Komentář',
    en: 'Comment',
  };
  chooseImage_txt: string;
  chooseImageTranslation: TextTranslator = {
    cz: 'Vybrat obrázek',
    en: 'Choose image',
  };
  store_txt: string;
  storeTranslation: TextTranslator = {
    cz: 'Uložit',
    en: 'Store',
  };
  delete_txt: string;
  deleteTranslation: TextTranslator = {
    cz: 'Smazat fotku',
    en: 'Delete photo',
  };
  modalMessage_txt: string;
  modalMessageTranslation: TextTranslator = {
    cz: 'Chcete smazat tuto fotku?',
    en: 'Do you want delete this photo?',
  };
  modalTitle_txt: string;
  modalTitleTranslation: TextTranslator = {
    cz: 'Smazat fotku',
    en: 'Delete photo',
  };
  submitInProgress_txt: string;
  submitInProgressTranslation: TextTranslator = {
    cz: 'Čekej. . .',
    en: 'Wait. . .',
  };

  constructor(
    public elementRef: ElementRef,
    public formBuilder: UntypedFormBuilder,
    public http: HttpClient,
    public modalService: BsModalService,
    public routerService: RouterServices,
    public languageService: LanguageService,
    public auth: AuthenticationService,
    public resizeSvc: ResizeService,
    public mobileService: MobileService,
  ) {
    this.titleMain_txt = this.languageService.getNativeLanguageText(
      this.titleMainTranslation,
    );
    this.comment_txt = this.languageService.getNativeLanguageText(
      this.commentTranslation,
    );
    this.chooseImage_txt = this.languageService.getNativeLanguageText(
      this.chooseImageTranslation,
    );
    this.store_txt = this.languageService.getNativeLanguageText(this.storeTranslation);
    this.delete_txt = this.languageService.getNativeLanguageText(this.deleteTranslation);
    this.modalMessage_txt = this.languageService.getNativeLanguageText(
      this.modalMessageTranslation,
    );
    this.modalTitle_txt = this.languageService.getNativeLanguageText(
      this.modalTitleTranslation,
    );
    this.submitInProgress_txt = this.languageService.getNativeLanguageText(
      this.submitInProgressTranslation,
    );

    this.confirmModalMessage = this.modalMessage_txt;
    this.confirmModalTitle = this.modalTitle_txt;
  }

  ngOnInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#242020';
    this.resizeSvc.refreshScreenSize(window.innerWidth);
    this.resetTitleImage();

    this.product = history.state;
    if (this.product.data == null) {
      this.routerService.inputRoute();
    } else {
      this.achatdbCollection = this.product.data.achatdbCollection;
      this.actualSlide = this.product.data.actualSlide;
      this.previousRoute = this.product.data.previousRoute;

      this.subMineralId = this.achatdbCollection.achatImages[this.actualSlide]._id;
    }

    this.imgURL = this.getImageLarge(
      this.achatdbCollection.achatImages[this.actualSlide].imgName,
      this.achatdbCollection.imgPath,
    );

    this.userForm = this.formBuilder.group(
      {
        comment: [
          this.achatdbCollection.achatImages[this.actualSlide].comment,
          [Validators.maxLength(300)],
        ],
        img: [null],
      },
      { updateOn: 'submit' },
    );

    let postedBy = this.auth.getLogUserId();
    this.http
      .get(environment.urlAddress + '/api/v1/user_input/modifySubMineral/' + postedBy)
      .subscribe(
        (returnData: any) => {
          this.allLocality = returnData.localities;
          this.activePage = returnData.activePage;
        },
        (error) => { },
      );
  }

  @HostListener('window:resize', [])
  onResize() {
    this.resizeSvc.refreshScreenSize(window.innerWidth);
  }

  openConfirmModal() {
    const initialState = {
      list: {
        confirmModalMessage: this.confirmModalMessage,
        confirmModalTitle: this.confirmModalTitle,
        modalRef: BsModalRef,
      },
    };

    this.modalRef = this.modalService.show(
      ConfirmModalComponent,
      Object.assign({ animated: false }, { class: 'confirmModal' }, { initialState }),
    );
    this.modalRef.content.event.subscribe((res) => {
      this.runDeleteSubImage();
    });
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

  invalidComment() {
    return this.submitted && this.userForm.controls.comment.errors != null;
  }

  invalidImg() {
    return this.submitted && this.userForm.controls.img.errors != null;
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

  runDeleteSubImage() {
    let formData = new FormData();
    formData.append('achatdbCollection', JSON.stringify(this.achatdbCollection));
    formData.append('subMineralId', JSON.stringify(this.subMineralId));
    this.http
      .post<any>(environment.urlAddress + '/api/v1/user_input/deleteSubMineral', formData)
      .subscribe(
        (returnData: any) => {
          this.routerService.returnToPreviousPage(this.previousRoute);
        },
        (error) => {
          this.inputCondition.errorLoad = 'You are not log in, please log in first';
          this.serverServiceErrors.uploadSuccess = null;
        },
      );
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
          environment.urlAddress + '/api/v1/user_input/modifyPhoto/' + postedBy,
          formData,
        )
        .subscribe(
          (returnData: any) => {
            this.is_submit_in_progress = false;
            this.copyReturnData(returnData);
            if (null == returnData.inputErrorMessage.uploadSuccess) {
            } else {
              let sub_image_route_info = returnData.sub_image_route_info;
              if (sub_image_route_info) {
                this.routerService.userLocalityDirectSecondaryPhoto(
                  sub_image_route_info.locality,
                  sub_image_route_info.postedBy,
                  sub_image_route_info.page_of_image,
                  sub_image_route_info.image_id,
                  sub_image_route_info.sub_image_position,
                );
              }
              // this.setDataOnUploadSuccess();
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
    formData.append('subMineralId', JSON.stringify(this.subMineralId));
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
