import { Component, Input, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { RouterServices } from '../../services/router.services';
import { LanguageService, TextTranslator } from '../../services/language.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmModalComponent } from '../../models/confirm-modal/confirm-modal.component';
import { ResizeService, SCREEN_SIZE } from '../../services/resize.service';

@Component({
  selector: 'app-main-navbar-menu',
  templateUrl: './main-navbar-menu.component.html',
  styleUrls: ['./main-navbar-menu.component.css'],
  host: {
    '(window:resize)': 'onResize($event)',
  },
})
export class MainNavbarMenuComponent implements OnInit {
  @Input() allLocality: any = [];
  @Input() activePage: any = {};
  navbarOpen = false;
  showAddComment: boolean = false;
  alerts: any = {};
  show_add_friend_option: boolean = false;
  imgAddSrc: String;
  imgChatSrc: String;
  imgMapSrc: String;
  imgSrc: String;
  dropdownMenuClass: String = '';
  modalRef: BsModalRef;
  screen_size: SCREEN_SIZE;

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
    cz: 'Vložit cestu',
    en: 'Input route',
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
  register_txt: string;
  registerTranslation: TextTranslator = {
    cz: 'Registrace',
    en: 'Register',
  };

  requestFriendshipModalMessage_txt: string;
  requestFriendshipModalMessageTranslation: TextTranslator = {
    cz: 'Chcete poslat žádost o přátelství?',
    en: 'Do you want send friendship request?',
  };
  requestFriendshipModalTitle_txt: string;
  requestFriendshipModalTitleTranslation: TextTranslator = {
    cz: 'Žádost o přátelství',
    en: 'Friendship request',
  };

  constructor(
    public auth: AuthenticationService,
    public routerService: RouterServices,
    public modalService: BsModalService,
    public http: HttpClient,
    public languageService: LanguageService,
    private resizeSvc: ResizeService,
  ) {
    this.alerts.message_alert = false;
    this.alerts.price_alert = false;
    this.imgSrc = '../../../assets/skins/settings_button.png';
    this.imgChatSrc = '../../../assets/skins/message_button.png';
    this.imgAddSrc = '../../../assets/skins/add_friend_button.png';
    this.imgMapSrc = '../../../assets/skins/globus_button.png';

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

    this.logIn_txt = this.languageService.getNativeLanguageText(this.logInTranslation);
    this.logOut_txt = this.languageService.getNativeLanguageText(this.logOutTranslation);
    this.register_txt = this.languageService.getNativeLanguageText(
      this.registerTranslation,
    );

    this.requestFriendshipModalMessage_txt = this.languageService.getNativeLanguageText(
      this.requestFriendshipModalMessageTranslation,
    );

    this.requestFriendshipModalTitle_txt = this.languageService.getNativeLanguageText(
      this.requestFriendshipModalTitleTranslation,
    );
  }

  ngOnInit() {
    this.activePage.homePage = 'nav-link';
    this.activePage.userLocality = 'nav-link';
    this.activePage.add = 'nav-link dropdown-toggle';
    this.activePage.loaclity = 'nav-link dropdown-toggle';
    this.activePage.otherUsers = 'nav-link';

    if (this.auth.isLoggedIn()) {
      let formData = new FormData();
      formData.append('actual_user_id', this.auth.getActualUserId());
      this.http
        .post<any>(environment.urlAddress + '/api/v1/user_input/mainNavbarMenu', formData)
        .subscribe((returnData: any) => {
          this.show_add_friend_option = returnData.show_add_friend_option;
          this.alerts = returnData.alerts;
        });
    }
  }

  public onResize(event) {
    this.navbarOpen = false;
    this.dropdownMenuClass = '';
  }

  public toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  public routeToHome() {
    this.routerService.home();
  }

  public routeToMyHome() {
    let your_id = this.auth.getLogUserId();
    this.auth.saveActualUserId(your_id);
    this.routerService.userLocalities(your_id, 0);
  }

  public routeToOtherUsers() {
    this.routerService.otherUsers(0);
  }

  public routeToUserLocalities(area?: string, sector_count?: number) {
    let userId = this.auth.getActualUserId();
    if (area) {
      this.routerService.userLocalities(userId, 0, area, sector_count);
    } else {
      this.routerService.userLocalities(userId, 0, null);
    }
  }

  public routeToUserMap() {
    let userId = this.auth.getActualUserId();
    this.routerService.userMap(userId);
  }

  public routeToUserLocality(localityName) {
    let userId = this.auth.getActualUserId();
    this.routerService.userLocality(localityName, 'none', userId, 0);
  }

  public logOutHandler() {
    this.auth.logout();
    this.routerService.login(this.screen_size);
  }

  public logInHandler() {
    this.routerService.login(this.screen_size);
  }

  public registerHandler() {
    this.routerService.createAccount(this.screen_size);
  }

  public ifDisplayAdd(): boolean {
    if (!this.auth.isLoggedIn()) {
      return false;
    }

    if (this.auth.getActualUserId() != this.auth.getLogUserId()) {
      return false;
    }
    return true;
  }

  public ifDisplayHome(): boolean {
    if (this.auth.isLoggedIn()) {
      return false;
    }

    // if (this.auth.getActualUserId() == this.auth.getLogUserId()) {
    //   return false;
    // }

    return true;
  }

  public ifDisplayMyHome(): boolean {
    if (!this.auth.isLoggedIn()) {
      return false;
    }

    if (this.auth.getLogUserId() != this.auth.getActualUserId()) {
      return true;
    }

    // if (this.auth.getActualUserId() == this.auth.getLogUserId()) {
    //   return false;
    // }

    return false;
  }

  public ifDisplayLocality(): boolean {
    if (null == this.auth.getActualUserId() || 'null' == this.auth.getActualUserId()) {
      if (!this.auth.isLoggedIn()) {
        return false;
      }
    }
    return true;
  }

  public ifDisplayMap(): boolean {
    if (!this.auth.isLoggedIn()) {
      return false;
    }
    return true;
  }

  public ifDisplayMapFirstIcon(): boolean {
    if (this.auth.isLoggedIn()) {
      return false;
    }
    if (null == this.auth.getActualUserId() || 'null' == this.auth.getActualUserId()) {
      return false;
    }
    return true;
  }

  public ifDisplayLocalities(): boolean {
    if (null == this.auth.getActualUserId() || 'null' == this.auth.getActualUserId()) {
      if (!this.auth.isLoggedIn()) {
        return false;
      }
    }
    return true;
  }

  public ifDisplayAddFriend(): boolean {
    if (this.auth.getActualUserId() == this.auth.getLogUserId()) {
      return false;
    }
    if (this.auth.isLoggedIn() && this.show_add_friend_option) {
      return true;
    }
    return false;
  }

  public openAddFriendshipModal() {
    const initialState = {
      list: {
        confirmModalMessage: this.requestFriendshipModalMessage_txt,
        confirmModalTitle: this.requestFriendshipModalTitle_txt,
        modalRef: BsModalRef,
      },
    };

    this.modalRef = this.modalService.show(
      ConfirmModalComponent,
      Object.assign({ animated: false }, { class: 'confirmModal' }, { initialState }),
    );
    this.modalRef.content.event.subscribe((res) => {
      this.addFriendship();
    });
  }

  public addFriendship() {
    let requested_user_id = this.auth.getActualUserId();
    let formData = new FormData();
    formData.append('friend_id', requested_user_id);
    let logUser = this.auth.getLogUserId();
    // console.log(requested_user_id);
    this.http
      .post<any>(
        environment.urlAddress +
          '/api/v1/user_input/requestFriendship/' +
          logUser +
          '/' +
          requested_user_id,
        formData,
      )
      .subscribe((data: any) => {
        if (data.success_flag) {
          this.show_add_friend_option = false;
        }
      });
  }

  public getDropdownMenuClass(navbarOpen): string {
    if (navbarOpen) {
      return 'dropdown-menu-left';
    } else {
      return 'dropdown-menu-right';
    }
  }
}
