import { Component } from '@angular/core';

import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router, NavigationStart } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'angular-node-express';

  private unsubscriber: Subject<void> = new Subject<void>();
  private custom_history: Array<string> = [];
  private local_event: string = '';
  private last_url: string = '';

  constructor(private location: Location, private router: Router) {
    // history.pushState(null, '');

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (25 < this.custom_history.length) {
          this.custom_history.shift();
        }
        this.local_event = event.navigationTrigger;
        if ('popstate' != this.local_event && '/' != event.url && '/' != this.last_url) {
          this.custom_history.push(event.url);
        }
        this.last_url = event.url;
        if ('popstate' === this.local_event) {
          if (0 < this.custom_history.length) {
            let pop_history = this.custom_history.pop();
            // this.location.go(pop_history);
            // this.router.navigate([pop_history]);
          } else {
            // this.location.go('/');
            // this.router.navigate(['/']);
          }
        }
      }
    });
  }

  ngOnInit(): void {
    // history.pushState(null, '');

    fromEvent(window, 'popstate')
      .pipe(takeUntil(this.unsubscriber))
      .subscribe((_) => {
        // history.pushState(null, '');
        this.reloadCurrentRoute();
      });
  }

  ngOnDestroy(): void {
    this.unsubscriber.next();
    this.unsubscriber.complete();
  }

  reloadCurrentRoute() {
    // if (0 < this.custom_history.length) {
    //   this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
    //     history.pushState(null, '');
    //     if (0 < this.custom_history.length) {
    //       let pop_history = this.custom_history.pop();
    //       this.router.navigate([pop_history]);
    //     }
    //   });
    // }
  }
}
