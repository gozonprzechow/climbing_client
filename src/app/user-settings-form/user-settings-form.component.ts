import { Component, HostListener, OnInit, ElementRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ResizeService, SCREEN_SIZE } from '../services/resize.service';
import { MobileService } from '../services/mobile.service';

import { InputCondition } from '../models/inputLocality';
import { ValidationService } from '../models/validation';
import { AuthenticationService } from '../services/authentication.service';
import { RouterServices } from '../services/router.services';
import { ConfirmModalComponent } from '../models/confirm-modal/confirm-modal.component';
import { MathServices, ConvertedBytes } from '../services/math.service';
import { environment } from 'src/environments/environment';
import { LanguageService, TextTranslator } from '../services/language.service';
import { ImageService } from '../services/image.service';

@Component({
    selector: 'app-user-settings-form',
    templateUrl: './user-settings-form.component.html',
    styleUrls: ['./user-settings-form.component.css', '../models/mobile.css'],
    standalone: false
})
export class UserSettingsFormComponent implements OnInit {
  submitted = false;
  userForm: UntypedFormGroup;
  serverServiceErrors: any = {};
  successLoadCondition: string;
  inputCondition: InputCondition = new InputCondition();
  activePage: any = {};
  userInfo: any = {};
  allLocality: any = [];

  confirmModalMessage: string;
  confirmModalTitle: string;
  titleImage: string;
  upload_info: any = {};
  delete_info: any = {};
  imgURL: any;
  actual_profile_img: string;

  modalRef: BsModalRef;
  convertedBytes: ConvertedBytes = {
    numberofBytes: 0,
    unit: '',
  };

  titleMain_txt: string;
  titleMainTranslation: TextTranslator = {
    cz: 'Uživatelské nastavení',
    en: 'User settings',
  };
  deleteAccount_txt: string;
  eleteAccountTranslation: TextTranslator = {
    cz: 'Smazat účet',
    en: 'Delete account',
  };
  changePassword_txt: string;
  changePasswordTranslation: TextTranslator = {
    cz: 'Změnit heslo',
    en: 'Change password',
  };
  imagesSpace_txt: string;
  imagesSpaceTranslation: TextTranslator = {
    cz: 'Velikost obrázků uživatele:',
    en: 'Size of user image:',
  };
  warningDeleteaccountTitle_txt: string;
  warningDeleteaccountTitleTranslation: TextTranslator = {
    cz: 'Smazat účet',
    en: 'Delete account',
  };
  warningDeleteaccount_txt: string;
  warningDeleteaccountTranslation: TextTranslator = {
    cz: 'Opravdu chcete smazat účet?',
    en: 'Really want delete account?',
  };
  warningDeleteProfileImageTitle_txt: string;
  warningDeleteProfileImageTitleTranslation: TextTranslator = {
    cz: 'Smazat profilovou fotku',
    en: 'Delete profile image',
  };
  warningDeleteProfileImage_txt: string;
  warningDeleteProfileImageTranslation: TextTranslator = {
    cz: 'Opravdu chcete smazat profilovou fotku?',
    en: 'Really want delete profile image?',
  };
  profilePhotoLabel_txt: string;
  profilePhotoLabelTranslation: TextTranslator = {
    cz: 'Přidat fotku',
    en: 'Add photo',
  };
  saveChanges_txt: string;
  saveChangesTranslation: TextTranslator = {
    cz: 'Uložit změny',
    en: 'Save changes',
  };
  changesStored_txt: string;
  changesStoredTranslation: TextTranslator = {
    cz: 'Nastavení bylo změněno',
    en: 'Settings was changed',
  };

  constructor(
    public elementRef: ElementRef,
    public formBuilder: UntypedFormBuilder,
    public auth: AuthenticationService,
    public modalService: BsModalService,
    public routerService: RouterServices,
    public languageService: LanguageService,
    public mathServices: MathServices,
    public http: HttpClient,
    public imageService: ImageService,
    public resizeSvc: ResizeService,
    public mobileService: MobileService,
  ) {
    this.titleMain_txt = this.languageService.getNativeLanguageText(
      this.titleMainTranslation,
    );
    this.deleteAccount_txt = this.languageService.getNativeLanguageText(
      this.eleteAccountTranslation,
    );
    this.changePassword_txt = this.languageService.getNativeLanguageText(
      this.changePasswordTranslation,
    );
    this.imagesSpace_txt = this.languageService.getNativeLanguageText(
      this.imagesSpaceTranslation,
    );
    this.warningDeleteaccountTitle_txt = this.languageService.getNativeLanguageText(
      this.warningDeleteaccountTitleTranslation,
    );
    this.warningDeleteaccount_txt = this.languageService.getNativeLanguageText(
      this.warningDeleteaccountTranslation,
    );

    this.warningDeleteProfileImageTitle_txt = this.languageService.getNativeLanguageText(
      this.warningDeleteProfileImageTitleTranslation,
    );
    this.warningDeleteProfileImage_txt = this.languageService.getNativeLanguageText(
      this.warningDeleteProfileImageTranslation,
    );

    this.profilePhotoLabel_txt = this.languageService.getNativeLanguageText(
      this.profilePhotoLabelTranslation,
    );
    this.saveChanges_txt = this.languageService.getNativeLanguageText(
      this.saveChangesTranslation,
    );
    this.changesStored_txt = this.languageService.getNativeLanguageText(
      this.changesStoredTranslation,
    );
    this.confirmModalMessage = this.warningDeleteaccount_txt;
    this.confirmModalTitle = this.warningDeleteaccountTitle_txt;
    this.upload_info.upload_success = false;
  }

  invalidEmail() {
    return this.submitted && this.userForm.controls.email.errors != null;
  }

  // copyServerErrors(returnData: any) {
  //   this.serverServiceErrors.profile_image = returnData.inputErrorMessage.profile_image;
  //   this.serverServiceErrors.uploadSuccess = returnData.inputErrorMessage.uploadSuccess;
  // }

  cleanServerErrors() {
    this.serverServiceErrors.profile_image = null;
    this.serverServiceErrors.uploadSuccess = null;
  }

  ngOnInit() {
    console.log(this.mathServices.stringToHex('čeh ost'));
    console.log(this.mathServices.hexToString('10d06506802006f073074'));
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#242020';
    this.resizeSvc.refreshScreenSize(window.innerWidth);
    this.userForm = this.formBuilder.group(
      {
        // email: ['', [Validators.required, ValidationService.emailValidator]],
        img: [null],
      },
      { updateOn: 'submit' },
    );

    let postedBy = this.auth.getLogUserId();
    this.auth.saveActualUserId(postedBy);
    this.http
      .get(environment.urlAddress + '/api/v1/user_input/accountSettings/' + postedBy)
      .subscribe(
        (data: any) => {
          this.userInfo = data.userInfo;
          this.convertedBytes = this.mathServices.setUserFriendlyByteUnit(
            this.userInfo.imagesSize,
          );
          this.activePage = data.activePage;
          this.allLocality = data.localities;
          if (this.userInfo.profileImgName) {
            this.imgURL = this.imageService.getStandardImage(
              this.userInfo.profileImgName,
              this.userInfo.profileImgPath,
            );
          } else {
            this.imgURL = null;
          }
          this.actual_profile_img = this.imgURL;
        },
        (error) => {
          this.routerService.notLoginError();
        },
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
      this.runDeleteAccount();
    });
  }

  runDeleteAccount() {
    let formData = new FormData();
    formData.append('deleteMessage', 'Delete account');
    this.http
      .post<any>(environment.urlAddress + '/api/v1/user_input/deleteAccount', formData)
      .subscribe((data: any) => {
        this.auth.logout();
      });
  }

  onFileSelect(event) {
    this.upload_info.upload_success = false;
    if (1 == event.target.files.length) {
      const file = event.target.files[0];
      this.userForm.get('img').setValue(file);
      if (17 < file.name.length) {
        this.titleImage = file.name.substr(0, 14) + '...';
      } else {
        this.titleImage = file.name;
      }
      event.srcElement.value = '';

      if (/\.(jpe?g|png|gif)$/i.test(file.name)) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (_event) => {
          this.imgURL = reader.result as string;
        };
      } else {
        this.imgURL = null;
      }
    }
  }

  onSubmit() {
    let formData = new FormData();
    this.submitted = true;
    this.upload_info.upload_success = false;
    // console.log(this.userForm.controls.img.value);
    if (
      '' === this.userForm.controls.img.value ||
      null === this.userForm.controls.img.value
    ) {
      return;
    }

    if (this.userForm.invalid == true) {
      this.cleanServerErrors();
      this.inputCondition.successLoad = null;
      return;
    } else {
      Object.keys(this.userForm.value).forEach((key) => {
        formData.append(key, this.userForm.value[key]);
      });
      this.http
        .post<any>(environment.urlAddress + '/api/v1/user_input/modifyUserInfo', formData)
        .subscribe(
          (returnData: any) => {
            this.inputCondition.errorLoad = null;
            this.upload_info = returnData.upload_info;
            // this.copyServerErrors(returnData);
            if (this.upload_info.upload_success === 'true') {
              this.submitted = false;
              this.userForm.get('img').setValue('', { emitEvent: true });
              this.userInfo.profileImgPath = this.upload_info.profileImgPath;
              this.userInfo.profileImgName = this.upload_info.profileImgName;
              this.userInfo.imagesSize = this.upload_info.imagesSize;
              this.convertedBytes = this.mathServices.setUserFriendlyByteUnit(
                this.userInfo.imagesSize,
              );
              if (this.imgURL) {
                this.imgURL = this.imageService.getStandardImage(
                  this.userInfo.profileImgName,
                  this.userInfo.profileImgPath,
                );
              } else {
                this.imgURL = null;
              }
              this.actual_profile_img = this.imgURL;
            } else {
              this.upload_info.upload_success = false;
            }
          },
          (error) => {
            this.routerService.notLoginError();
            this.serverServiceErrors.uploadSuccess = null;
          },
        );
    }
  }

  public discardProfileImage() {
    if (this.actual_profile_img === this.imgURL) {
      this.openConfirmDeleteProfileImageModal();
    } else {
      this.imgURL = this.actual_profile_img;
    }
  }

  openConfirmDeleteProfileImageModal() {
    const initialState = {
      list: {
        confirmModalMessage: this.warningDeleteProfileImage_txt,
        confirmModalTitle: this.warningDeleteProfileImageTitle_txt,
        modalRef: BsModalRef,
      },
    };

    this.modalRef = this.modalService.show(
      ConfirmModalComponent,
      Object.assign({ animated: false }, { class: 'confirmModal' }, { initialState }),
    );
    this.modalRef.content.event.subscribe((res) => {
      this.postDeleteProfileImage();
    });
  }

  private postDeleteProfileImage() {
    let formData = new FormData();
    this.delete_info.delete_success = false;
    this.cleanServerErrors();
    this.inputCondition.successLoad = null;
    this.upload_info.upload_success = false;

    this.http
      .post<any>(
        environment.urlAddress + '/api/v1/user_input/deleteProfileImage',
        formData,
      )
      .subscribe(
        (returnData: any) => {
          this.delete_info = returnData.delete_info;
          // this.copyServerErrors(returnData);
          if (this.delete_info.delete_success === 'true') {
            this.userForm.get('img').setValue('', { emitEvent: true });
            this.imgURL = null;
            this.userInfo.profileImgPath = '';
            this.userInfo.profileImgName = '';
            this.userInfo.imagesSize = this.delete_info.imagesSize;
            this.convertedBytes = this.mathServices.setUserFriendlyByteUnit(
              this.userInfo.imagesSize,
            );
            this.actual_profile_img = this.imgURL;
          } else {
            this.delete_info.delete_success = false;
          }
        },
        (error) => {
          this.routerService.notLoginError();
          this.serverServiceErrors.uploadSuccess = null;
        },
      );
  }
}
