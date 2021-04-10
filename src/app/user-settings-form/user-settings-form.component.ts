import { Component, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
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
  styleUrls: ['./user-settings-form.component.css']
})

export class UserSettingsFormComponent implements OnInit {

  submitted = false;
  userForm: FormGroup;
  serviceErrors: any = {};
  serverServiceErrors: any = {};
  successLoadCondition: string;
  inputCondition: InputCondition = new InputCondition();
  activePage: any = {};
  userInfo: any = {};
  allLocality: any = [];

  confirmModalMessage: string;
  confirmModalTitle: string;

  modalRef: BsModalRef;
  convertedBytes: ConvertedBytes = {
    numberofBytes: 0,
    unit: ""
  };

  titleMain_txt: string;
  titleMainTranslation: TextTranslator = {
    cz: "Uživatelské nastavení",
    en: "User settings"
  };
  deleteAccount_txt: string;
  eleteAccountTranslation: TextTranslator = {
    cz: "Smazat účet",
    en: "Delete account"
  };
  changePassword_txt: string;
  changePasswordTranslation: TextTranslator = {
    cz: "Změnit heslo",
    en: "Change password"
  };
  imagesSpace_txt: string;
  imagesSpaceTranslation: TextTranslator = {
    cz: "Velikost obrázků uživatele:",
    en: "Size of user image:"
  };
  warningDeleteaccountTitle_txt: string;
  warningDeleteaccountTitleTranslation: TextTranslator = {
    cz: "Smazat účet",
    en: "Delete account"
  };
  warningDeleteaccount_txt: string;
  warningDeleteaccountTranslation: TextTranslator = {
    cz: "Opravdu chcete smazat účet?",
    en: "Really want delete account?"
  };

  constructor(
    public elementRef: ElementRef,
    public formBuilder: FormBuilder,
    public auth: AuthenticationService,
    public modalService: BsModalService,
    public routerService: RouterServices,
    public languageService: LanguageService,
    public mathServices: MathServices,
    public http: HttpClient) {
    this.titleMain_txt = this.languageService.getNativeLanguageText(this.titleMainTranslation);
    this.deleteAccount_txt = this.languageService.getNativeLanguageText(this.eleteAccountTranslation);
    this.changePassword_txt = this.languageService.getNativeLanguageText(this.changePasswordTranslation);
    this.imagesSpace_txt = this.languageService.getNativeLanguageText(this.imagesSpaceTranslation);
    this.warningDeleteaccountTitle_txt = this.languageService
      .getNativeLanguageText(this.warningDeleteaccountTitleTranslation);
    this.warningDeleteaccount_txt = this.languageService
      .getNativeLanguageText(this.warningDeleteaccountTranslation);
    this.confirmModalMessage = this.warningDeleteaccount_txt;
    this.confirmModalTitle = this.warningDeleteaccountTitle_txt;
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
      email: ['', [Validators.required, ValidationService.emailValidator]],
    },
      { updateOn: "submit" }
    );

    let postedBy = this.auth.getLogUserId();
    this.auth.saveActualUserId(postedBy);
    this.http.get(environment.urlAddress + '/api/v1/user_input/accountSettings/' + postedBy).subscribe((data: any) => {
      this.userInfo = data.userInfo;
      this.convertedBytes = this.mathServices.setUserFriendlyByteUnit(this.userInfo.imagesSize);
      this.activePage = data.activePage;
      this.allLocality = data.localities;
    }, error => {
      this.routerService.notLoginError();
    });
  }

  openConfirmModal() {
    const initialState = {
      list: {
        "confirmModalMessage": this.confirmModalMessage,
        "confirmModalTitle": this.confirmModalTitle,
        "modalRef": BsModalRef
      }
    };

    this.modalRef = this.modalService.show(
      ConfirmModalComponent,
      Object.assign({ animated: false }, { class: 'confirmModal' }, { initialState })
    );
    this.modalRef.content.event.subscribe(res => {
      this.runDeleteAccount();
    });
  }

  runDeleteAccount() {
    let formData = new FormData();
    formData.append("deleteMessage", "Delete account");
    this.http.post<any>(environment.urlAddress + '/api/v1/user_input/deleteAccount', formData).subscribe((data: any) => {
      this.auth.logout();
    });
  }

}
