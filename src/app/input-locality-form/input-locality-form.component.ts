import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { InputCondition } from '../models/inputLocality';
import { AuthenticationService } from '../services/authentication.service';
import { RouterServices } from '../services/router.services';
import { environment } from 'src/environments/environment';
import { LanguageService, TextTranslator } from '../services/language.service';
import { ResizeService, SCREEN_SIZE } from '../services/resize.service';
import { MobileService } from '../services/mobile.service';

@Component({
  selector: 'app-input-locality-form',
  templateUrl: './input-locality-form.component.html',
  styleUrls: ['./input-locality-form.component.css', '../models/mobile.css'],
})
export class InputLocalityFormComponent implements OnInit {
  submitted = false;
  userForm: FormGroup;
  activePage: any = {};
  serviceErrors: any = {};
  serverServiceErrors: any = {};
  successLoadCondition: string;
  inputCondition: InputCondition = new InputCondition();
  allLocality: any = [];

  is_submit_in_progress: Boolean = false;

  titleMain_txt: string;
  titleMainTranslation: TextTranslator = {
    cz: 'Vložit lokalitu',
    en: 'Input locality',
  };
  name_txt: string;
  nameTranslation: TextTranslator = {
    cz: 'Jméno',
    en: 'Name',
  };
  description_txt: string;
  descriptionTranslation: TextTranslator = {
    cz: 'Popis',
    en: 'Description',
  };
  priority_txt: string;
  priorityTranslation: TextTranslator = {
    cz: 'Priorita <0, 1000>',
    en: 'Priority <0, 1000>',
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
    public routerService: RouterServices,
    public languageService: LanguageService,
    public auth: AuthenticationService,
    public resizeSvc: ResizeService,
    public mobileService: MobileService,
  ) {
    this.titleMain_txt = this.languageService.getNativeLanguageText(
      this.titleMainTranslation,
    );
    this.name_txt = this.languageService.getNativeLanguageText(this.nameTranslation);
    this.description_txt = this.languageService.getNativeLanguageText(
      this.descriptionTranslation,
    );
    this.priority_txt = this.languageService.getNativeLanguageText(
      this.priorityTranslation,
    );
    this.store_txt = this.languageService.getNativeLanguageText(this.storeTranslation);
  }

  public invalidName() {
    return this.submitted && this.userForm.controls.name.errors != null;
  }

  public invalidDescription() {
    return this.submitted && this.userForm.controls.description.errors != null;
  }

  public invalidPriority() {
    return this.submitted && this.userForm.controls.priority.errors != null;
  }

  copyServerErrors(returnData: any) {
    this.serverServiceErrors.name = returnData.inputErrorMessage.name;
    this.serverServiceErrors.description = returnData.inputErrorMessage.description;
    this.serverServiceErrors.errorMessage = returnData.inputErrorMessage.errorMessage;
    this.serverServiceErrors.uploadSuccess = returnData.inputErrorMessage.uploadSuccess;
  }

  cleanServerErrors() {
    this.serverServiceErrors.name = null;
    this.serverServiceErrors.description = null;
    this.serverServiceErrors.uploadSuccess = null;
    this.serverServiceErrors.errorMessage = null;
  }

  ngOnInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#242020';
    this.resizeSvc.refreshScreenSize(window.innerWidth);
    this.userForm = this.formBuilder.group(
      {
        name: ['', [Validators.required, Validators.maxLength(50)]],
        description: [''],
        priority: [1, [Validators.maxLength(100), Validators.pattern('^[0-9]+$')]],
      },
      { updateOn: 'submit' },
    );

    let postedBy = this.auth.getLogUserId();
    this.auth.saveActualUserId(postedBy);
    this.http
      .get(environment.urlAddress + '/api/v1/user_input/locality/' + postedBy)
      .subscribe(
        (data: any) => {
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
      Object.keys(this.userForm.value).forEach((key) => {
        formData.append(key, this.userForm.value[key]);
      });

      let postedBy = this.auth.getLogUserId();
      this.http
        .post<any>(
          environment.urlAddress + '/api/v1/user_input/locality/' + postedBy,
          formData,
        )
        .subscribe(
          (returnData: any) => {
            this.is_submit_in_progress = false;
            this.activePage = returnData.activePage;
            this.allLocality = returnData.localities;
            this.inputCondition.errorLoad = null;
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
