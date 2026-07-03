import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
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
import { ResizeService, SCREEN_SIZE } from '../services/resize.service';
import { MobileService } from '../services/mobile.service';

@Component({
    selector: 'app-admin-hlavni-form',
    templateUrl: './admin-hlavni-form.component.html',
    styleUrls: ['./admin-hlavni-form.component.css', '../models/mobile.css'],
    standalone: false
})
export class AdminHlavniFormComponent implements OnInit {
  submitted = false;
  userForm: UntypedFormGroup;
  serviceErrors: any = {};
  serverServiceErrors: any = {};
  successLoadCondition: string;
  inputCondition: InputCondition = new InputCondition();
  activePage: any = {};
  serverInfo: any = {};
  allLocality: any = [];

  confirmModalMessage: string;
  confirmModalTitle: string;

  modalRef: BsModalRef;
  convertedBytes: ConvertedBytes = {
    numberofBytes: 0,
    unit: '',
  };

  deleteAccount_txt: string;
  eleteAccountTranslation: TextTranslator = {
    cz: 'Smazat účet',
    en: 'Delete account',
  };
  titleMain_txt: string;
  titleMainTranslation: TextTranslator = {
    cz: 'Administrátorská stránka',
    en: 'Admin page',
  };
  registeredUsers_txt: string;
  registeredUsersTranslation: TextTranslator = {
    cz: 'Aktuálně registrovaní uživatelé:',
    en: 'Current registered users:',
  };
  imagesSpace_txt: string;
  imagesSpaceTranslation: TextTranslator = {
    cz: 'Uživatelé zabírají na obrázkách paměti:',
    en: 'Users spend on images space:',
  };
  warningDeleteUserTitle_txt: string;
  warningDeleteUserTitleTranslation: TextTranslator = {
    cz: 'Smazat uživatele',
    en: 'Delete user',
  };
  warningDeleteUser_txt: string;
  warningDeleteUserTranslation: TextTranslator = {
    cz: 'Opravdu chcete smazat tohoto uživatele?',
    en: 'Really want delete this user?',
  };

  constructor(
    public elementRef: ElementRef,
    public formBuilder: UntypedFormBuilder,
    public auth: AuthenticationService,
    public modalService: BsModalService,
    public routerService: RouterServices,
    public mathServices: MathServices,
    public languageService: LanguageService,
    public http: HttpClient,
    public resizeSvc: ResizeService,
    public mobileService: MobileService,
  ) {
    this.deleteAccount_txt = this.languageService.getNativeLanguageText(
      this.eleteAccountTranslation,
    );
    this.titleMain_txt = this.languageService.getNativeLanguageText(
      this.titleMainTranslation,
    );
    this.registeredUsers_txt = this.languageService.getNativeLanguageText(
      this.registeredUsersTranslation,
    );
    this.imagesSpace_txt = this.languageService.getNativeLanguageText(
      this.imagesSpaceTranslation,
    );
    this.warningDeleteUserTitle_txt = this.languageService.getNativeLanguageText(
      this.warningDeleteUserTitleTranslation,
    );
    this.warningDeleteUser_txt = this.languageService.getNativeLanguageText(
      this.warningDeleteUserTranslation,
    );
    this.confirmModalMessage = this.warningDeleteUser_txt;
    this.confirmModalTitle = this.warningDeleteUserTitle_txt;
  }

  invalidEmail() {
    return this.submitted && this.userForm.controls.email.errors != null;
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
    this.resizeSvc.refreshScreenSize(window.innerWidth);
    this.userForm = this.formBuilder.group(
      {
        email: ['', [Validators.required, ValidationService.emailValidator]],
      },
      { updateOn: 'submit' },
    );

    let postedBy = this.auth.getLogUserId();
    this.auth.saveActualUserId(postedBy);
    this.http
      .get(environment.urlAddress + '/api/v1/user_input/deleteAccountAdmin/' + postedBy)
      .subscribe(
        (data: any) => {
          this.serverInfo = data.serverInfo;
          this.convertedBytes = this.mathServices.setUserFriendlyByteUnit(
            this.serverInfo.imagesSize,
          );
          this.activePage = data.activePage;
          this.allLocality = data.localities;
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
      this.onSubmit();
    });
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
      formData.append('deleteMessage', 'Delete account by admin');
      this.http
        .post<any>(
          environment.urlAddress + '/api/v1/user_input/deleteAccountAdmin',
          formData,
        )
        .subscribe(
          (returnData: any) => {
            this.inputCondition.errorLoad = returnData.deleteSuccess;
            this.serverInfo = returnData.serverInfo;
            this.copyServerErrors(returnData);

            if (null == returnData.inputErrorMessage.uploadSuccess) {
            } else {
              this.submitted = false;
              this.userForm.reset();
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
