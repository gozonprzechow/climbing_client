import { Component, Input, HostListener } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Globals } from '../../services/globals.services';
import { RouterServices } from '../../services/router.services';

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
  imgSrc: String;

  constructor(
    public auth: AuthenticationService,
    public routerService: RouterServices,
    public globals: Globals) {
      this.imgSrc = '../../../assets/skins/settings_button.png';
  }

  public onResize(event){
    this.navbarOpen = false;
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

}
