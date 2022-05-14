import { Component, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { InputCondition } from '../models/inputLocality';
import { AuthenticationService, TokenPayload } from '../services/authentication.service';
import { Globals } from '../services/globals.services';
import { RouterServices } from '../services/router.services';
import { environment } from 'src/environments/environment';
import { LanguageService, TextTranslator } from '../services/language.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css'],
})
export class LoginFormComponent implements OnInit {
  credentials: TokenPayload = {
    email: '',
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
  errorMessage: string;
  message: string;

  product: any = {};

  titleMain_txt: string;
  titleMainTranslation: TextTranslator = {
    cz: 'Přihlášení',
    en: 'Login',
  };
  registerQuestion_txt: string;
  registerQuestionTranslation: TextTranslator = {
    cz: 'Pokud nemáte účet mužete si ho založit zde:',
    en: 'If you are not register yet register here:',
  };
  register_txt: string;
  registerTranslation: TextTranslator = {
    cz: 'Registrace',
    en: 'Register',
  };
  password_txt: string;
  passwordTranslation: TextTranslator = {
    cz: 'Heslo',
    en: 'Password',
  };
  resendQuestion_txt: string;
  resendQuestionTranslation: TextTranslator = {
    cz: 'Pokud jste neobdrželi verifikační email klikněte zde pro znovuzaslání:',
    en: "If you doesn't receive verify email resend here:",
  };
  resend_txt: string;
  resendTranslation: TextTranslator = {
    cz: 'Znovuzaslání',
    en: 'Resend',
  };
  recoverQuestion_txt: string;
  recoverQuestionTranslation: TextTranslator = {
    cz: 'Pokud jse zapoměli heslo můžete si ho obnovit zde:',
    en: 'If you forget password recover password here:',
  };
  recover_txt: string;
  recoverTranslation: TextTranslator = {
    cz: 'Obnovit heslo',
    en: 'Recover password',
  };
  login_txt: string;
  loginTranslation: TextTranslator = {
    cz: 'Přihlásit',
    en: 'Login',
  };

  constructor(
    public elementRef: ElementRef,
    public formBuilder: FormBuilder,
    public globals: Globals,
    public auth: AuthenticationService,
    public languageService: LanguageService,
    public http: HttpClient,
    public routerService: RouterServices,
  ) {
    this.titleMain_txt = this.languageService.getNativeLanguageText(
      this.titleMainTranslation,
    );
    this.registerQuestion_txt = this.languageService.getNativeLanguageText(
      this.registerQuestionTranslation,
    );
    this.register_txt = this.languageService.getNativeLanguageText(
      this.registerTranslation,
    );
    this.password_txt = this.languageService.getNativeLanguageText(
      this.passwordTranslation,
    );
    this.resendQuestion_txt = this.languageService.getNativeLanguageText(
      this.resendQuestionTranslation,
    );
    this.resend_txt = this.languageService.getNativeLanguageText(this.resendTranslation);
    this.recoverQuestion_txt = this.languageService.getNativeLanguageText(
      this.recoverQuestionTranslation,
    );
    this.recover_txt = this.languageService.getNativeLanguageText(
      this.recoverTranslation,
    );
    this.login_txt = this.languageService.getNativeLanguageText(this.loginTranslation);
  }

  invalidEmail() {
    return this.submitted && this.userForm.controls.email.errors != null;
  }

  invalidPassword() {
    return this.submitted && this.userForm.controls.password.errors != null;
  }

  userNoVerified(): boolean {
    return this.message === 'User is not approval';
  }

  userWrongPassword(): boolean {
    return this.message === 'Password is wrong';
  }

  hideRegisterRouter(): boolean {
    return !(this.userNoVerified() || this.userWrongPassword());
  }

  copyServerErrors(returnData: any) {
    this.serverServiceErrors.email = returnData.inputErrorMessage.email;
    this.serverServiceErrors.password = returnData.inputErrorMessage.password;
    this.serverServiceErrors.uploadSuccess = returnData.inputErrorMessage.uploadSuccess;
  }

  cleanServerErrors() {
    this.serverServiceErrors.email = null;
    this.serverServiceErrors.password = null;
    this.serverServiceErrors.uploadSuccess = null;
  }

  ngOnInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#242020';

    this.product = history.state;
    if (this.product.data == null) {
      this.routerService.login();
    } else {
      this.errorMessage = this.product.data.errorMessage;
    }

    this.userForm = this.formBuilder.group(
      {
        email: ['', [Validators.required, Validators.maxLength(70)]],
        password: ['', [Validators.required, Validators.maxLength(50)]],
      },
      { updateOn: 'submit' },
    );

    let postedBy = this.auth.getLogUserId();
    this.auth.saveActualUserId(postedBy);
    this.http
      .get(environment.urlAddress + '/api/v1/user_input/login/' + postedBy)
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

  runResendVerify() {
    let formData = new FormData();

    Object.keys(this.userForm.value).forEach((key) => {
      formData.append(key, this.userForm.value[key]);
    });
    // formData.append("deleteMessage", "Delete account");
    this.http
      .post<any>(environment.urlAddress + '/api/v1/user_input/resend', formData)
      .subscribe((data: any) => {
        this.message = data.message;
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
      this.credentials.email = this.userForm.controls.email.value;
      this.credentials.password = this.userForm.controls.password.value;

      this.auth.login(this.credentials).subscribe(
        (returnData: any) => {
          this.inputCondition.errorLoad = null;
          this.message = '';
          // this.copyServerErrors(returnData);

          if (null == returnData.loginSuccess) {
          } else {
            let yourId = this.auth.getLogUserId();
            this.auth.saveActualUserId(yourId);
            this.routeToUserLocalities();
          }
        },
        (error) => {
          this.errorMessage = '';
          this.message = error.error.message;
        },
      );
    }
  }

  public routeToUserLocalities() {
    let userId = this.auth.getActualUserId();
    this.routerService.userLocalities(userId, 0);
  }
}
