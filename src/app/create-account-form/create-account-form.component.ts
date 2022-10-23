import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { InputCondition } from '../models/inputLocality';
import { ValidationService } from '../models/validation';
import { AuthenticationService, TokenPayload } from '../services/authentication.service';
import { RouterServices } from '../services/router.services';
import { environment } from 'src/environments/environment';
import { LanguageService, TextTranslator } from '../services/language.service';
import { ResizeService, SCREEN_SIZE } from '../services/resize.service';
import { MobileService } from '../services/mobile.service';

@Component({
  selector: 'app-create-account-form',
  templateUrl: './create-account-form.component.html',
  styleUrls: ['./create-account-form.component.css', '../models/mobile.css'],
})
export class CreateAccountFormComponent implements OnInit {
  credentials: TokenPayload = {
    email: '',
    name: '',
    password: '',
  };

  submitted = false;
  userForm: FormGroup;
  serviceErrors: any = {};
  serverServiceErrors: any = {};
  activePage: any = {};
  allLocality: any = [];
  successLoadCondition: string;
  inputCondition: InputCondition = new InputCondition();

  is_submit_in_progress: Boolean = false;

  titleMain_txt: string;
  titleMainTranslation: TextTranslator = {
    cz: 'Vytvořit účet',
    en: 'Create account',
  };
  name_txt: string;
  nameTranslation: TextTranslator = {
    cz: 'Jméno',
    en: 'Name',
  };
  password_txt: string;
  passwordTranslation: TextTranslator = {
    cz: 'Heslo',
    en: 'Password',
  };
  createAccount_txt: string;
  createAccountTranslation: TextTranslator = {
    cz: 'Vytvořit účet',
    en: 'Create account',
  };

  submitInProgress_txt: string;
  submitInProgressTranslation: TextTranslator = {
    cz: 'Čekej. . .',
    en: 'Wait. . .',
  };

  constructor(
    public elementRef: ElementRef,
    public formBuilder: FormBuilder,
    public auth: AuthenticationService,
    public http: HttpClient,
    public languageService: LanguageService,
    public routerService: RouterServices,
    public resizeSvc: ResizeService,
    public mobileService: MobileService,
  ) {
    this.titleMain_txt = this.languageService.getNativeLanguageText(
      this.titleMainTranslation,
    );
    this.name_txt = this.languageService.getNativeLanguageText(this.nameTranslation);
    this.password_txt = this.languageService.getNativeLanguageText(
      this.passwordTranslation,
    );
    this.createAccount_txt = this.languageService.getNativeLanguageText(
      this.createAccountTranslation,
    );
    this.submitInProgress_txt = this.languageService.getNativeLanguageText(
      this.submitInProgressTranslation,
    );
  }

  invalidName() {
    return this.submitted && this.userForm.controls.name.errors != null;
  }

  invalidEmail() {
    return this.submitted && this.userForm.controls.email.errors != null;
  }

  invalidPassword() {
    return this.submitted && this.userForm.controls.password.errors != null;
  }

  copyServerErrors(returnData: any) {
    this.serverServiceErrors.name = returnData.inputErrorMessage.name;
    this.serverServiceErrors.email = returnData.inputErrorMessage.email;
    this.serverServiceErrors.password = returnData.inputErrorMessage.password;
    this.serverServiceErrors.uploadSuccess = returnData.inputErrorMessage.uploadSuccess;
  }

  cleanServerErrors() {
    this.serverServiceErrors.name = null;
    this.serverServiceErrors.email = null;
    this.serverServiceErrors.password = null;
    this.serverServiceErrors.uploadSuccess = null;
  }

  ngOnInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#242020';
    this.resizeSvc.refreshScreenSize(window.innerWidth);
    this.userForm = this.formBuilder.group(
      {
        name: ['', [Validators.required, Validators.maxLength(50)]],
        email: ['', [Validators.required, ValidationService.emailValidator]],
        password: ['', [Validators.required, ValidationService.passwordValidator]],
      },
      { updateOn: 'submit' },
    );

    let postedBy = this.auth.getLogUserId();
    this.auth.saveActualUserId(postedBy);
    this.http
      .get(environment.urlAddress + '/api/v1/user_input/register/' + postedBy)
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

  onSubmit() {
    if (this.is_submit_in_progress) {
      return;
    }
    this.is_submit_in_progress = true;
    let formData = new FormData();
    this.submitted = true;

    if (this.userForm.invalid == true) {
      this.cleanServerErrors();
      this.is_submit_in_progress = false;
      this.inputCondition.successLoad = null;
      return;
    } else {
      this.credentials.name = this.userForm.controls.name.value;
      this.credentials.email = this.userForm.controls.email.value;
      this.credentials.password = this.userForm.controls.password.value;

      this.auth.register(this.credentials).subscribe(
        (returnData: any) => {
          this.is_submit_in_progress = false;
          this.inputCondition.errorLoad = null;
          this.copyServerErrors(returnData);
          if (null == returnData.inputErrorMessage.uploadSuccess) {
          } else {
            this.routerService.successCreateAccount(returnData.message);
          }
        },
        (error) => {},
      );
    }
  }

  public getSubmitBtnClass(): string {
    if (SCREEN_SIZE.XS === this.resizeSvc.getScreenSize()) {
      return 'submitButton submitButton_mobile';
    }
    return 'submitButton';
  }

  public getSubmitFrozenBtnClass(): string {
    if (SCREEN_SIZE.XS === this.resizeSvc.getScreenSize()) {
      return 'submitButton submitButton_mobile frozen';
    }
    return 'submitButton frozen';
  }
}
