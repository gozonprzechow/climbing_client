import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { AuthenticationService } from '../services/authentication.service';
import { ImageModalComponent } from '../models/image-modal/image-modal.component';
import { RouterServices } from '../services/router.services';
import { environment } from 'src/environments/environment';
import { LanguageService, TextTranslator } from '../services/language.service';
import { ImageService } from '../services/image.service';
import { ResizeService, SCREEN_SIZE } from '../services/resize.service';
import { MobileService } from '../services/mobile.service';

@Component({
  selector: 'app-first-page-form',
  templateUrl: './first-page-form.component.html',
  styleUrls: ['./first-page-form.component.css'],
})
export class FirstPageFormComponent implements OnInit {
  allLocality: any = [];
  activePage: any = {};
  titleMain_txt: string;
  page_description_img: string = '../../../assets/image/achat.jpg';
  titleMainTranslation: TextTranslator = {
    cz: 'Sbírky minerálů',
    en: 'Mineral collections',
  };
  pageDescription_txt: string;
  pageDescriptionTranslation: TextTranslator = {
    cz: 'Zde si můžete založit sbírku minerálů, kde můžete své kameny vystavovat, nebo i dražit a prodávat.',
    en: 'Here you can set up a collection of minerals where you can display your minerals or even auction and sell them.',
  };
  otherUsersCollections: any = [];

  modalRef: BsModalRef;

  constructor(
    public elementRef: ElementRef,
    public http: HttpClient,
    public router: Router,
    public route: ActivatedRoute,
    public modalService: BsModalService,
    public auth: AuthenticationService,
    public languageService: LanguageService,
    public routerService: RouterServices,
    public imageService: ImageService,
    public mobileService: MobileService,
    public resizeSvc: ResizeService,
  ) {
    this.titleMain_txt = this.languageService.getNativeLanguageText(
      this.titleMainTranslation,
    );
    this.pageDescription_txt = this.languageService.getNativeLanguageText(
      this.pageDescriptionTranslation,
    );
  }

  public subscriber: any;

  ngOnInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#242020';
    this.resizeSvc.refreshScreenSize(window.innerWidth);
    this.resizeSvc.countImageWidth();

    let postedBy;
    this.subscriber = this.route.params.subscribe((params) => {
      if (!this.auth.getActualUserId()) {
        postedBy = this.auth.getLogUserId();
      } else {
        postedBy = this.auth.getActualUserId();
      }

      this.http
        .get(environment.urlAddress + '/api/v1/locality/firstPage/' + postedBy)
        .subscribe((data: any) => {
          this.activePage = data.activePage;
          this.allLocality = data.localities;
          this.titleMain_txt = this.languageService.getNativeLanguageText(
            this.titleMainTranslation,
          );
          this.otherUsersCollections = data.otherUsersCollections;

          if (params.image && params.slide) {
            let previousUrl = './';
            let achatdbCollection = this.findById(
              this.otherUsersCollections,
              params.image,
            );
            if (achatdbCollection === undefined) {
              return;
            }
            this.openModalOnImage(
              achatdbCollection,
              params.slide,
              previousUrl,
              params.userNum,
            );
          }
        });
    });
    this.router.navigate([], {
      queryParams: {
        userNum: null,
        image: null,
        slide: null,
      },
      queryParamsHandling: 'merge',
    });
  }

  private findById(other_users_collection, id) {
    for (var other_user of other_users_collection) {
      for (var achatDbCollection of other_user.achatdbCollections) {
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

  routeToAnotherUsersLocalities(anotherUserId) {
    this.auth.saveActualUserId(anotherUserId);
    this.routerService.userLocalities(anotherUserId, 0);
  }

  clickPageButton(page: number): void {
    this.routerService.otherUsers(page);
  }

  openModal(achatdbCollection, numOfUserCollection) {
    let previousUrl;
    this.subscriber = this.route.params.subscribe((params) => {
      previousUrl = './';
      const initialState = {
        list: {
          achatdbCollection: achatdbCollection,
          previousUrl: previousUrl,
          numOfItemCollection: numOfUserCollection,
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
    this.subscriber.unsubscribe();
  }

  openModalOnImage(achatdbCollection, actualSlide, previousUrl, numOfUserCollection) {
    const initialState = {
      list: {
        achatdbCollection: achatdbCollection,
        actualSlide: actualSlide,
        previousUrl: previousUrl,
        numOfItemCollection: numOfUserCollection,
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

  public getUserNameClass(): string {
    if (SCREEN_SIZE.XS === this.resizeSvc.getScreenSize()) {
      return 'userName userName_mobile';
    }
    return 'userName';
  }

  public getDescriptionImageWidth() {
    if (
      SCREEN_SIZE.LG === this.resizeSvc.getScreenSize() ||
      SCREEN_SIZE.XL === this.resizeSvc.getScreenSize()
    ) {
      return 2.5 * this.resizeSvc.getPictureWidth();
    }
    return 1.7 * this.resizeSvc.getPictureWidth();
  }

  public getDescriptionImageTextSizeClass(): string {
    if (SCREEN_SIZE.XS === this.resizeSvc.getScreenSize()) {
      return 'pageDescriptionText mobileTextSize';
    }
    if (SCREEN_SIZE.SM === this.resizeSvc.getScreenSize()) {
      return 'pageDescriptionText smallTextSize';
    }
    return 'pageDescriptionText';
  }

  public getDescriptionMainImageTextSizeClass(): string {
    if (SCREEN_SIZE.XS === this.resizeSvc.getScreenSize()) {
      return 'imageDescriptionText ultraSmallTextSize';
    }
    if (SCREEN_SIZE.SM === this.resizeSvc.getScreenSize()) {
      return 'imageDescriptionText mobileTextSize';
    }
    return 'imageDescriptionText smallTextSize';
  }

  public getDescriptionContainerWidth() {
    if (
      SCREEN_SIZE.LG === this.resizeSvc.getScreenSize() ||
      SCREEN_SIZE.XL === this.resizeSvc.getScreenSize()
    ) {
      return this.resizeSvc.getEndLinerWidth(3) * 1.45;
    }
    return this.resizeSvc.getEndLinerWidth(3);
  }
}
