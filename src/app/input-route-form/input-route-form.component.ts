import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  UntypedFormControl,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { InputCondition } from '../models/inputMineral';
import { AuthenticationService } from '../services/authentication.service';
import { RouterServices } from '../services/router.services';
import { environment } from 'src/environments/environment';
import { LanguageService, TextTranslator, Country } from '../services/language.service';
import { ResizeService, SCREEN_SIZE } from '../services/resize.service';
import { MobileService } from '../services/mobile.service';
import { InputMineralService, ImageInfo } from '../services/input.mineral.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { InputAreaModalComponent } from '../models/input-area-modal/input-area-modal.component';
import { InputSectorModalComponent } from '../models/input-sector-modal/input-sector-modal.component';

@Component({
  selector: 'app-input-route-form',
  templateUrl: './input-route-form.component.html',
  styleUrls: ['./input-route-form.component.css', '../models/mobile.css'],
})
export class InputRouteFormComponent implements OnInit {
  submitted = false;
  userForm: UntypedFormGroup;
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
  mainImage: any;
  shadow_upload_success: string;

  product: any = {};
  recommended_locality: string = '';

  imgSetStandardSrc: string;
  imgSetPrizeSrc: string;
  imgSetAuctionSrc: string;
  input_status: Number = 0;

  imgAddArea: string;
  imgAddSector: string;

  areaModalRef: BsModalRef;
  sectorModalRef: BsModalRef;

  is_submit_in_progress: boolean = false;

  selectedFiles: FileList;
  previews: string[] = [];
  loading_in_progress: boolean = false;
  route_after_submit_information: any;

  titleMain_txt: string;
  titleMainTranslation: TextTranslator = {
    cz: 'Vložit cestu',
    en: 'Input route',
  };
  title_txt: string;
  titleTranslation: TextTranslator = {
    cz: 'Popisek',
    en: 'Title',
  };
  area_txt: string;
  areaTranslation: TextTranslator = {
    cz: 'Oblast',
    en: 'Area',
  };
  sector_txt: string;
  sectorTranslation: TextTranslator = {
    cz: 'Sektor',
    en: 'Sector',
  };
  comment_txt: string;
  commentTranslation: TextTranslator = {
    cz: 'Komentář',
    en: 'Comment',
  };
  priority_txt: string;
  priorityTranslation: TextTranslator = {
    cz: 'Priorita <0, 1000>',
    en: 'Priority <0, 1000>',
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
    public formBuilder: UntypedFormBuilder,
    public http: HttpClient,
    public languageService: LanguageService,
    public routerService: RouterServices,
    public auth: AuthenticationService,
    public resizeSvc: ResizeService,
    public mobileService: MobileService,
    public input_mineral_service: InputMineralService,
    public modalService: BsModalService,
  ) {
    this.imgSetStandardSrc = '../../../assets/skins/insert_standard_collection_hover.png';
    this.imgSetPrizeSrc = '../../../assets/skins/insert_prize_collection.png';
    this.imgSetAuctionSrc = '../../../assets/skins/insert_auction_collection.png';
    this.imgAddArea = '../../../assets/skins/add_friend_button.png';
    this.imgAddSector = '../../../assets/skins/add_friend_button.png';

    this.titleMain_txt = this.languageService.getNativeLanguageText(
      this.titleMainTranslation,
    );
    this.title_txt = this.languageService.getNativeLanguageText(this.titleTranslation);
    this.area_txt = this.languageService.getNativeLanguageText(
      this.areaTranslation,
    );
    this.sector_txt = this.languageService.getNativeLanguageText(
      this.sectorTranslation,
    );
    this.comment_txt = this.languageService.getNativeLanguageText(
      this.commentTranslation,
    );
    this.priority_txt = this.languageService.getNativeLanguageText(
      this.priorityTranslation,
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
    this.input_mineral_service.clearImageInfo();
    this.previews.length = 0;
    this.loading_in_progress = false;
    this.resetTitleImage();
    this.resizeSvc.refreshScreenSize(window.innerWidth);
    this.resizeSvc.countImageWidth();
    this.product = history.state;
    if (this.product.data != null) {
      this.recommended_locality = this.product.data.locality;
    }
    this.userForm = this.formBuilder.group(
      {
        title: ['', [Validators.required, Validators.maxLength(50)]],
        locality: [
          this.recommended_locality,
          [Validators.required, Validators.maxLength(50)],
        ],
        comment: ['', [Validators.maxLength(300)]],
        priority: [1, [Validators.maxLength(100), Validators.pattern('^[0-9]+$')]],
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
    this.resizeSvc.countImageWidth();
  }

  get price(): UntypedFormControl {
    return this.userForm.controls.price as UntypedFormControl;
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

  invalidPriority() {
    return this.submitted && this.userForm.controls.priority.errors != null;
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
    this.shadow_upload_success = returnData.inputErrorMessage.uploadSuccess;
  }

  cleanServerErrors() {
    this.serverServiceErrors.title = null;
    this.serverServiceErrors.locality = null;
    this.serverServiceErrors.comment = null;
    this.serverServiceErrors.date = null;
    this.serverServiceErrors.img = null;
    this.serverServiceErrors.uploadSuccess = null;
    this.shadow_upload_success = null;
  }

  async readAsync(file_in_array: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(this.selectedFiles[file_in_array]);
      reader.onload = (e: any) => {
        resolve(e.target.result);
      };
      reader.onerror = () => {
        reject(new Error('Unable to read..'));
      };
    });
  }

  async onFileSelect(event) {
    if (0 < event.length) {
      this.selectedFiles = event;
      this.input_mineral_service.clearImageInfo();
      this.loading_in_progress = true;

      this.previews = [];
      if (this.selectedFiles && this.selectedFiles[0]) {
        const numberOfFiles = this.selectedFiles.length;
        for (let i = 0; i < numberOfFiles; i++) {
          this.previews[i] = await this.readAsync(i);
          if (i === 0) {
            this.input_mineral_service.addImage(
              i,
              this.previews[i],
              true,
              this.selectedFiles[i],
            );
          } else {
            this.input_mineral_service.addImage(
              i,
              this.previews[i],
              false,
              this.selectedFiles[i],
            );
          }
        }
        this.loading_in_progress = false;
      }
    }
  }

  public openInputAreaModal() {
    const initialState = {
      list: {
        pageSize: this.resizeSvc.getPageWidth(),
        screenSize: this.resizeSvc.getScreenSize(),
        modalRef: BsModalRef,
      },
    };

    this.areaModalRef = this.modalService.show(
      InputAreaModalComponent,
      Object.assign(
        { animated: false },
        { class: 'inputLocationModal' },
        { initialState },
      ),
    );
    this.areaModalRef.content.event.subscribe((res) => {
      // console.log(res);
      setTimeout(() => {
      }, 50);
    });
  }

  public openInputSectorModal() {
    const initialState = {
      list: {
        pageSize: this.resizeSvc.getPageWidth(),
        screenSize: this.resizeSvc.getScreenSize(),
        modalRef: BsModalRef,
      },
    };

    this.sectorModalRef = this.modalService.show(
      InputSectorModalComponent,
      Object.assign(
        { animated: false },
        { class: 'inputLocationModal' },
        { initialState },
      ),
    );
    this.sectorModalRef.content.event.subscribe((res) => {
      // console.log(res);
      setTimeout(() => {
      }, 50);
    });
  }

  async onSubmit() {
    if (this.is_submit_in_progress) {
      return;
    }
    this.is_submit_in_progress = true;
    this.submitted = true;

    if (this.userForm.invalid == true) {
      this.cleanServerErrors();
      this.inputCondition.successLoad = null;
      this.is_submit_in_progress = false;
      this.routerService.inputRoute();
      return;
    } else {
      if (await this.postInputMineral()) {
        await this.postSubImages();
        setTimeout(() => {
          this.is_submit_in_progress = false;
          this.input_mineral_service.clearImageInfo();
          this.previews.length = 0;
          this.loading_in_progress = false;
          this.routerService.userLocalityDirectRoute(
            this.route_after_submit_information.locality,
            this.route_after_submit_information.postedBy,
            this.route_after_submit_information.page_of_image,
            this.route_after_submit_information.image_id,
          );
        }, 1500);
      }
    }
  }

  private async postInputMineral(): Promise<boolean> {
    let input_main_mineral_success: boolean = true;
    if (this.input_mineral_service.getImagesInfo().length <= 0) {
      input_main_mineral_success = false;
      return new Promise<boolean>((resolve) => {
        resolve(input_main_mineral_success);
      });
    }
    let main_image_position_in_images: number = 0;
    let main_image_info: ImageInfo = this.input_mineral_service.getImagesInfo()[0];
    for (let i = 0; i < this.input_mineral_service.getImagesInfo().length; i++) {
      if (this.input_mineral_service.getImagesInfo()[i].is_front_image) {
        main_image_info = this.input_mineral_service.getImagesInfo()[i];
        main_image_position_in_images = i;
        break;
      }
    }
    // console.log(main_image_info);
    let formData = new FormData();
    if (0 == this.input_status) {
      this.userForm.value['price'] = 1;
      this.userForm.value['currency'] = 0;
    }
    formData.append('title', this.userForm.value['title']);
    formData.append('locality', this.userForm.value['locality']);
    formData.append('comment', this.userForm.value['comment']);
    formData.append('priority', this.userForm.value['priority']);
    formData.append('date', this.userForm.value['date']);
    formData.append('price', this.userForm.value['price']);
    formData.append('currency', this.userForm.value['currency']);
    formData.append('img', main_image_info.file);
    formData.append('mainImage', '');
    formData.append('status', this.input_status.toString());

    let postedBy = this.auth.getLogUserId();
    let returnData;
    try {
      returnData = await this.http
        .post<any>(
          environment.urlAddress + '/api/v1/user_input/mineral/' + postedBy,
          formData,
        )
        .toPromise();
      this.inputCondition.errorLoad = null;
      this.activePage = returnData.activePage;
      this.copyServerErrors(returnData);
      this.allLocality = returnData.localities;
      if (null == returnData.inputErrorMessage.uploadSuccess) {
        input_main_mineral_success = false;
        this.input_mineral_service.setUploadResult(main_image_position_in_images, false);
      } else {
        this.route_after_submit_information = returnData.image_route_info;
        this.mainImage = this.route_after_submit_information.image_id;
        this.input_mineral_service.setUploadResult(main_image_position_in_images, true);
      }
    } catch (error) {
      this.serverServiceErrors.uploadSuccess = null;
      this.shadow_upload_success = null;
      input_main_mineral_success = false;
      this.input_mineral_service.setUploadResult(main_image_position_in_images, false);
    }
    this.input_mineral_service.setImageUpload(main_image_position_in_images);
    return new Promise<boolean>((resolve) => {
      resolve(input_main_mineral_success);
    });
  }

  public async postSubImages(): Promise<void> {
    if (this.input_mineral_service.getImagesInfo().length <= 1) {
      return new Promise((resolve) => resolve());
    }

    for (let i = 0; i < this.input_mineral_service.getImagesInfo().length; i++) {
      if (!this.input_mineral_service.getImagesInfo()[i].is_front_image) {
        let formData = new FormData();
        formData.append('comment', '');
        formData.append('img', this.input_mineral_service.getImagesInfo()[i].file);
        formData.append('mainImage', this.mainImage);

        let returnData;
        try {
          returnData = await this.http
            .post<any>(environment.urlAddress + '/api/v1/user_input/subMineral', formData)
            .toPromise();
          this.inputCondition.errorLoad = returnData.inputErrorMessage.uploadError;
          this.copyServerErrors(returnData);
          if (null == returnData.inputErrorMessage.uploadSuccess) {
            this.input_mineral_service.setUploadResult(i, false);
          } else {
            this.input_mineral_service.setUploadResult(i, true);
          }
        } catch (error) {
          this.input_mineral_service.setUploadResult(i, false);
        }
        this.input_mineral_service.setImageUpload(i);
      }
    }
    this.serverServiceErrors.uploadSuccess = this.shadow_upload_success;
    return new Promise((resolve) => resolve());
  }
}
