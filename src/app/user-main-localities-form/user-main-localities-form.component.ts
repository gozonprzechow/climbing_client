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
  selector: 'app-user-main-localities-form',
  templateUrl: './user-main-localities-form.component.html',
  styleUrls: ['./user-main-localities-form.component.css'],
})
export class UserMainLocalitiesFormComponent implements OnInit {
  allLocality: any = [];
  activePage: any = {};
  localityCollections: any = [];
  confirmModalMessage: string;
  confirmModalTitle: string;

  modalRef: BsModalRef;

  buttonCollections: ButtonCollection[] = [];

  titleMain_txt: string;
  titleMainTranslation: TextTranslator = {
    cz: 'Lokality uživatele',
    en: 'User localities',
  };
  modifyLocality_txt: string;
  modifyLocalityTranslation: TextTranslator = {
    cz: 'Upravit lokalitu',
    en: 'Modify locality',
  };
  deleteLocality_txt: string;
  deleteLocalityTranslation: TextTranslator = {
    cz: 'Smazat lokalitu',
    en: 'Delete locality',
  };
  modalMessage_txt: string;
  modalMessageTranslation: TextTranslator = {
    cz: 'Chcete smazat tuto lokalitu a všechny její kolekce?',
    en: 'Do you want delete this locality and all their collections?',
  };
  modalTitle_txt: string;
  modalTitleTranslation: TextTranslator = {
    cz: 'Smazat lokalitu',
    en: 'Delete locality',
  };

  constructor(
    public elementRef: ElementRef,
    public http: HttpClient,
    public route: ActivatedRoute,
    public routerService: RouterServices,
    public pagingButtons: PagingButtonsServices,
    public auth: AuthenticationService,
    public globals: Globals,
    public router: Router,
    public languageService: LanguageService,
    public modalService: BsModalService,
    public imageService: ImageService,
    public mobileService: MobileService,
    public resizeSvc: ResizeService,
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
    this.titleMain_txt = this.languageService.getNativeLanguageText(
      this.titleMainTranslation,
    );
    this.modifyLocality_txt = this.languageService.getNativeLanguageText(
      this.modifyLocalityTranslation,
    );
    this.deleteLocality_txt = this.languageService.getNativeLanguageText(
      this.deleteLocalityTranslation,
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

  public routeToUserLocality(localityName) {
    let userId = this.auth.getActualUserId();
    this.routerService.userLocality(localityName, userId, 0);
  }

  ngOnInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#242020';
    this.resizeSvc.refreshScreenSize(window.innerWidth);
    this.resizeSvc.countImageWidth();

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
            '/api/v1/locality/all/' +
            this.pagingButtons.getActualPage() +
            '/' +
            postedBy,
        )
        .subscribe((data: any) => {
          this.pagingButtons.setNumOfPage(data.numberOfPages);
          this.buttonCollections = this.pagingButtons.createButtonsField();
          this.activePage = data.activePage;
          this.allLocality = data.localities;
          this.localityCollections = data.localityCollections;

          if (params.image && params.slide) {
            let previousUrl = 'localities/' + params.page + '/' + params.idPostedBy;
            let achatdbCollection = this.findById(this.localityCollections, params.image);
            if (achatdbCollection === undefined) {
              return;
            }
            this.openModalOnImage(
              achatdbCollection,
              params.slide,
              previousUrl,
              params.localityNum,
            );
          }
        });
    });
  }

  private findById(localityCollections, id) {
    for (var localityCollection of localityCollections) {
      for (var achatDbCollection of localityCollection.achatdbCollections) {
        if (achatDbCollection._id === id) {
          return achatDbCollection;
        }
      }
    }
    return undefined;
  }

  @HostListener('window:resize', [])
  onResize() {
    this.resizeSvc.refreshScreenSize(window.innerWidth);
    this.resizeSvc.countImageWidth();
  }

  clickPageButton(page: number): void {
    let postedBy = this.auth.getActualUserId();
    if (!postedBy) {
      postedBy = this.auth.getLogUserId();
    }
    this.routerService.userLocalities(postedBy, page);
  }

  openModal(achatdbCollection, numOflocalityCollection) {
    let previousUrl;
    this.subscriber = this.route.params.subscribe((params) => {
      previousUrl = 'localities/' + params.page + '/' + params.idPostedBy;
      const initialState = {
        list: {
          achatdbCollection: achatdbCollection,
          previousUrl: previousUrl,
          numOfItemCollection: numOflocalityCollection,
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

  openModalOnImage(achatdbCollection, actualSlide, previousUrl, numOflocalityCollection) {
    const initialState = {
      list: {
        achatdbCollection: achatdbCollection,
        actualSlide: actualSlide,
        previousUrl: previousUrl,
        numOfItemCollection: numOflocalityCollection,
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

  openConfirmModal(locality) {
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
    this.modalRef.content.event.subscribe((res) => {
      this.runDeleteLocality(locality);
    });
  }

  runDeleteLocality(locality) {
    let formData = new FormData();

    formData.append('locality', JSON.stringify(locality));

    let postedBy;
    this.subscriber = this.route.params.subscribe((params) => {
      if (!params.idPostedBy) {
        postedBy = this.auth.getLogUserId();
      } else {
        postedBy = params.idPostedBy;
      }

      this.pagingButtons.setActualPageOnDeleteItem(
        params.page,
        this.localityCollections.length,
      );

      this.http
        .post<any>(
          environment.urlAddress +
            '/api/v1/user_input/deleteLocality/' +
            this.pagingButtons.getActualPage() +
            '/' +
            postedBy,
          formData,
        )
        .subscribe((data: any) => {
          this.pagingButtons.setNumOfPage(data.numberOfPages);
          this.buttonCollections = this.pagingButtons.createButtonsField();
          this.activePage = data.activePage;
          this.allLocality = data.localities;
          this.localityCollections = data.localityCollections;
          this.routerService.userLocalities(postedBy, this.pagingButtons.getActualPage());
        });
    });
  }

  public getLocalityDropDownClass(): string {
    if (SCREEN_SIZE.XS === this.resizeSvc.getScreenSize()) {
      return 'btn-secondary dropdown-toggle top-right top-right_mobile';
    }
    return 'btn-secondary dropdown-toggle top-right';
  }

  public getLocalityNameClass(): string {
    if (SCREEN_SIZE.XS === this.resizeSvc.getScreenSize()) {
      return 'localityName localityName_mobile';
    }
    return 'localityName';
  }
}
