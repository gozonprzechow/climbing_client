import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { AuthenticationService } from './authentication.service';
import { throwError, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(public auth: AuthenticationService) { }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token = this.auth.getToken();
    if (token) {
      let cloneRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      // return next.handle(cloneRequest);
      return next.handle(cloneRequest).pipe(
        tap(evt => {
          // modify here
        }),
        catchError((error: any) => {
          // console.log("sem tu");
          if (error && error.status) {
            if (error.status == 401) {
              // this.router.navigate(['/']);
            }
          } else {
            return throwError(error);
          }
        })
      );
    } else {
      return next.handle(request);
    }
  }
}