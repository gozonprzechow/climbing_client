import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
// import { tap } from 'rxjs/operators';

export interface UserDetails {
  _id: string;
  email: string;
  name: string;
  exp: number;
  adminHlavni: boolean;
  iat: number;
}

interface TokenResponse {
  token: string;
}

export interface TokenPayload {
  email: string;
  password: string;
  name?: string;
}

@Injectable()
export class AuthenticationService {
  public actualUserId: string;
  public token: string;

  constructor(public http: HttpClient, public router: Router) { }

  public saveActualUserId(actualUserId: string): void {
    localStorage.setItem('actual-user-id', actualUserId);
    this.actualUserId = actualUserId;
  }

  public isItemYours(userId) {
    if ((userId == this.getLogUserId()) && (this.isLoggedIn())) {
      return true;
    }
    return false;
  }

  public getActualUserId(): string {
    this.actualUserId = localStorage.getItem('actual-user-id');
    return this.actualUserId;
  }

  public saveToken(token: string): void {
    localStorage.setItem('mean-token', token);
    this.token = token;
  }

  public getToken(): string {
    if (!this.token) {
      this.token = localStorage.getItem('mean-token');
    }
    return this.token;
  }

  public getUserDetails(): UserDetails {
    const token = this.getToken();
    let payload;
    if (token) {
      payload = token.split('.')[1];
      payload = window.atob(payload);
      return JSON.parse(payload);
    } else {
      return null;
    }
  }

  public isLoggedIn(): boolean {
    const user = this.getUserDetails();
    if (user) {
      return user.exp > Date.now() / 1000;
    } else {
      return false;
    }
    return true;
  }

  public getLogUserId(): any {
    let postedBy;

    if (this.getUserDetails() == null) {
      postedBy = "null";
    }
    else {
      postedBy = this.getUserDetails()._id;
    }

    return postedBy;
  }

  public isIdLogUser(id) {
    if (id === this.getLogUserId()) {
      return true;
    }
    return false;
  }

  public isUserAdmin(): any {
    let isUserAdmin;

    if (this.getUserDetails() == null) {
      isUserAdmin = false;
    }
    else {
      isUserAdmin = this.getUserDetails().adminHlavni;
    }
    return isUserAdmin;
  }

  public request(method: 'post' | 'get', type: 'login' | 'account' | 'profile', user?: TokenPayload): Observable<any> {
    let base;

    if (method === 'post') {
      base = this.http.post(`${environment.urlAddress}/api/v1/user_input/${type}`, user);
    } else {
      base = this.http.get(`${environment.urlAddress}/api/v1/user_input/${type}`, { headers: { Authorization: `Bearer ${this.getToken()}` } });
    }

    const request = base.pipe(
      tap((data: TokenResponse) => {
        if (data.token) {
          this.saveToken(data.token);
        }
        return data;
      })
    );

    return request;
  }

  public register(user: TokenPayload): Observable<any> {
    return this.request('post', 'account', user);
  }

  public login(user: TokenPayload): Observable<any> {
    return this.request('post', 'login', user);
  }

  public profile(): Observable<any> {
    return this.request('get', 'profile');
  }

  public logout(): void {
    this.token = '';
    window.localStorage.removeItem('mean-token');
    this.router.navigateByUrl('/');
  }
}