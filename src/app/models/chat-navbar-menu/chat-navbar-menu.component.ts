import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { AuthenticationService } from '../../services/authentication.service';
import { RouterServices } from '../../services/router.services';
import { LanguageService, TextTranslator } from '../../services/language.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ConfirmModalComponent } from '../../models/confirm-modal/confirm-modal.component';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-navbar-menu',
  templateUrl: './chat-navbar-menu.component.html',
  styleUrls: ['./chat-navbar-menu.component.css'],
  host: {
    '(window:resize)': 'onResize($event)',
  },
})
export class ChatNavbarMenuComponent {
  @Input() friends: any = [];
  navbarOpen = false;
  imgAlertSrc: String;
  img_search: String;
  imgSrc: String;
  img_remove_friendship_request: String;
  img_add_friendship_request: String;
  dropdownMenuClass: String = '';

  search_user: String;
  modalRef: BsModalRef;
  @Output() event: EventEmitter<any> = new EventEmitter();
  searched_users_collection: any = [];
  find_users_collection: any = [];

  home_txt: string;
  homeTranslation: TextTranslator = {
    cz: 'Domů',
    en: 'Home',
  };
  userLocalities_txt: string;
  userLocalitiesTranslation: TextTranslator = {
    cz: 'Lokality uživatele',
    en: 'User localities',
  };
  locality_txt: string;
  localityTranslation: TextTranslator = {
    cz: 'Lokality',
    en: 'Locality',
  };
  add_txt: string;
  addTranslation: TextTranslator = {
    cz: 'Přidat',
    en: 'Add',
  };
  inputLocality_txt: string;
  inputLocalityTranslation: TextTranslator = {
    cz: 'Vložit lokalitu',
    en: 'Input locality',
  };
  inputMineral_txt: string;
  inputMineralTranslation: TextTranslator = {
    cz: 'Vložit minerál',
    en: 'Input mineral',
  };
  otherUsers_txt: string;
  otherUsersTranslation: TextTranslator = {
    cz: 'Ostatní uživatelé',
    en: 'Other users',
  };
  userSettings_txt: string;
  userSettingsTranslation: TextTranslator = {
    cz: 'Uživatelské nastavení',
    en: 'User settings',
  };
  adminPage_txt: string;
  adminPageTranslation: TextTranslator = {
    cz: 'Administrátorská stránka',
    en: 'Admin page',
  };
  logIn_txt: string;
  logInTranslation: TextTranslator = {
    cz: 'Přihlášení',
    en: 'Log in',
  };
  logOut_txt: string;
  logOutTranslation: TextTranslator = {
    cz: 'Odhlášení',
    en: 'Log out',
  };

  confirmRequestFriendshipModalMessage_txt: string;
  confirmRequestFriendshipModalMessageTranslation: TextTranslator = {
    cz: 'Chcete přijmout přátelství?',
    en: 'Do you want confirm friendship?',
  };
  confirmRequestFriendshipModalTitle_txt: string;
  confirmRequestFriendshipModalTitleTranslation: TextTranslator = {
    cz: 'Přijmout přátelství',
    en: 'Confirm friendship',
  };

  refuseRequestFriendshipModalMessage_txt: string;
  refuseRequestFriendshipModalMessageTranslation: TextTranslator = {
    cz: 'Chcete odmítnout přátelství?',
    en: 'Do you want refuse friendship?',
  };
  refuseRequestFriendshipModalTitle_txt: string;
  refuseRequestFriendshipModalTitleTranslation: TextTranslator = {
    cz: 'Odmítnout přátelství',
    en: 'Refuse friendship',
  };

  constructor(
    public auth: AuthenticationService,
    public routerService: RouterServices,
    public modalService: BsModalService,
    public http: HttpClient,
    public chatService: ChatService,
    public languageService: LanguageService,
  ) {
    this.imgSrc = '../../../assets/skins/back_arrow.png';
    this.imgAlertSrc = '../../../assets/skins/alert_button.png';
    this.img_search = '../../../assets/skins/search_button.png';
    this.img_remove_friendship_request = '../../../assets/skins/remove_button.png';
    this.img_add_friendship_request = '../../../assets/skins/add_friend_button.png';

    this.home_txt = this.languageService.getNativeLanguageText(this.homeTranslation);

    this.userLocalities_txt = this.languageService.getNativeLanguageText(
      this.userLocalitiesTranslation,
    );

    this.locality_txt = this.languageService.getNativeLanguageText(
      this.localityTranslation,
    );

    this.add_txt = this.languageService.getNativeLanguageText(this.addTranslation);
    this.inputLocality_txt = this.languageService.getNativeLanguageText(
      this.inputLocalityTranslation,
    );
    this.inputMineral_txt = this.languageService.getNativeLanguageText(
      this.inputMineralTranslation,
    );

    this.otherUsers_txt = this.languageService.getNativeLanguageText(
      this.otherUsersTranslation,
    );

    this.userSettings_txt = this.languageService.getNativeLanguageText(
      this.userSettingsTranslation,
    );
    this.adminPage_txt = this.languageService.getNativeLanguageText(
      this.adminPageTranslation,
    );

    this.confirmRequestFriendshipModalMessage_txt =
      this.languageService.getNativeLanguageText(
        this.confirmRequestFriendshipModalMessageTranslation,
      );
    this.confirmRequestFriendshipModalTitle_txt =
      this.languageService.getNativeLanguageText(
        this.confirmRequestFriendshipModalTitleTranslation,
      );

    this.refuseRequestFriendshipModalMessage_txt =
      this.languageService.getNativeLanguageText(
        this.refuseRequestFriendshipModalMessageTranslation,
      );
    this.refuseRequestFriendshipModalTitle_txt =
      this.languageService.getNativeLanguageText(
        this.refuseRequestFriendshipModalTitleTranslation,
      );
  }

  public searchUser() {
    this.searched_users_collection = [];
    let formData = new FormData();
    let user_name = this.search_user;
    formData.append('user_name', JSON.stringify(user_name));

    this.http
      .post<any>(environment.urlAddress + '/api/v1/user_input/searchUser', formData)
      .subscribe((returnData: any) => {
        this.fillSearchDropdownItemCollection(returnData.searched_users_collection);
        this.search_user = '';
      });
  }

  public fillSearchDropdownItemCollection(searched_users_collection) {
    this.searched_users_collection = searched_users_collection;
    for (let i = 0; i < this.searched_users_collection.length; i++) {
      if (this.chatService.isAddFriendActive(this.searched_users_collection[i])) {
        this.searched_users_collection[i].button_visibility = true;
      } else {
        this.searched_users_collection[i].button_visibility = false;
      }
    }
  }

  public getAlertDropdownMenuClass() {
    let dropdown_alert_class;
    if (this.navbarOpen) {
      dropdown_alert_class = 'dropdownStyle';
    } else {
      dropdown_alert_class = 'dropdownStyle dropdown-menu-right';
    }
    return dropdown_alert_class;
  }

  public onResize(event) {
    this.navbarOpen = false;
    this.dropdownMenuClass = '';
  }

  public toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  public routeToYourLocalities() {
    let yourId = this.auth.getLogUserId();
    this.auth.saveActualUserId(yourId);
    this.routerService.userLocalities(yourId, 0);
  }

  public getDropdownMenuClass(navbarOpen): string {
    if (navbarOpen) {
      return 'dropdown-menu-left';
    } else {
      return 'dropdown-menu-right';
    }
  }

  public deactiveFriendAlert() {
    if (this.friends.friend_alert) {
      let formData = new FormData();
      formData.append('owner', this.friends.owner);

      this.http
        .post<any>(
          environment.urlAddress + '/api/v1/user_input/deactiveFriendAlert',
          formData,
        )
        .subscribe((data: any) => {
          if (data.friends) {
            this.friends = data.friends;
          }
        });
    }
  }

  public openConfirmModal(frienship_requester, num_in_array) {
    const initialState = {
      list: {
        confirmModalMessage: this.confirmRequestFriendshipModalMessage_txt,
        confirmModalTitle: this.confirmRequestFriendshipModalTitle_txt,
        modalRef: BsModalRef,
      },
    };

    this.modalRef = this.modalService.show(
      ConfirmModalComponent,
      Object.assign({ animated: false }, { class: 'confirmModal' }, { initialState }),
    );
    this.modalRef.content.event.subscribe((res) => {
      this.confirmFriendshipRequest(frienship_requester, num_in_array);
    });
  }

  public confirmFriendshipRequest(frienship_requester, num_in_array) {
    let formData = new FormData();
    formData.append('friend_id', frienship_requester.user_id);
    let logUser = this.auth.getLogUserId();

    this.http
      .post<any>(
        environment.urlAddress +
          '/api/v1/user_input/confirmFriendship/' +
          logUser +
          '/' +
          frienship_requester.user_id,
        formData,
      )
      .subscribe((returnData: any) => {
        if (true == returnData.success_flag) {
          this.friends.frienship_requesters.splice(num_in_array, 1);
          this.triggerConfirmEvent(frienship_requester);
        }
      });
  }

  public triggerConfirmEvent(frienship_requester) {
    this.event.emit({ confirmed_friend: frienship_requester });
  }

  public openRefuseModal(friend_id, num_in_array) {
    const initialState = {
      list: {
        confirmModalMessage: this.refuseRequestFriendshipModalMessage_txt,
        confirmModalTitle: this.refuseRequestFriendshipModalTitle_txt,
        modalRef: BsModalRef,
      },
    };

    this.modalRef = this.modalService.show(
      ConfirmModalComponent,
      Object.assign({ animated: false }, { class: 'confirmModal' }, { initialState }),
    );
    this.modalRef.content.event.subscribe((res) => {
      this.refuseFriendshipRequest(friend_id, num_in_array);
    });
  }

  public refuseFriendshipRequest(friend_id, num_in_array) {
    let formData = new FormData();
    formData.append('friend_id', friend_id);

    this.http
      .post<any>(
        environment.urlAddress + '/api/v1/user_input/refuseFriendshipRequest',
        formData,
      )
      .subscribe((returnData: any) => {
        if (true == returnData.success_flag) {
          this.friends.frienship_requesters.splice(num_in_array, 1);
        }
      });
  }

  public dropdownAddFriendship(user) {
    let formData = new FormData();
    formData.append('friend_id', user.postedBy);
    let logUser = this.auth.getLogUserId();
    this.http
      .post<any>(
        environment.urlAddress +
          '/api/v1/user_input/requestFriendship/' +
          logUser +
          '/' +
          user.postedBy,
        formData,
      )
      .subscribe((data: any) => {
        if (data.success_flag) {
        }
      });
  }

  public dropdownRouteChat(user) {
    let recipient: any = {};
    if (user.postedBy == this.auth.getLogUserId()) {
      recipient = null;
    } else {
      recipient.name = user.name;
      recipient.id = user.postedBy;
    }
    this.routerService.chat(recipient, 0);
  }
}
