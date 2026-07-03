import { Component, OnInit, HostListener, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { AuthenticationService } from '../services/authentication.service';
import { Globals } from '../services/globals.services';
import { ImageModalComponent } from '../models/image-modal/image-modal.component';
import { RouterServices } from '../services/router.services';
import { ChatService } from '../services/chat.service';
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
    selector: 'app-other-users-form',
    templateUrl: './other-users-form.component.html',
    styleUrls: ['./other-users-form.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class OtherUsersFormComponent implements OnInit {
  allLocality: any = [];
  activePage: any = {};
  otherUsersCollections: any = [];
  userForm: UntypedFormGroup;

  modalRef: BsModalRef;

  buttonCollections: ButtonCollection[] = [];

  titleMain_txt: string;
  titleMainTranslation: TextTranslator = {
    cz: 'Ostatní uživatelé',
    en: 'Other users',
  };

  sendMessage_txt: string;
  sendMessageTranslation: TextTranslator = {
    cz: 'Poslat zprávu',
    en: 'Send message',
  };

  addFriend_txt: string;
  addFriendTranslation: TextTranslator = {
    cz: 'Přidat přítele',
    en: 'Add friend',
  };

  confirmFriend_txt: string;
  confirmFriendTranslation: TextTranslator = {
    cz: 'Potvrdit přátelství',
    en: 'Confirm friendship',
  };

  constructor(
    public elementRef: ElementRef,
    public formBuilder: UntypedFormBuilder,
    public http: HttpClient,
    public router: Router,
    public route: ActivatedRoute,
    public modalService: BsModalService,
    public auth: AuthenticationService,
    public routerService: RouterServices,
    public languageService: LanguageService,
    public chatService: ChatService,
    public pagingButtons: PagingButtonsServices,
    public imageService: ImageService,
    public mobileService: MobileService,
    public resizeSvc: ResizeService,
  ) {
    this.titleMain_txt = this.languageService.getNativeLanguageText(
      this.titleMainTranslation,
    );
    this.sendMessage_txt = this.languageService.getNativeLanguageText(
      this.sendMessageTranslation,
    );
    this.addFriend_txt = this.languageService.getNativeLanguageText(
      this.addFriendTranslation,
    );
    this.confirmFriend_txt = this.languageService.getNativeLanguageText(
      this.confirmFriendTranslation,
    );
  }

  public subscriber: any;

  ngOnInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#242020';
    this.resizeSvc.refreshScreenSize(window.innerWidth);
    this.resizeSvc.countImageWidth();

    this.userForm = this.formBuilder.group({}, { updateOn: 'submit' });

    let postedBy;
    this.subscriber = this.route.params.subscribe((params) => {
      if (!this.auth.getActualUserId()) {
        postedBy = this.auth.getLogUserId();
      } else {
        postedBy = this.auth.getActualUserId();
      }

      this.pagingButtons.setActualPage(params.page);

      if (this.auth.isLoggedIn()) {
        let idUser = this.auth.getLogUserId();

        this.http
          .get(
            environment.urlAddress +
              '/api/v1/locality/otherUsers/' +
              this.pagingButtons.getActualPage() +
              '/' +
              idUser +
              '/' +
              postedBy,
          )
          .subscribe((data: any) => {
            this.reactionOnGetOtherUser(data, params);
          });
      } else {
        this.http
          .get(
            environment.urlAddress +
              '/api/v1/locality/otherUsers/' +
              this.pagingButtons.getActualPage() +
              '/' +
              postedBy,
          )
          .subscribe((data: any) => {
            this.reactionOnGetOtherUser(data, params);
          });
      }
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

  private reactionOnGetOtherUser(data: any, params: any) {
    this.setGetOtherUserData(data);
    if (params.image && params.slide) {
      this.openModalAfterGetOtherUser(params);
    }
  }

  private setGetOtherUserData(data: any) {
    this.pagingButtons.setNumOfPage(data.numberOfPages);
    this.buttonCollections = this.pagingButtons.createButtonsField();
    this.activePage = data.activePage;
    this.allLocality = data.localities;
    this.otherUsersCollections = data.otherUsersCollections;
  }

  private openModalAfterGetOtherUser(params: any) {
    let previousUrl = 'otherUsers/' + params.page;
    let achatdbCollection = this.findById(this.otherUsersCollections, params.image);
    if (achatdbCollection === undefined) {
      return;
    }
    this.openModalOnImage(achatdbCollection, params.slide, previousUrl, params.userNum);
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
      previousUrl = 'otherUsers/' + params.page;
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

  public sendMessage(other_user) {
    let recipient: any = {};
    recipient.name = other_user.name;
    recipient.id = other_user.postedBy;
    this.routerService.chat(recipient, 0);
  }

  public sendFriendshipRequest(user_id, order_in_user_collection) {
    let formData = new FormData();
    formData.append('friend_id', user_id);
    let logUser = this.auth.getLogUserId();
    this.subscriber = this.route.params.subscribe((params) => {
      this.http
        .post<any>(
          environment.urlAddress +
            '/api/v1/user_input/requestFriendship/' +
            logUser +
            '/' +
            user_id,
          formData,
        )
        .subscribe((data: any) => {
          if (data.success_flag) {
            this.otherUsersCollections[
              order_in_user_collection
            ].otherUser.frienship_requester = true;
          }
        });
    });
  }

  public sendConfirmFriendship(friend_id, order_in_user_collection) {
    let formData = new FormData();
    formData.append('friend_id', friend_id);
    let logUser = this.auth.getLogUserId();
    this.subscriber = this.route.params.subscribe((params) => {
      this.http
        .post<any>(
          environment.urlAddress +
            '/api/v1/user_input/confirmFriendship/' +
            logUser +
            '/' +
            friend_id,
          formData,
        )
        .subscribe((data: any) => {
          if (data.success_flag) {
            this.otherUsersCollections[
              order_in_user_collection
            ].otherUser.requested_friend = false;
            this.otherUsersCollections[
              order_in_user_collection
            ].otherUser.confirmed_friend = true;
          }
        });
    });
  }

  public getUserDropDownClass(): string {
    if (SCREEN_SIZE.XS === this.resizeSvc.getScreenSize()) {
      return 'btn-secondary dropdown-toggle top-right top-right_mobile';
    }
    return 'btn-secondary dropdown-toggle top-right';
  }

  public getUserNameClass(): string {
    if (SCREEN_SIZE.XS === this.resizeSvc.getScreenSize()) {
      return 'userName userName_mobile';
    }
    return 'userName';
  }
}
