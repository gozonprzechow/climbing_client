import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class RouterServices {
  constructor(public router: Router) {}

  public notLoginError(): void {
    let path = '/login';
    this.router.navigate([path], {
      state: { data: { errorMessage: 'You are not log in, please log in first' } },
    });
  }

  public login(): void {
    let path = '/login';
    this.router.navigate([path]);
  }

  public inputMineral(): void {
    let path = '/inputMineral';
    this.router.navigate([path]);
  }

  public createAccount(): void {
    let path = '/createAccount';
    this.router.navigate([path]);
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
