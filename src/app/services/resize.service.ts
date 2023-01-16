import { Injectable } from '@angular/core';

export enum SCREEN_SIZE {
  XS,
  SM,
  MD,
  LG,
  XL,
}

class MAX_PICTURE_SIZE {
  public static readonly XS: number = 192;
  public static readonly SM: number = 204;
  public static readonly MD: number = 210;
  public static readonly LG: number = 220;
  public static readonly XL: number = 220;
}

@Injectable()
export class ResizeService {
  private screen_size: SCREEN_SIZE = SCREEN_SIZE.XS;
  private picture_size: number = MAX_PICTURE_SIZE.XS;
  private max_picture_size: number = MAX_PICTURE_SIZE.XS;
  private picture_margin_size: number = 5;
  private picture_on_page: number = 0;

  private page_margin_right: number = 0;
  private window_size: number = 400;

  getScreenSize(): SCREEN_SIZE {
    return this.screen_size;
  }

  getPictureWidth(): number {
    return this.picture_size;
  }

  getPictureHeight(): number {
    return this.picture_size * (180 / 220);
  }

  getPageWidth(): number {
    return this.window_size - this.page_margin_right;
  }

  getPictureMarginSize(): number {
    return this.picture_margin_size;
  }

  getPictureOnPage(): number {
    return this.picture_on_page;
  }

  getPageMarginRight(): number {
    return this.page_margin_right;
  }

  public refreshScreenSize(window_size: number) {
    this.window_size = window_size;
    if (576 > window_size) {
      this.screen_size = SCREEN_SIZE.XS;
      this.max_picture_size = MAX_PICTURE_SIZE.XS;
      this.page_margin_right = 0;
      this.picture_margin_size = 5;
    } else if (576 <= window_size && 768 > window_size) {
      this.screen_size = SCREEN_SIZE.SM;
      this.max_picture_size = MAX_PICTURE_SIZE.SM;
      this.page_margin_right = 0;
      this.picture_margin_size = 8;
    } else if (768 <= window_size && 992 > window_size) {
      this.screen_size = SCREEN_SIZE.MD;
      this.max_picture_size = MAX_PICTURE_SIZE.MD;
      this.page_margin_right = 0;
      this.picture_margin_size = 10;
    } else if (992 <= window_size && 1200 > window_size) {
      this.screen_size = SCREEN_SIZE.LG;
      this.max_picture_size = MAX_PICTURE_SIZE.LG;
      this.page_margin_right = 180;
      this.picture_margin_size = 10;
    } else {
      this.screen_size = SCREEN_SIZE.XL;
      this.max_picture_size = MAX_PICTURE_SIZE.XL;
      this.page_margin_right = 180;
      this.picture_margin_size = 10;
    }
    return this.screen_size;
  }

  public countImageWidth() {
    this.picture_size = this.max_picture_size;
    for (let i = 3; i < 100; i++) {
      this.picture_size =
        (this.window_size - this.page_margin_right) / i -
        this.picture_margin_size * ((i - 1) / i);

      this.picture_on_page = Math.round(
        (this.window_size - this.page_margin_right + this.picture_margin_size) /
          (this.picture_size + this.picture_margin_size),
      );

      if (this.picture_size <= this.max_picture_size) {
        break;
      }
    }
  }

  public getFirstImageOffset(
    image_count: number,
    image_order: number,
    is_left_bar: boolean = true,
  ): number {
    let image_offset: number;
    let local_window_size: number;
    if (is_left_bar) {
      local_window_size = this.window_size - this.page_margin_right;
    } else {
      local_window_size = this.window_size;
    }
    image_offset =
      (local_window_size -
        (this.picture_size * image_count +
          image_count * this.picture_margin_size -
          this.picture_margin_size)) /
      2;
    image_offset =
      image_offset + image_order * (this.picture_size + this.picture_margin_size);
    return image_offset;
  }

  public getImageOffsetOnSize(
    image_count: number,
    image_order: number,
    image_size: number,
  ): number {
    let image_offset: number;
    image_offset =
      (this.window_size -
        this.page_margin_right -
        (image_size * image_count +
          image_count * this.picture_margin_size -
          this.picture_margin_size)) /
      2;
    image_offset = image_offset + image_order * (image_size + this.picture_margin_size);
    return image_offset;
  }

  public getEndLinerWidth(image_count: number): number {
    let end_liner_width: number;
    end_liner_width =
      this.picture_size * image_count + this.picture_margin_size * (image_count - 1);
    return end_liner_width;
  }
}
