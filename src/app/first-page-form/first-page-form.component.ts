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
  titleMainTranslation: TextTranslator = {
    cz: 'Sbírky minerálů',
    en: 'Mineral collections',
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
  ) {}

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
            const achatdbCollection =
              this.otherUsersCollections[0].achatdbCollections.find(
                ({ _id }) => _id === params.image,
              );
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
}
