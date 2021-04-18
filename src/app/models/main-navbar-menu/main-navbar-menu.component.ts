import { Component, Input, HostListener } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { RouterServices } from '../../services/router.services';
import { LanguageService, TextTranslator } from '../../services/language.service';

@Component({
  selector: 'app-main-navbar-menu',
  templateUrl: './main-navbar-menu.component.html',
  styleUrls: ['./main-navbar-menu.component.css'],
  host: {
    '(window:resize)': 'onResize($event)'
  }
})
export class MainNavbarMenuComponent {
  @Input() allLocality: any = [];
  @Input() activePage: any = {};
  navbarOpen = false;
  imgChatSrc: String;
  imgSrc: String;
  dropdownMenuClass: String = "";

  home_txt: string;
  homeTranslation: TextTranslator = {
    cz: "Domů",
    en: "Home"
  };
  userLocalities_txt: string;
  userLocalitiesTranslation: TextTranslator = {
    cz: "Lokality uživatele",
    en: "User localities"
  };
  locality_txt: string;
  localityTranslation: TextTranslator = {
    cz: "Lokality",
    en: "Locality"
  };
  add_txt: string;
  addTranslation: TextTranslator = {
    cz: "Přidat",
    en: "Add"
  };
  inputLocality_txt: string;
  inputLocalityTranslation: TextTranslator = {
    cz: "Vložit lokalitu",
    en: "Input locality"
  };
  inputMineral_txt: string;
  inputMineralTranslation: TextTranslator = {
    cz: "Vložit minerál",
    en: "Input mineral"
  };
  otherUsers_txt: string;
  otherUsersTranslation: TextTranslator = {
    cz: "Ostatní uživatelé",
    en: "Other users"
  };
  userSettings_txt: string;
  userSettingsTranslation: TextTranslator = {
    cz: "Uživatelské nastavení",
    en: "User settings"
  };
  adminPage_txt: string;
  adminPageTranslation: TextTranslator = {
    cz: "Administrátorská stránka",
    en: "Admin page"
  };
  logIn_txt: string;
  logInTranslation: TextTranslator = {
    cz: "Přihlášení",
    en: "Log in"
  };
  logOut_txt: string;
  logOutTranslation: TextTranslator = {
    cz: "Odhlášení",
    en: "Log out"
  };

  constructor(
    public auth: AuthenticationService,
    public routerService: RouterServices,
    public languageService: LanguageService) {
    this.imgSrc = '../../../assets/skins/settings_button.png';
    this.imgChatSrc = '../../../assets/skins/message_button.png';

    this.home_txt = this.languageService.getNativeLanguageText(this.homeTranslation);

    this.userLocalities_txt = this.languageService.getNativeLanguageText(this.userLocalitiesTranslation);

    this.locality_txt = this.languageService.getNativeLanguageText(this.localityTranslation);

    this.add_txt = this.languageService.getNativeLanguageText(this.addTranslation);
    this.inputLocality_txt = this.languageService.getNativeLanguageText(this.inputLocalityTranslation);
    this.inputMineral_txt = this.languageService.getNativeLanguageText(this.inputMineralTranslation);

    this.otherUsers_txt = this.languageService.getNativeLanguageText(this.otherUsersTranslation);

    this.userSettings_txt = this.languageService.getNativeLanguageText(this.userSettingsTranslation);
    this.adminPage_txt = this.languageService.getNativeLanguageText(this.adminPageTranslation);

    this.logIn_txt = this.languageService.getNativeLanguageText(this.logInTranslation);
    this.logOut_txt = this.languageService.getNativeLanguageText(this.logOutTranslation);
  }

  public onResize(event) {
    this.navbarOpen = false;
    this.dropdownMenuClass = "";
  }

  public toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  public routeToYourLocalities() {
    let yourId = this.auth.getLogUserId();
    this.auth.saveActualUserId(yourId);
    this.routerService.userLocalities(yourId, 0);
  }

  public routeToOtherUsers() {
    this.routerService.otherUsers(0);
  }

  public routeToUserLocalities() {
    let userId = this.auth.getActualUserId();
    this.routerService.userLocalities(userId, 0);
  }

  public routeToUserLocality(localityName) {
    let userId = this.auth.getActualUserId();
    this.routerService.userLocality(localityName, userId, 0);
  }

  public logOutHandler() {
    this.auth.logout();
    this.routerService.login();
  }

  public logInHandler() {
    this.routerService.login();
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
    if (!this.auth.isLoggedIn()) {
      return false;
    }

    if (this.auth.getActualUserId() == this.auth.getLogUserId()) {
      return false;
    }

    return true;
  }

  public ifDisplayLocality(): boolean {
    if ((null == this.auth.getActualUserId()) ||
      ("null" == this.auth.getActualUserId())) {
      if (!this.auth.isLoggedIn()) {
        return false;
      }
    }
    return true;
  }

  public ifDisplayLocalities(): boolean {
    if ((null == this.auth.getActualUserId()) ||
      ("null" == this.auth.getActualUserId())) {
      if (!this.auth.isLoggedIn()) {
        return false;
      }
    }
    return true;
  }

  public getDropdownMenuClass(navbarOpen): string {
    if (navbarOpen) {
      return "dropdown-menu-left";
    } else {
      return "dropdown-menu-right";
    }
  }

}
