import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable()
export class ImageService {
  suffix: string = '_small';

  getImage(imgName, imgPath): string {
    return environment.serverUrl + '/' + imgPath + imgName + this.suffix;
  }
}
