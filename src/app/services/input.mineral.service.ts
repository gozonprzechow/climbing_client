import { Injectable } from '@angular/core';

export interface ImageInfo {
  file: File;
  image_url: string;
  is_front_image: boolean;
  is_uploaded: boolean;
  is_upload_pass: boolean;
}

@Injectable()
export class InputMineralService {
  images_info: Array<ImageInfo> = [];

  constructor() {}

  public getImagesInfo(): ImageInfo[] {
    return this.images_info;
  }

  public getImageBorderSize(image_position: number): string {
    if (this.images_info.length < image_position) {
      return '0px';
    }
    if (this.images_info[image_position].is_front_image) {
      return '6px';
    }
    return '0px';
  }

  public getImageBorderColour(image_position: number): string {
    if (this.images_info.length < image_position) {
      return '';
    }
    if (this.images_info[image_position].is_front_image) {
      return 'rgb(255,215,0)';
    }
    return '';
  }

  public getImageCursor(is_submit_in_progress: boolean): string {
    if (is_submit_in_progress) {
      return 'default';
    }
    return 'pointer';
  }

  public getImageOpacity(is_submit_in_progress: boolean): string {
    if (is_submit_in_progress) {
      return '0.5';
    }
    return '1';
  }

  public ifShowRemoveImgBtn(image_position: number, is_frozen: boolean): boolean {
    if (!is_frozen && !this.images_info[image_position].is_uploaded) {
      return true;
    }
    return false;
  }

  public ifShowSuccessImgUploadBtn(image_position: number): boolean {
    if (
      this.images_info[image_position].is_upload_pass &&
      this.images_info[image_position].is_uploaded
    ) {
      return true;
    }
    return false;
  }

  public ifShowFailImgUploadBtn(image_position: number): boolean {
    if (
      !this.images_info[image_position].is_upload_pass &&
      this.images_info[image_position].is_uploaded
    ) {
      return true;
    }
    return false;
  }

  public addImage(
    image_position: number,
    image_url: string,
    is_front_image: boolean,
    file: File,
  ) {
    let image_info: ImageInfo = {
      file: file,
      image_url: image_url,
      is_front_image: is_front_image,
      is_uploaded: false,
      is_upload_pass: false,
    };
    this.images_info[image_position] = image_info;
  }

  public clearImageInfo() {
    this.images_info.length = 0;
  }

  public removeImage(delete_image_position: number) {
    let images_info_old: Array<ImageInfo> = [...this.images_info];
    this.images_info.length = 0;
    for (let i = 0; i < images_info_old.length; i++) {
      if (i !== delete_image_position) {
        this.images_info.push(images_info_old[i]);
      }
    }

    if (
      images_info_old[delete_image_position].is_front_image &&
      0 < this.images_info.length
    ) {
      this.images_info[0].is_front_image = true;
    }
  }

  public setImageUpload(image_position: number) {
    if (this.images_info.length > image_position) {
      this.images_info[image_position].is_uploaded = true;
    }
  }

  public setUploadResult(image_position: number, is_pass: boolean) {
    if (this.images_info.length > image_position) {
      this.images_info[image_position].is_upload_pass = is_pass;
    }
  }

  public setNewFrontImage(image_position: number) {
    for (let i = 0; i < this.images_info.length; i++) {
      if (image_position === i) {
        this.images_info[i].is_front_image = true;
      } else {
        this.images_info[i].is_front_image = false;
      }
    }
  }
}
