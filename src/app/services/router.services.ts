import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ResizeService, SCREEN_SIZE } from './resize.service';
import { AuthenticationService } from '../services/authentication.service';
import { MathServices } from '../services/math.service';

@Injectable()
export class RouterServices {
  screen_size: SCREEN_SIZE;
  constructor(
    public router: Router,
    public auth: AuthenticationService,
    private resizeSvc: ResizeService,
    public mathServices: MathServices,
  ) {}

  public notLoginError(): void {
    let path = '/login';
    this.router.navigate([path], {
      state: { data: { errorMessage: 'You are not log in, please log in first' } },
    });
  }

  public login(screen_size: SCREEN_SIZE = SCREEN_SIZE.XL): void {
    let path = '/login';
    this.router.navigate([path], {
      state: {
        data: {
          screen_size: screen_size,
        },
      },
    });
  }

  public inputMineral(locality?: string): void {
    let path = '/inputMineral';
    this.router.navigate([path], {
      state: {
        data: {
          locality: locality,
        },
      },
    });
  }

  public createAccount(screen_size: SCREEN_SIZE = SCREEN_SIZE.XL): void {
    let path = '/createAccount';

    this.router.navigate([path], {
      state: {
        data: {
          screen_size: screen_size,
        },
      },
    });
  }

  public successCreateAccount(message: string): void {
    let path = '/createAccount/success';
    this.router.navigate([path], { state: { data: { message: message } } });
  }

  public userLocalities(
    userId: string,
    page: number,
    country?: string,
    region?: string,
  ): void {
    console.log(country + region);
    let path;
    if (country && region) {
      region = this.mathServices.stringToHex(region);
      country = this.mathServices.stringToHex(country);
      path = '/localities/' + page + '/' + country + '/' + region + '/' + userId;
    } else {
      path = '/localities/' + page + '/' + userId;
    }
    this.auth.saveActualUserId(userId);
    this.router.navigate([path]);
  }

  public userLocality(localityName: string, userId: string, page: number): void {
    this.auth.saveActualUserId(userId);
    localityName = this.mathServices.stringToHex(localityName);
    let path = '/userlocality/' + localityName + '/' + page + '/' + userId;
    this.router.navigate([path]);
  }

  public userLocalityDirectMineral(
    localityName: string,
    userId: string,
    page: number,
    image_id: string,
  ): void {
    localityName = this.mathServices.stringToHex(localityName);
    let path =
      '/userlocality/' + localityName + '/' + page + '/' + userId + '/' + image_id + '/0';

    this.router.navigate([path]);
  }

  public userLocalityDirectSubMineral(
    localityName: string,
    userId: string,
    page: number,
    image_id: string,
    sub_mineral: number,
  ): void {
    localityName = this.mathServices.stringToHex(localityName);
    let path =
      '/userlocality/' +
      localityName +
      '/' +
      page +
      '/' +
      userId +
      '/' +
      image_id +
      '/' +
      sub_mineral;

    this.router.navigate([path]);
  }

  public addSubMineral(achatdbCollection): void {
    let path = '/inputSub-mineral';
    this.router.navigate([path], {
      state: {
        data: {
          achatdbCollection: achatdbCollection,
        },
      },
    });
  }

  public modifyLocality(locality): void {
    let path = '/modifyLocality';
    this.router.navigate([path], {
      state: {
        data: {
          locality: locality,
          previousRoute: this.router.url,
        },
      },
    });
  }

  public modifySubMineral(achatdbCollection, actualSlide: number): void {
    let path = '/modifySub-mineral';
    this.router.navigate([path], {
      state: {
        data: {
          achatdbCollection: achatdbCollection,
          actualSlide: actualSlide,
          previousRoute: this.router.url,
        },
      },
    });
  }

  public modifyMineral(achatdbCollection): void {
    let path = '/modifyMineral';
    this.router.navigate([path], {
      state: {
        data: {
          achatdbCollection: achatdbCollection,
          previousRoute: this.router.url,
        },
      },
    });
  }

  public inputLocality(): void {
    let path = '/inputLocality';
    this.router.navigate([path]);
  }

  public adminHlavni(): void {
    let path = '/adminHlavni';
    this.router.navigate([path]);
  }

  public returnToPreviousPage(previousRoute): void {
    this.router.navigate([previousRoute]);
  }

  public otherUsers(page: number): void {
    let path = '/otherUsers/' + page;
    this.router.navigate([path]);
  }

  public userSettings(): void {
    let path = '/userSettings';
    this.router.navigate([path]);
  }

  public recoverPassword(): void {
    let path = '/recoverPassword';
    this.router.navigate([path]);
  }

  public chat(recipient: any, page: number, type: number = 0): void {
    let path;
    if (null == recipient) {
      path = '/chat/' + page + '/' + type;
    } else {
      recipient.name = this.mathServices.stringToHex(recipient.name);
      path = '/chat/' + page + '/' + recipient.id + '/' + recipient.name + '/' + type;
    }
    this.router.navigate([path], {
      state: {
        data: {
          previousRoute: this.router.url,
        },
      },
    });
  }

  public home(): void {
    window.location.href = 'https://sutrak.net';
  }

  public userMap(userId: string, country?: string): void {
    if (!country) {
      country = 'world';
    }
    country = this.mathServices.stringToHex(country);
    let path = '/userMap/' + userId + '/' + country;
    this.router.navigate([path]);
  }
}
