import { Injectable } from '@angular/core';

export enum Status {
  kStandard,
  kPrice,
  kAuction,
}

@Injectable()
export class OfferService {
  isStandard(status: Number): Boolean {
    if (Status.kStandard == status) {
      return true;
    }
    return false;
  }

  isPrice(status: Number): Boolean {
    if (Status.kPrice == status) {
      return true;
    }
    return false;
  }

  isAuction(status: Number): Boolean {
    if (Status.kAuction == status) {
      return true;
    }
    return false;
  }
}
