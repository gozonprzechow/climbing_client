import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ResizeService, SCREEN_SIZE } from './resize.service';

@Injectable()
export class RouterServices {
  screen_size: SCREEN_SIZE;
  constructor(public router: Router, private resizeSvc: ResizeService) {}

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

  public inputMineral(): void {
    let path = '/inputMineral';
    this.router.navigate([path]);
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

  public userLocalities(userId: string, page: number): void {
    let path = '/localities/' + page + '/' + userId;
    this.router.navigate([path]);
  }

  public userLocality(localityName: string, userId: string, page: number): void {
    let path = '/locality/' + localityName + '/' + page + '/' + userId;
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
}
