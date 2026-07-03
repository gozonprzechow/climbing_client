import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ResizeService, SCREEN_SIZE } from '../services/resize.service';
import { delay } from 'rxjs/operators';

@Component({
    selector: 'custom-tittle-main',
    template: `<div></div>
    <div class="jumbotron bg-secondary">
      <div class="container bg-secondary">
        <div class="mainJumbotron">
          <h1
            class="{{ getInputComentColumn() }}"
            [ngStyle]="{
              'margin-right': margin_right + 'px'
            }"
          >
            {{ tittleMain }}
          </h1>
        </div>
      </div>
    </div>`,
    styleUrls: ['./customTittle.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class TittleMain {
  @Input() tittleMain: any = {};
  @Input() screen_size: SCREEN_SIZE;
  @Input() margin_right: number = 0;

  constructor(private resizeSvc: ResizeService) {}

  public getInputComentColumn(): string {
    if (0 === this.screen_size) {
      return 'display-5 customTittle customTittle_mobile';
    }
    return 'display-3 customTittle';
  }
}
