import { Component, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { InputCondition } from '../models/inputLocality';
import { ValidationService } from '../models/validation';
import { AuthenticationService } from '../services/authentication.service';
import { RouterServices } from '../services/router.services';
import { ConfirmModalComponent } from '../models/confirm-modal/confirm-modal.component';
import { MathServices, ConvertedBytes } from '../services/math.service';
import { environment } from 'src/environments/environment';
import { LanguageService, TextTranslator } from '../services/language.service';

@Component({
  selector: 'app-user-settings-form',
  templateUrl: './user-settings-form.component.html',
  styleUrls: ['./user-settings-form.component.css'],
})
export class UserSettingsFormComponent implements OnInit {
  submitted = false;
  userForm: FormGroup;
  serverServiceErrors: any = {};
  successLoadCondition: string;
  inputCondition: InputCondition = new InputCondition();
  activePage: any = {};
  userInfo: any = {};
  allLocality: any = [];

  confirmModalMessage: string;
  confirmModalTitle: string;
  titleImage: string;
  imgURL: any;

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

  constructor(
    public elementRef: ElementRef,
    public formBuilder: FormBuilder,
    public auth: AuthenticationService,
    public modalService: BsModalService,
    public routerService: RouterServices,
    public languageService: LanguageService,
    public mathServices: MathServices,
    public http: HttpClient,
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
    this.profilePhotoLabel_txt = this.languageService.getNativeLanguageText(
      this.profilePhotoLabelTranslation,
    );
    this.saveChanges_txt = this.languageService.getNativeLanguageText(
      this.saveChangesTranslation,
    );
    this.confirmModalMessage = this.warningDeleteaccount_txt;
    this.confirmModalTitle = this.warningDeleteaccountTitle_txt;
  }

  invalidEmail() {
    return this.submitted && this.userForm.controls.email.errors != null;
  }

  copyServerErrors(returnData: any) {
    this.serverServiceErrors.profile_image = returnData.inputErrorMessage.profile_image;
    this.serverServiceErrors.uploadSuccess = returnData.inputErrorMessage.uploadSuccess;
  }

  cleanServerErrors() {
    this.serverServiceErrors.profile_image = null;
    this.serverServiceErrors.uploadSuccess = null;
  }

  ngOnInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#242020';
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
        },
        (error) => {
          this.routerService.notLoginError();
        },
      );
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
    if (1 == event.target.files.length) {
      const file = event.target.files[0];
      console.log(file);
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

    if (this.userForm.invalid == true) {
      this.cleanServerErrors();
      this.inputCondition.successLoad = null;
      return;
    } else {
      Object.keys(this.userForm.value).forEach((key) => {
        formData.append(key, this.userForm.value[key]);
      });
      this.http
        .post<any>(
          environment.urlAddress + '/api/v1/user_input/modifyUserInfo',
          formData,
        )
        .subscribe(
          (returnData: any) => {
            this.inputCondition.errorLoad = null;
            this.copyServerErrors(returnData);
            if (null == returnData.inputErrorMessage.uploadSuccess) {
            } else {
              this.submitted = false;
              this.userForm.get('img').setValue('', { emitEvent: true });
              this.imgURL = null;
            }
          },
          (error) => {
            this.routerService.notLoginError();
            this.serverServiceErrors.uploadSuccess = null;
          },
        );
    }
  }
}
