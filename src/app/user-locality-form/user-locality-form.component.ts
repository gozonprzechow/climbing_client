import { Component, OnInit, HostListener, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { AuthenticationService } from '../services/authentication.service';
import { Globals } from '../services/globals.services';
import { ImageModalComponent } from '../models/image-modal/image-modal.component';
import { ConfirmModalComponent } from '../models/confirm-modal/confirm-modal.component';
import { RouterServices } from '../services/router.services';
import { ImageService } from '../services/image.service';
import { MathServices } from '../services/math.service';
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
    styleUrls: ['./user-locality-form.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
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
  actual_area_name: string = '';
  actual_sector_name: string = '';

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
  modifyRoute_txt: string;
  modifyRouteTranslation: TextTranslator = {
    cz: 'Upravit cestu',
    en: 'Modify route',
  };
  addPhoto_txt: string;
  addPhotoTranslation: TextTranslator = {
    cz: 'Přidat fotku',
    en: 'Add photo',
  };
  deleteRoute_txt: string;
  deleteRouteTranslation: TextTranslator = {
    cz: 'Smazat cestu',
    en: 'Delete route',
  };
  modalMessage_txt: string;
  modalMessageTranslation: TextTranslator = {
    cz: 'Chcete smazat cestu?',
    en: 'Do you want delete route?',
  };
  modalTitle_txt: string;
  modalTitleTranslation: TextTranslator = {
    cz: 'Smazat route',
    en: 'Delete route',
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
    public mathServices: MathServices,
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
    this.modifyRoute_txt = this.languageService.getNativeLanguageText(
      this.modifyRouteTranslation,
    );
    this.addPhoto_txt = this.languageService.getNativeLanguageText(
      this.addPhotoTranslation,
    );
    this.deleteRoute_txt = this.languageService.getNativeLanguageText(
      this.deleteRouteTranslation,
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
    this.resizeSvc.countImageWidth();

    let postedBy;
    this.subscriber = this.route.params.subscribe((params) => {
      this.actual_area_name = this.mathServices.hexToString(params.area);
      this.actual_sector_name = this.mathServices.hexToString(params.sector);
      console.log(this.actual_area_name + '  ' + this.actual_sector_name);
      if (!params.idPostedBy) {
        postedBy = this.auth.getLogUserId();
        this.auth.saveActualUserId(postedBy);
      } else {
        postedBy = params.idPostedBy;
        this.auth.saveActualUserId(postedBy);
      }

      this.pagingButtons.setActualPage(params.page);

      this.http
        .get(
          environment.urlAddress +
            '/api/v1/locality/one/' +
            this.actual_area_name +
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
              'userlocality/' + params.uid + '/' + params.page + '/' + params.idPostedBy;
            let achatdbCollection = this.findById(this.achatdbCollections, params.image);
            if (achatdbCollection === undefined) {
              return;
            }
            this.openModalOnImage(achatdbCollection, params.slide, previousUrl);
          }
        });
    });
  }

  private findById(achatdbCollections, id) {
    for (var achatDbCollection of achatdbCollections) {
      if (achatDbCollection._id === id) {
        return achatDbCollection;
      }
    }
    return undefined;
  }

  @HostListener('window:resize', [])
  onResize() {
    this.resizeSvc.refreshScreenSize(window.innerWidth);
    this.resizeSvc.countImageWidth();
    // console.log(this.resizeSvc.getPictureOnPage());
  }

  clickPageButton(page: number): void {
    let postedBy = this.auth.getActualUserId();
    if (!postedBy) {
      postedBy = this.auth.getLogUserId();
    }
    this.routerService.userLocality(this.selectLocality, 'none', postedBy, page);
  }

  openModal(achatdbCollection) {
    let previousUrl;
    this.subscriber = this.route.params.subscribe((params) => {
      previousUrl =
        'userlocality/' + params.uid + '/' + params.page + '/' + params.idPostedBy;
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
            this.actual_area_name +
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
            this.actual_area_name,
            'none',
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
      formData.append('locality', JSON.stringify(this.actual_area_name));
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

  public ifPrice(status) {
    if (1 == status) {
      return true;
    }
    return false;
  }

  public ifAuction(status) {
    if (2 == status) {
      return true;
    }
    return false;
  }
}
