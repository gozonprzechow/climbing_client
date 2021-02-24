import { Injectable } from '@angular/core';

export interface ButtonCollection {
  activeButton: boolean;
  buttonNumber: number;
}

export interface PagingButtonsRef {
  numberOfPages: number;
}

@Injectable()
export class PagingButtonsServices {
  buttonCollections: Array<ButtonCollection> = [];
  startPage: number;
  endPage: number;
  numOfPages: number = 0;
  actualPage: number = 0;

  constructor() { }

  public setNumOfPage(numOfPages: number): void {
    this.numOfPages = numOfPages;
  }

  public setActualPage(actualPage: any): void {
    if (!actualPage) {
      this.actualPage = 0;
    }
    else {
      this.actualPage = Number(actualPage);
    }
  }

  public setActualPageOnDeleteItem(actualPage: any, numOfItem: number): void {
    if (!actualPage) {
      this.actualPage = 0;
    }
    else {
      this.actualPage = Number(actualPage);
    }

    if ((0 == ((this.numOfPages - 1) - this.actualPage)) && (1 == numOfItem)
      && (0 != this.actualPage)) {
      this.actualPage--;
    }
  }

  public getActualPage(): number {
    return this.actualPage;
  }

  public ifAnyMorePage(): boolean {
    if (1 < this.numOfPages) {
      return true;
    }
    return false;
  }

  public createButtonsField(): ButtonCollection[] {
    if (1 < this.numOfPages) {
      this.buttonCollections = [];
      if (this.numOfPages < this.actualPage) {
        this.actualPage = this.numOfPages - 1;
      } else if (!this.actualPage) {
        this.actualPage = 0;
      } else if (0 > this.actualPage) {
        this.actualPage = 0;
      }
      this.countStardEndBtnField();
      this.setButtonField();
      this.setActiveButton();
    } else {
      this.buttonCollections = null;
    }

    return this.buttonCollections;
  }

  private countStardEndBtnField(): void {
    if (this.numOfPages < 5) {
      this.startPage = 0;
      this.endPage = this.numOfPages;
    } else if (this.ifOnTheEnd()) {
      this.startPage = this.numOfPages - 5;
      this.endPage = this.numOfPages;
    } else if (3 > this.actualPage) {
      this.startPage = 0;
      this.endPage = 5;
    } else {
      this.startPage = this.actualPage - 2;
      this.endPage = this.actualPage + 3;
    }
  }

  private setButtonField(): void {
    this.buttonCollections = [];
    for (let i = this.startPage; i < this.endPage; i++) {
      let buttonCollection: ButtonCollection = {
        activeButton: false,
        buttonNumber: i
      };
      this.buttonCollections.push(buttonCollection);
    }
  }

  private setActiveButton(): void {
    if (5 > this.numOfPages) {
      this.buttonCollections[this.actualPage].activeButton = true;
    } else if (3 > this.actualPage) {
      this.buttonCollections[this.actualPage].activeButton = true;
    } else if (this.ifOnTheEnd()) {
      this.buttonCollections[5 - (this.numOfPages - this.actualPage)].activeButton = true;
    } else {
      this.buttonCollections[2].activeButton = true;
    }
  }

  private ifOnTheEnd(): boolean {
    if (this.actualPage >= this.numOfPages - 3) {
      return true;
    }
    return false;
  }
}