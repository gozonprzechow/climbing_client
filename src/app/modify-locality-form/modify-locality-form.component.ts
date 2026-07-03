import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { HttpClient } from '@angular/common/http';
import { InputCondition } from '../models/inputLocality';
import { AuthenticationService } from '../services/authentication.service';
import { RouterServices } from '../services/router.services';
import { environment } from 'src/environments/environment';
import { LanguageService, TextTranslator } from '../services/language.service';
import { ResizeService, SCREEN_SIZE } from '../services/resize.service';
import { MobileService } from '../services/mobile.service';
import { InputMapModalComponent } from '../models/input-map-modal/input-map-modal.component';

@Component({
    selector: 'app-modify-locality-form',
    templateUrl: './modify-locality-form.component.html',
    styleUrls: ['./modify-locality-form.component.css', '../models/mobile.css'],
    standalone: false
})
export class ModifyLocalityFormComponent implements OnInit {
  submitted = false;
  userForm: UntypedFormGroup;
  guid: string;
  activePage: any = {};
  serviceErrors: any = {};
  serverServiceErrors: any = {};
  successLoadCondition: string;
  inputCondition: InputCondition = new InputCondition();
  allLocality: any = [];
  country: string = '';
  region: string = '';
  region_map: string = '';
  localityUnderChange: any = {};
  previousRoute: string;

  product: any = {};

  imgSetLocation: string;
  countryModalRef: BsModalRef;
  regionModalRef: BsModalRef;

  titleMain_txt: string;
  titleMainTranslation: TextTranslator = {
    cz: 'Upravit lokalitu',
    en: 'Modify locality',
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
  inputLocationModalTitle_txt: string;
  inputLocationModalTitleTranslation: TextTranslator = {
    cz: 'Výběr lokace',
    en: 'Location selection',
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
    this.name_txt = this.languageService.getNativeLanguageText(this.nameTranslation);
    this.description_txt = this.languageService.getNativeLanguageText(
      this.descriptionTranslation,
    );
    this.priority_txt = this.languageService.getNativeLanguageText(
      this.priorityTranslation,
    );
    this.store_txt = this.languageService.getNativeLanguageText(this.storeTranslation);
    this.inputLocationModalTitle_txt = this.languageService.getNativeLanguageText(
      this.inputLocationModalTitleTranslation,
    );

    this.imgSetLocation = '../../../assets/skins/globus_button.png';
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

    this.product = history.state;
    if (this.product.data == null) {
      this.routerService.inputLocality();
    } else {
      this.localityUnderChange = this.product.data.locality;
      this.country = this.localityUnderChange.country;
      this.region = this.localityUnderChange.region;
      this.previousRoute = this.product.data.previousRoute;
    }

    this.userForm = this.formBuilder.group(
      {
        name: [
          this.localityUnderChange.name,
          [Validators.required, Validators.maxLength(50)],
        ],
        description: [this.localityUnderChange.description],
        priority: [
          this.localityUnderChange.priority,
          [Validators.maxLength(100), Validators.pattern('^[0-9]+$')],
        ],
      },
      { updateOn: 'submit' },
    );

    let postedBy = this.auth.getLogUserId();
    this.http
      .get(environment.urlAddress + '/api/v1/user_input/locality/' + postedBy)
      .subscribe(
        (data: any) => {
          this.guid = data.guid;
          this.activePage = data.activePage;
          this.allLocality = data.localities;
        },
        (error) => {
          this.routerService.login();
        },
      );
  }

  @HostListener('window:resize', [])
  onResize() {
    this.resizeSvc.refreshScreenSize(window.innerWidth);
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
      formData.append('country', this.country);
      formData.append('region', this.region);

      let postedBy = this.auth.getLogUserId();
      formData.append('locality', JSON.stringify(this.localityUnderChange));
      this.http
        .post<any>(
          environment.urlAddress + '/api/v1/user_input/modifyLocality/' + postedBy,
          formData,
        )
        .subscribe(
          (returnData: any) => {
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

  public openInputCountryModal() {
    this.country = '';
    this.region = '';
    const initialState = {
      list: {
        modalTitle: this.inputLocationModalTitle_txt,
        pageSize: this.resizeSvc.getPageWidth(),
        screenSize: this.resizeSvc.getScreenSize(),
        geojsonMap: '/assets/geojson/countries.json', //countries.geojson
        modalRef: BsModalRef,
      },
    };

    this.countryModalRef = this.modalService.show(
      InputMapModalComponent,
      Object.assign(
        { animated: false },
        { class: 'inputLocationModal' },
        { initialState },
      ),
    );
    this.countryModalRef.content.event.subscribe((res) => {
      this.country = res.state;
      // console.log(res);
      setTimeout(() => {
        this.openInputRegionModal();
      }, 50);
    });
  }

  public openInputRegionModal() {
    let ifOpenMap: Boolean = false;

    if ('Czech Republic' === this.country) {
      this.region_map = 'cz_kraje.json';
      ifOpenMap = true;
    }

    if (!ifOpenMap) {
      return;
    }
    const initialState = {
      list: {
        modalTitle: this.inputLocationModalTitle_txt,
        pageSize: this.resizeSvc.getPageWidth(),
        screenSize: this.resizeSvc.getScreenSize(),
        geojsonMap: '/assets/geojson/' + this.region_map, //countries.geojson
        modalRef: BsModalRef,
      },
    };

    this.regionModalRef = this.modalService.show(
      InputMapModalComponent,
      Object.assign(
        { animated: false },
        { class: 'inputLocationModal' },
        { initialState },
      ),
    );
    this.regionModalRef.content.event.subscribe((res) => {
      this.region = res.state;
      // console.log(res);
    });
  }

  copyReturnData(returnData) {
    this.inputCondition.errorLoad = null;
    this.activePage = returnData.activePage;
    this.copyServerErrors(returnData);
    this.allLocality = returnData.localities;
  }

  setDataOnUploadSuccess() {
    this.country = '';
    this.region = '';
    this.submitted = false;
    this.userForm.setValue({ name: '', description: '', priority: 1 });
    this.routerService.returnToPreviousPage(this.previousRoute);
  }
}
