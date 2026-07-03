import { Component, OnInit, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AuthenticationService } from '../../services/authentication.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { LanguageService, TextTranslator } from '../../services/language.service';
import { OfferService } from '../../services/offerService';
import { RouterServices } from '../../services/router.services';

@Component({
    selector: 'app-add-offer-modal',
    templateUrl: './add-offer-modal.component.html',
    styleUrls: ['./add-offer-modal.component.css'],
    standalone: false
})
export class AddOfferModalComponent implements OnInit {
  submitted = false;
  textValue: string = '';
  actualSlide: number = 0;
  list: any = {};
  public event: EventEmitter<any> = new EventEmitter();
  userForm: UntypedFormGroup;
  serviceErrors: any = {};
  serverServiceErrors: any = {};

  priceTitleTranslation: TextTranslator = {
    cz: 'Zaslat nabídku',
    en: 'Send offer',
  };

  auctionTitleTranslation: TextTranslator = {
    cz: 'Přihodit v aukci',
    en: 'Bind in the auction',
  };

  title_txt: string;

  offerPrice_txt: string;
  offerPriceTranslation: TextTranslator = {
    cz: 'Nabízená cena:',
    en: 'Price offered:',
  };
  message_txt: string;
  messageTranslation: TextTranslator = {
    cz: 'Zpráva:',
    en: 'Message:',
  };
  offerModalTitle_txt: string;
  offerModalTitleTranslation: TextTranslator = {
    cz: 'Zaslání nabídky',
    en: 'Send offer',
  };

  constructor(
    public http: HttpClient,
    public bsModalRef: BsModalRef,
    public formBuilder: UntypedFormBuilder,
    public auth: AuthenticationService,
    public routerService: RouterServices,
    public languageService: LanguageService,
    public offerService: OfferService,
  ) {
    this.offerPrice_txt = this.languageService.getNativeLanguageText(
      this.offerPriceTranslation,
    );
    this.message_txt = this.languageService.getNativeLanguageText(
      this.messageTranslation,
    );
    this.offerModalTitle_txt = this.languageService.getNativeLanguageText(
      this.offerModalTitleTranslation,
    );
  }

  public subscriber: any;

  ngOnInit() {
    this.userForm = this.formBuilder.group(
      {
        price: [
          '',
          [
            Validators.required,
            Validators.max(999999999999),
            Validators.pattern('^[0-9]+$'),
          ],
        ],
        message: ["", [Validators.maxLength(300)]],
      },
      { updateOn: 'submit' },
    );
    if (this.offerService.isPrice(this.list.achat_collection.status)) {
      this.title_txt = this.languageService.getNativeLanguageText(
        this.priceTitleTranslation,
      );
      this.userForm.get('price').setValue(this.list.achat_collection.price);
    } else {
      this.title_txt = this.languageService.getNativeLanguageText(
        this.auctionTitleTranslation,
      );
    }
    // console.log(this.list);
  }

  public invalidPrice() {
    return this.submitted && this.userForm.controls.price.errors != null;
  }

  public invalidMessage() {
    return this.submitted && this.userForm.controls.message.errors != null;
  }

  cleanServerErrors() {
    this.serverServiceErrors.price = null;
    this.serverServiceErrors.uploadSuccess = null;
    this.serverServiceErrors.errorMessage = null;
  }

  onSubmit() {
    let formData = new FormData();
    this.submitted = true;

    // console.log(this.list.achat_collection);

    formData.append('mainImage', this.list.achat_collection._id);

    if (this.userForm.invalid == true) {
      this.cleanServerErrors();
      return;
    } else {
      Object.keys(this.userForm.value).forEach((key) => {
        formData.append(key, this.userForm.value[key]);
      });

      this.http
        .post<any>(environment.urlAddress + '/api/v1/user_input/bind', formData)
        .subscribe(
          (returnData: any) => {
            if (null == returnData.inputErrorMessageBind.uploadSuccess) {
            } else {
              this.submitted = false;
              this.userForm.get('price').setValue('', { emitEvent: true });
              this.userForm.get('message').setValue('', { emitEvent: true });
              this.list.achat_collection.binds.push(returnData.bind);
              this.list.achat_collection.price = returnData.price;
              // console.log(this.list.achat_collection);
              // console.log(this.list.achat_collection);
              this.bsModalRef.hide();
              this.event.emit({ new_price: returnData.price });
            }
          },
          (error) => {
            this.bsModalRef.hide();
          },
        );
    }
  }
}
