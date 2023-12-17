import { Injectable } from '@angular/core';

export interface Difficulty {
  scale: string;
  original: string;
  style: string;
  point: number;
}

export interface DifficultyConversion {
  uiaa: string;
  sasko: string;
  fra: string;
  usa: string;
  success: boolean;
}

@Injectable()
export class ClimbingDifficultyService {
  readonly uiaa: string[] = [
    '1',
    '2',
    '2+',
    '3',
    '4',
    '4+/5-',
    '5',
    '5+',
    '6-',
    '6',
    '6+',
    '7-',
    '7',
    '7+',
    '7+/8-',
    '8-',
    '8-/8',
    '8',
    '8+',
    '8+/9-',
    '9-',
    '9',
    '9+',
    '9+/10-',
    '10-',
    '10',
    '10+',
    '10+/11-',
    '11-',
    '11',
    '11+',
    '11+/12-',
    '12-',
    '12',
  ];

  readonly sasko: string[] = [
    'I',
    'II',
    'II',
    'III',
    'IV',
    'V',
    'VI',
    'VI',
    'VIIa',
    'VIIb',
    'VIIc',
    'VIIc',
    'VIIIa',
    'VIIIb',
    'VIIIc',
    'IXa',
    'IXa',
    'IXb',
    'IXc',
    'IXc',
    'Xa',
    'Xb',
    'Xc',
    'Xc',
    'XIa',
    'XIb',
    'XIc',
    'XIc',
    'XIIa',
    'XIIb',
    'XIIc',
    'XIIc',
    'XIIIa',
    'XIIIb',
  ];

  readonly fra: string[] = [
    '1',
    '2',
    '2',
    '3',
    '4a',
    '4b',
    '4c',
    '5a',
    '5b',
    '5c',
    '6a',
    '6a+',
    '6b',
    '6b+',
    '6c',
    '6c+',
    '6c+',
    '7a',
    '7a+',
    '7b',
    '7b+',
    '7c',
    '7c+',
    '8a',
    '8a+',
    '8b',
    '8b+',
    '8c',
    '8c+',
    '9a',
    '9a+',
    '9b',
    '9b+',
    '9c',
  ];

  readonly usa: string[] = [
    '5.0',
    '5.1',
    '5.2',
    '5.3',
    '5.4',
    '5.5',
    '5.6',
    '5.7',
    '5.8',
    '5.9',
    '5.10a',
    '5.10b',
    '5.10c',
    '5.10d',
    '5.11a',
    '5.11b',
    '5.11c',
    '5.11d',
    '5.12a',
    '5.12b',
    '5.12c',
    '5.12d',
    '5.13a',
    '5.13b',
    '5.13c',
    '5.13d',
    '5.14a',
    '5.14b',
    '5.14c',
    '5.14d',
    '5.15a',
    '5.15b',
    '5.15c',
    '5.15d',
  ];

  public getClassificationList(type: string): string[] {
    if ('sasko' === type) {
      return this.sasko;
    } else if ('FRA' === type) {
      return this.fra;
    } else if ('USA' === type) {
      return this.usa;
    }
    return this.uiaa;
  }

  public getUiaaClassificationList(): string[] {
    return this.uiaa;
  }

  public getSaskoClassificationList(): string[] {
    return this.sasko;
  }

  public getFraClassificationList(): string[] {
    return this.fra;
  }

  public getUsaClassificationList(): string[] {
    return this.usa;
  }

  public isUiaa(uiaa_difficulty: string): boolean {
    for (let i; i < this.uiaa.length; i++) {
      if (uiaa_difficulty === this.uiaa[i]) {
        return true;
      }
    }
    return false;
  }

  public tryConvertSasko(sasko_difficulty: string): DifficultyConversion {
    let difficulty_conversion: DifficultyConversion = {
      uiaa: '',
      sasko: '',
      fra: '',
      usa: '',
      success: false,
    };
    for (let i; i < this.sasko.length; i++) {
      if (sasko_difficulty === this.sasko[i]) {
        difficulty_conversion = this.prepareDifficultyConversion(i);
        break;
      }
    }
    return difficulty_conversion;
  }

  public tryConvertFra(fra_difficulty: string): DifficultyConversion {
    let difficulty_conversion: DifficultyConversion = {
      uiaa: '',
      sasko: '',
      fra: '',
      usa: '',
      success: false,
    };
    for (let i; i < this.fra.length; i++) {
      if (fra_difficulty === this.fra[i]) {
        difficulty_conversion = this.prepareDifficultyConversion(i);
        break;
      }
    }
    return difficulty_conversion;
  }

  public tryConvertUsa(usa_difficulty: string): DifficultyConversion {
    let difficulty_conversion: DifficultyConversion = {
      uiaa: '',
      sasko: '',
      fra: '',
      usa: '',
      success: false,
    };
    for (let i; i < this.usa.length; i++) {
      if (usa_difficulty === this.usa[i]) {
        difficulty_conversion = this.prepareDifficultyConversion(i);
        break;
      }
    }
    return difficulty_conversion;
  }

  public difficultyToPoint(uiaa_difficulty: string, style: string): number {
    let difficulty: number;
    switch (style) {
      case 'OS': {
        difficulty = 125;
        break;
      }
      case 'flash': {
        difficulty = 100;
        break;
      }
      case 'RP': {
        difficulty = 25;
        break;
      }
      default: {
        difficulty = 0;
        break;
      }
    }

    switch (uiaa_difficulty.slice(-1)) {
      case '+': {
        difficulty = difficulty + 33;
        uiaa_difficulty = uiaa_difficulty.slice(0, -1);
        break;
      }
      case '-': {
        difficulty = difficulty - 33;
        uiaa_difficulty = uiaa_difficulty.slice(0, -1);
        break;
      }
      default: {
        break;
      }
    }
    difficulty = difficulty + 100 * parseInt(uiaa_difficulty);
    return difficulty;
  }

  private prepareDifficultyConversion(i: number): DifficultyConversion {
    return {
      uiaa: this.uiaa[i],
      sasko: this.sasko[i],
      fra: this.fra[i],
      usa: this.usa[i],
      success: true,
    };
  }
}
