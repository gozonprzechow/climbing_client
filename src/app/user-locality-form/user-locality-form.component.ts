import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { AuthenticationService } from '../services/authentication.service';
import { Globals } from '../services/globals.services';
import { ImageModalComponent } from '../models/image-modal/image-modal.component';
import { ConfirmModalComponent } from '../models/confirm-modal/confirm-modal.component';
import { RouterServices } from '../services/router.services';
import { ImageService } from '../services/image.service';
import {
  ButtonCollection,
  PagingButtonsServices,
} from '../services/pagingButtons.service';
import { environment } from 'src/environments/environment';
import { LanguageService, TextTranslator } from '../services/language.service';
import { ResizeService, SCREEN_SIZE } from '../services/resize.service';
import { MobileService } from '../services/mobile.service';

@Component({
  selector: 'app-user-locality-form',
  templateUrl: './user-locality-form.component.html',
  styleUrls: [
    './user-locality-form.component.css',
    './user-locality-form-mobile.component.css',
    '../models/mobile.css',
  ],
})
export class UserLocalityFormComponent implements OnInit {
  selectLocality: string;
  allLocality: any = [];
  actualLocality: any = {};
  activePage: any = {};
  tittleMain: string;
  achatdbCollections: any = [];
  deleteCollection: any = {};
  confirmModalMessage: string;
  confirmModalTitle: string;

  modalRef: BsModalRef;

  buttonCollections: ButtonCollection[] = [];

  toProfile_txt: string;
  toProfileTranslation: TextTranslator = {
    cz: 'Na profil',
    en: 'To profile',
  };
  removeFromProfile_txt: string;
  removeFromProfileTranslation: TextTranslator = {
    cz: 'Odstranit z profilu',
    en: 'Remove from profile',
  };
  modifyMineral_txt: string;
  modifyMineralTranslation: TextTranslator = {
    cz: 'Upravit minerál',
    en: 'Modify mineral',
  };
  addSubMineral_txt: string;
  addSubMineralTranslation: TextTranslator = {
    cz: 'Přidat pod-minerál',
    en: 'Add sub-mineral',
  };
  deleteMineral_txt: string;
  deleteMineralTranslation: TextTranslator = {
    cz: 'Smazat minerál',
    en: 'Delete mineral',
  };
  modalMessage_txt: string;
  modalMessageTranslation: TextTranslator = {
    cz: 'Chcete smazat minerál s jeho pod-minerály?',
    en: 'Do you want delete mineral with its sub-minerals?',
  };
  modalTitle_txt: string;
  modalTitleTranslation: TextTranslator = {
    cz: 'Smazat minerál',
    en: 'Delete mineral',
  };

  constructor(
    public elementRef: ElementRef,
    public http: HttpClient,
    public route: ActivatedRoute,
    public modalService: BsModalService,
    public auth: AuthenticationService,
    public routerService: RouterServices,
    public pagingButtons: PagingButtonsServices,
    public languageService: LanguageService,
    public router: Router,
    public globals: Globals,
    public imageService: ImageService,
    public mobileService: MobileService,
    public resizeSvc: ResizeService,
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };

    this.toProfile_txt = this.languageService.getNativeLanguageText(
      this.toProfileTranslation,
    );
    this.removeFromProfile_txt = this.languageService.getNativeLanguageText(
      this.removeFromProfileTranslation,
    );
    this.modifyMineral_txt = this.languageService.getNativeLanguageText(
      this.modifyMineralTranslation,
    );
    this.addSubMineral_txt = this.languageService.getNativeLanguageText(
      this.addSubMineralTranslation,
    );
    this.deleteMineral_txt = this.languageService.getNativeLanguageText(
      this.deleteMineralTranslation,
    );
    this.modalMessage_txt = this.languageService.getNativeLanguageText(
      this.modalMessageTranslation,
    );
    this.modalTitle_txt = this.languageService.getNativeLanguageText(
      this.modalTitleTranslation,
    );

    this.confirmModalMessage = this.modalMessage_txt;
    this.confirmModalTitle = this.modalTitle_txt;
  }

  public subscriber: any;

  ngOnInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#242020';
    this.resizeSvc.refreshScreenSize(window.innerWidth);
    this.resizeSvc.countImageWidth(window.innerWidth);

    let postedBy;
    this.subscriber = this.route.params.subscribe((params) => {
      if (!params.idPostedBy) {
        postedBy = this.auth.getLogUserId();
      } else {
        postedBy = params.idPostedBy;
      }

      this.pagingButtons.setActualPage(params.page);

      this.http
        .get(
          environment.urlAddress +
            '/api/v1/locality/one/' +
            params.uid +
            '/' +
            this.pagingButtons.getActualPage() +
            '/' +
            postedBy,
        )
        .subscribe((data: any) => {
          this.pagingButtons.setNumOfPage(data.numberOfPages);
          this.buttonCollections = this.pagingButtons.createButtonsField();
          this.selectLocality = data.title;
          this.activePage = data.activePage;
          this.allLocality = data.localities;
          this.actualLocality = data.locality;
          this.tittleMain = this.selectLocality;
          this.achatdbCollections = data.achatdbCollections;

          if (params.image && params.slide) {
            let previousUrl =
              'locality/' + params.uid + '/' + params.page + '/' + params.idPostedBy;
            const achatdbCollection = this.achatdbCollections.find(
              ({ _id }) => _id === params.image,
            );
            this.openModalOnImage(achatdbCollection, params.slide, previousUrl);
          }
        });
    });
  }

  @HostListener('window:resize', [])
  onResize() {
    this.resizeSvc.refreshScreenSize(window.innerWidth);
    this.resizeSvc.countImageWidth(window.innerWidth);
    // console.log(this.resizeSvc.getPictureOnPage());
  }

  clickPageButton(page: number): void {
    let postedBy = this.auth.getActualUserId();
    if (!postedBy) {
      postedBy = this.auth.getLogUserId();
    }
    this.routerService.userLocality(this.selectLocality, postedBy, page);
  }

  openModal(achatdbCollection) {
    let previousUrl;
    this.subscriber = this.route.params.subscribe((params) => {
      previousUrl =
        'locality/' + params.uid + '/' + params.page + '/' + params.idPostedBy;
      const initialState = {
        list: {
          achatdbCollection: achatdbCollection,
          previousUrl: previousUrl,
        },
      };

      this.modalRef = this.modalService.show(
        ImageModalComponent,
        Object.assign(
          { animated: false },
          { class: 'mineralImageModal' },
          { initialState },
        ),
      );
    });
  }

  openModalOnImage(achatdbCollection, actualSlide, previousUrl) {
    const initialState = {
      list: {
        achatdbCollection: achatdbCollection,
        actualSlide: actualSlide,
        previousUrl: previousUrl,
      },
    };

    this.modalRef = this.modalService.show(
      ImageModalComponent,
      Object.assign(
        { animated: false },
        { class: 'mineralImageModal' },
        { initialState },
      ),
    );
  }

  openConfirmModal(achatdbCollection) {
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
    this.deleteCollection = achatdbCollection;
    this.modalRef.content.event.subscribe((res) => {
      this.confirmDeleteImage();
    });
  }

  confirmDeleteImage() {
    let formData = new FormData();

    formData.append('achatdbCollection', JSON.stringify(this.deleteCollection));

    let postedBy;
    this.subscriber = this.route.params.subscribe((params) => {
      if (!params.idPostedBy) {
        postedBy = this.auth.getLogUserId();
      } else {
        postedBy = params.idPostedBy;
      }

      this.pagingButtons.setActualPageOnDeleteItem(
        params.page,
        this.achatdbCollections.length,
      );

      this.http
        .post<any>(
          environment.urlAddress +
            '/api/v1/locality/one/' +
            params.uid +
            '/' +
            this.pagingButtons.getActualPage() +
            '/' +
            postedBy,
          formData,
        )
        .subscribe((data: any) => {
          this.pagingButtons.setNumOfPage(data.numberOfPages);
          this.buttonCollections = this.pagingButtons.createButtonsField();
          this.activePage = data.activePage;
          this.actualLocality = data.locality;
          this.allLocality = data.localities;
          this.achatdbCollections = data.achatdbCollections;
          this.routerService.userLocality(
            params.uid,
            postedBy,
            this.pagingButtons.getActualPage(),
          );
        });
    });
  }

  public toggleProfileMineral(achatdbCollection) {
    let formData = new FormData();

    formData.append('achatdbCollection', JSON.stringify(achatdbCollection));
    formData.append('actual_page', JSON.stringify(this.activePage));

    let postedBy;
    this.subscriber = this.route.params.subscribe((params) => {
      formData.append('locality', JSON.stringify(params.uid));
      if (!params.idPostedBy) {
        postedBy = this.auth.getLogUserId();
      } else {
        postedBy = params.idPostedBy;
      }

      this.pagingButtons.setActualPageOnDeleteItem(
        params.page,
        this.achatdbCollections.length,
      );

      this.http
        .post<any>(
          environment.urlAddress + '/api/v1/locality/toggleProfileMineral/' + postedBy,
          formData,
        )
        .subscribe((data: any) => {
          this.achatdbCollections = data.achatdbCollections;
        });
    });
  }

  public getDropdownToggleClass(achatdbCollection): String {
    if (achatdbCollection.mainPage) {
      return 'top-right btn-secondary dropdown-toggle dropdownToggleProfile';
    }
    return 'top-right btn-secondary dropdown-toggle dropdownToggleStandard';
  }

  public isProfileMineral(achatdbCollection): Boolean {
    if (achatdbCollection.mainPage) {
      return true;
    }
    return false;
  }

  public getImageLocalityClass(index): string {
    if (SCREEN_SIZE.XS === this.resizeSvc.getScreenSize()) {
      if (0 === index) {
        return 'imageLocality imageLocality_firstMobile';
      } else {
        return 'imageLocality imageLocality_mobile';
      }
    }
    return 'imageLocality';
  }
}
