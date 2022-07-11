import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable()
export class ImageService {
  suffix: string = '_small';

  getImage(imgName, imgPath): string {
    return environment.serverUrl + '/' + imgPath + imgName + this.suffix;
  }

  getStandardImage(imgName, imgPath): string {
    return environment.serverUrl + '/' + imgPath + imgName;
  }
  isImgThere(imgName, imgPath): Boolean {
    if (imgName == '' || imgName == 'undefined') {
      return false;
    }
    if (imgPath == '' || imgPath == 'undefined') {
      return false;
    }
    return true;
  }
}
