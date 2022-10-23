import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { InputCondition } from '../models/inputMineral';
import { AuthenticationService } from '../services/authentication.service';
import { RouterServices } from '../services/router.services';
import { environment } from 'src/environments/environment';
import { LanguageService, TextTranslator, Country } from '../services/language.service';
import { ResizeService, SCREEN_SIZE } from '../services/resize.service';
import { MobileService } from '../services/mobile.service';

@Component({
  selector: 'app-input-mineral-form',
  templateUrl: './input-mineral-form.component.html',
  styleUrls: ['./input-mineral-form.component.css', '../models/mobile.css'],
})
export class InputMineralFormComponent implements OnInit {
  submitted = false;
  userForm: FormGroup;
  serviceErrors: any = {};
  activePage: any = {};
  allLocality: any = [];
  serverServiceErrors: any = {};
  successLoadCondition: string;
  inputCondition: InputCondition = new InputCondition();
  titleImage: string;
  input_price_text: string;
  currency: string;
  currency_array: string[];

  imgSetStandardSrc: string;
  imgSetPrizeSrc: string;
  imgSetAuctionSrc: string;
  input_status: Number = 0;

  is_submit_in_progress: Boolean = false;

  imgURL: any;

  titleMain_txt: string;
  titleMainTranslation: TextTranslator = {
    cz: 'Vložit minerál',
    en: 'Input mineral',
  };
  title_txt: string;
  titleTranslation: TextTranslator = {
    cz: 'Popisek',
    en: 'Title',
  };
  locality_txt: string;
  localityTranslation: TextTranslator = {
    cz: 'Lokalita',
    en: 'Locality',
  };
  comment_txt: string;
  commentTranslation: TextTranslator = {
    cz: 'Komentář',
    en: 'Comment',
  };
  date_txt: string;
  dateTranslation: TextTranslator = {
    cz: 'Datum',
    en: 'Date',
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
  price_txt: string;
  priceTranslation: TextTranslator = {
    cz: 'Cena',
    en: 'Price',
  };
  startingPrice_txt: string;
  startingPriceTranslation: TextTranslator = {
    cz: 'Počáteční cena',
    en: 'Starting price',
  };

  submitInProgress_txt: string;
  submitInProgressTranslation: TextTranslator = {
    cz: 'Čekej. . .',
    en: 'Wait. . .',
  };

  // @ViewChild(FormGroup, {static: false}) child : FormGroup;

  constructor(
    public elementRef: ElementRef,
    public formBuilder: FormBuilder,
    public http: HttpClient,
    public languageService: LanguageService,
    public routerService: RouterServices,
    public auth: AuthenticationService,
    public resizeSvc: ResizeService,
    public mobileService: MobileService,
  ) {
    this.imgSetStandardSrc = '../../../assets/skins/insert_standard_collection_hover.png';
    this.imgSetPrizeSrc = '../../../assets/skins/insert_prize_collection.png';
    this.imgSetAuctionSrc = '../../../assets/skins/insert_auction_collection.png';

    this.titleMain_txt = this.languageService.getNativeLanguageText(
      this.titleMainTranslation,
    );
    this.title_txt = this.languageService.getNativeLanguageText(this.titleTranslation);
    this.locality_txt = this.languageService.getNativeLanguageText(
      this.localityTranslation,
    );
    this.comment_txt = this.languageService.getNativeLanguageText(
      this.commentTranslation,
    );
    this.date_txt = this.languageService.getNativeLanguageText(this.dateTranslation);
    this.chooseImage_txt = this.languageService.getNativeLanguageText(
      this.chooseImageTranslation,
    );
    this.store_txt = this.languageService.getNativeLanguageText(this.storeTranslation);
    this.price_txt = this.languageService.getNativeLanguageText(this.priceTranslation);
    this.startingPrice_txt = this.languageService.getNativeLanguageText(
      this.startingPriceTranslation,
    );
    this.submitInProgress_txt = this.languageService.getNativeLanguageText(
      this.submitInProgressTranslation,
    );

    this.currency_array = this.languageService.getAllCurrency();
    this.currency = this.languageService.getNativeCurrencyByLanguageText();
  }

  ngOnInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#242020';
    this.resetTitleImage();
    this.resizeSvc.refreshScreenSize(window.innerWidth);
    this.userForm = this.formBuilder.group(
      {
        title: [null, [Validators.required, Validators.maxLength(50)]],
        locality: [null, [Validators.required, Validators.maxLength(50)]],
        comment: [null, [Validators.required, Validators.maxLength(50)]],
        date: [null],
        price: [
          null,
          [
            Validators.required,
            Validators.maxLength(100),
            Validators.pattern('^[0-9]+$'),
          ],
        ],
        currency: [this.currency, [Validators.required, Validators.maxLength(50)]],
        img: [null],
      },
      { updateOn: 'submit' },
    );
    this.userForm.controls['price'].clearValidators();
    this.userForm.controls['currency'].clearValidators();

    let postedBy = this.auth.getLogUserId();
    this.auth.saveActualUserId(postedBy);
    this.http
      .get(environment.urlAddress + '/api/v1/user_input/mineral/' + postedBy)
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

  get price(): FormControl {
    return this.userForm.controls.price as FormControl;
  }

  activeStandardCollectionInput() {
    this.imgSetStandardSrc = '../../../assets/skins/insert_standard_collection_hover.png';
    this.imgSetPrizeSrc = '../../../assets/skins/insert_prize_collection.png';
    this.imgSetAuctionSrc = '../../../assets/skins/insert_auction_collection.png';
    this.userForm.controls['price'].clearValidators();
    this.userForm.get('price').updateValueAndValidity();
    this.input_status = 0;
  }

  activePrizeCollectionInput() {
    this.imgSetStandardSrc = '../../../assets/skins/insert_standard_collection.png';
    this.imgSetPrizeSrc = '../../../assets/skins/insert_prize_collection_hover.png';
    this.imgSetAuctionSrc = '../../../assets/skins/insert_auction_collection.png';
    this.input_price_text = this.price_txt;
    this.userForm.controls['price'].setValidators(Validators.required);
    this.userForm.get('price').updateValueAndValidity();
    this.input_status = 1;
  }

  activeAuctionCollectionInput() {
    this.imgSetStandardSrc = '../../../assets/skins/insert_standard_collection.png';
    this.imgSetPrizeSrc = '../../../assets/skins/insert_prize_collection.png';
    this.imgSetAuctionSrc = '../../../assets/skins/insert_auction_collection_hover.png';
    this.input_price_text = this.startingPrice_txt;
    this.userForm.controls['price'].setValidators(Validators.required);
    this.userForm.get('price').updateValueAndValidity();
    this.input_status = 2;
  }

  public ifShowPrice() {
    if (1 == this.input_status || 2 == this.input_status) {
      return true;
    }
    return false;
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

  resetTitleImage() {
    this.titleImage = this.chooseImage_txt;
  }

  invalidTitle() {
    return this.submitted && this.userForm.controls.title.errors != null;
  }

  invalidLocality() {
    return this.submitted && this.userForm.controls.locality.errors != null;
  }

  invalidPrice() {
    return this.submitted && this.userForm.controls.price.errors != null;
  }

  invalidComment() {
    return this.submitted && this.userForm.controls.comment.errors != null;
  }

  invalidDate() {
    return this.submitted && this.userForm.controls.date.errors != null;
  }

  invalidImg() {
    return this.submitted && this.userForm.controls.img.errors != null;
  }

  copyServerErrors(returnData: any) {
    this.serverServiceErrors.title = returnData.inputErrorMessage.title;
    this.serverServiceErrors.locality = returnData.inputErrorMessage.locality;
    this.serverServiceErrors.comment = returnData.inputErrorMessage.comment;
    this.serverServiceErrors.date = returnData.inputErrorMessage.date;
    this.serverServiceErrors.img = returnData.inputErrorMessage.img;
    this.serverServiceErrors.uploadSuccess = returnData.inputErrorMessage.uploadSuccess;
  }

  cleanServerErrors() {
    this.serverServiceErrors.title = null;
    this.serverServiceErrors.locality = null;
    this.serverServiceErrors.comment = null;
    this.serverServiceErrors.date = null;
    this.serverServiceErrors.img = null;
    this.serverServiceErrors.uploadSuccess = null;
  }

  onFileSelect(event) {
    if (1 == event.target.files.length) {
      const file = event.target.files[0];
      // console.log(file);
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
    if (this.is_submit_in_progress) {
      return;
    }
    this.is_submit_in_progress = true;
    let formData = new FormData();
    this.submitted = true;

    if (this.userForm.invalid == true) {
      this.cleanServerErrors();
      this.inputCondition.successLoad = null;
      this.is_submit_in_progress = false;
      this.routerService.inputMineral();
      return;
    } else {
      if (0 == this.input_status) {
        this.userForm.value['price'] = 1;
        this.userForm.value['currency'] = 0;
      }
      Object.keys(this.userForm.value).forEach((key) => {
        formData.append(key, this.userForm.value[key]);
      });
      formData.append('mainImage', '');
      formData.append('status', this.input_status.toString());

      let postedBy = this.auth.getLogUserId();
      this.http
        .post<any>(
          environment.urlAddress + '/api/v1/user_input/mineral/' + postedBy,
          formData,
        )
        .subscribe(
          (returnData: any) => {
            this.is_submit_in_progress = false;
            this.inputCondition.errorLoad = null;
            this.activePage = returnData.activePage;
            this.copyServerErrors(returnData);
            this.allLocality = returnData.localities;
            if (null == returnData.inputErrorMessage.uploadSuccess) {
            } else {
              this.submitted = false;
              this.userForm.get('img').setValue('', { emitEvent: true });
              this.userForm.get('title').setValue('', { emitEvent: true });
              this.userForm.get('price').setValue('', { emitEvent: true });
              this.userForm.get('comment').setValue('', { emitEvent: true });
              this.userForm.get('date').setValue('', { emitEvent: true });
              this.resetTitleImage();
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
