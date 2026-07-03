import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { InputCondition } from '../models/inputLocality';
import { ActivatedRoute } from '@angular/router';
import { ValidationService } from '../models/validation';
import { AuthenticationService } from '../services/authentication.service';
import { environment } from 'src/environments/environment';
import { LanguageService, TextTranslator } from '../services/language.service';
import { ResizeService, SCREEN_SIZE } from '../services/resize.service';
import { MobileService } from '../services/mobile.service';

@Component({
    selector: 'app-reset-password-form',
    templateUrl: './reset-password-form.component.html',
    styleUrls: ['./reset-password-form.component.css', '../models/mobile.css'],
    standalone: false
})
export class ResetPasswordFormComponent implements OnInit {
  submitted = false;
  userForm: UntypedFormGroup;
  serviceErrors: any = {};
  serverServiceErrors: any = {};
  successLoadCondition: string;
  inputCondition: InputCondition = new InputCondition();
  tittleMain: string;
  message: string;
  errorMessage: string;
  routeHistory: string;

  product: any = {};

  titleMain_txt: string;
  titleMainTranslation: TextTranslator = {
    cz: 'Zadat nové heslo',
    en: 'Add new password',
  };
  password_txt: string;
  passwordTranslation: TextTranslator = {
    cz: 'Heslo',
    en: 'Password',
  };
  confirmPassword_txt: string;
  confirmPasswordTranslation: TextTranslator = {
    cz: 'Potvrzení hesla',
    en: 'Confirm password',
  };
  resetPassword_txt: string;
  resetPasswordTranslation: TextTranslator = {
    cz: 'Změnit heslo',
    en: 'Reset password',
  };

  constructor(
    public elementRef: ElementRef,
    public formBuilder: UntypedFormBuilder,
    public http: HttpClient,
    public auth: AuthenticationService,
    public languageService: LanguageService,
    public route: ActivatedRoute,
    public resizeSvc: ResizeService,
    public mobileService: MobileService,
  ) {
    this.titleMain_txt = this.languageService.getNativeLanguageText(
      this.titleMainTranslation,
    );
    this.password_txt = this.languageService.getNativeLanguageText(
      this.passwordTranslation,
    );
    this.confirmPassword_txt = this.languageService.getNativeLanguageText(
      this.confirmPasswordTranslation,
    );
    this.resetPassword_txt = this.languageService.getNativeLanguageText(
      this.resetPasswordTranslation,
    );
  }

  invalidPassword() {
    return this.submitted && this.userForm.controls.password.errors != null;
  }

  invalidConfirmPassword() {
    return (
      this.submitted &&
      !(
        this.userForm.controls.password.value ==
        this.userForm.controls.passwordConfirm.value
      )
    );
  }

  copyServerErrors(returnData: any) {
    this.serverServiceErrors.password = returnData.inputErrorMessage.password;
    this.serverServiceErrors.passwordConfirm =
      returnData.inputErrorMessage.passwordConfirm;
    this.serverServiceErrors.uploadSuccess = returnData.inputErrorMessage.uploadSuccess;
  }

  cleanServerErrors() {
    this.serverServiceErrors.password = null;
    this.serverServiceErrors.passwordConfirm = null;
    this.serverServiceErrors.uploadSuccess = null;
  }

  public subscriber: any;

  ngOnInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#242020';
    this.resizeSvc.refreshScreenSize(window.innerWidth);
    this.userForm = this.formBuilder.group(
      {
        password: ['', [Validators.required, ValidationService.passwordValidator]],
        passwordConfirm: [''],
      },
      { updateOn: 'submit' },
    );
    this.subscriber = this.route.params.subscribe((params) => {
      this.routeHistory = params.uid;

      this.http
        .get(environment.urlAddress + '/api/v1/user_input/passwordReset/' + params.uid)
        .subscribe((data: any) => {
          // this.message = data.message;
        });
    });
  }

  @HostListener('window:resize', [])
  onResize() {
    this.resizeSvc.refreshScreenSize(window.innerWidth);
  }

  onSubmit() {
    let formData = new FormData();
    this.submitted = true;

    if (
      this.userForm.invalid == true ||
      !(
        this.userForm.controls.password.value ==
        this.userForm.controls.passwordConfirm.value
      )
    ) {
      this.cleanServerErrors();
      this.inputCondition.successLoad = null;
      return;
    } else {
      Object.keys(this.userForm.value).forEach((key) => {
        formData.append(key, this.userForm.value[key]);
      });

      this.http
        .post<any>(
          environment.urlAddress +
            '/api/v1/user_input/passwordReset/' +
            this.routeHistory,
          formData,
        )
        .subscribe(
          (returnData: any) => {
            this.inputCondition.errorLoad = null;
            this.copyServerErrors(returnData);
            this.errorMessage = null;

            if (null == returnData.inputErrorMessage.uploadSuccess) {
            } else {
              this.submitted = false;
              this.userForm.controls.password.setValue('');
              this.userForm.controls.passwordConfirm.setValue('');
              setTimeout(() => {
                this.auth.logout();
              }, 4000);
            }
          },
          (error) => {
            this.errorMessage = error.error.message;
          },
        );
    }
  }
}
