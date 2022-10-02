import { Component, Input } from '@angular/core';
import { ResizeService, SCREEN_SIZE } from '../services/resize.service';

@Component({
  selector: 'custom-tittle-main',
  template: `<div></div>
    <app-size-detector class="hide_element"></app-size-detector>
    <div class="jumbotron bg-secondary">
      <div class="container bg-secondary">
        <div class="mainJumbotron">
          <h1 class="{{ getInputComentColumn() }}">{{ tittleMain }}</h1>
        </div>
      </div>
    </div>`,
  styleUrls: ['./customTittle.css'],
})
export class TittleMain {
  @Input() tittleMain: any = {};
  screen_size: SCREEN_SIZE;

  constructor(private resizeSvc: ResizeService) {
    this.resizeSvc.onResize$.subscribe((x) => {
      this.screen_size = x;
    });
  }

  public getInputComentColumn(): string {
    if (0 === this.screen_size) {
      return 'display-5 customTittle customTittle_mobile';
    }
    return 'display-3 customTittle';
  }
}
