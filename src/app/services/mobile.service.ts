import { Injectable } from '@angular/core';
import { SCREEN_SIZE } from './resize.service';

@Injectable()
export class MobileService {
  public getMainFormClass(screen_size: SCREEN_SIZE): string {
    if (SCREEN_SIZE.XS === screen_size) {
      return 'mainFormClass mainFormClass_mobile';
    }
    return 'mainFormClass';
  }
}
