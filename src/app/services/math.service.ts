import { Injectable } from '@angular/core';

export interface ConvertedBytes {
  numberofBytes: number;
  unit: string;
}

@Injectable()
export class MathServices {
  convertedBytes: ConvertedBytes = {
    numberofBytes: 0,
    unit: '',
  };

  public setUserFriendlyByteUnit(bytes: number): ConvertedBytes {
    if (1073741824 <= bytes) {
      this.convertedBytes.unit = 'GB';
      this.convertedBytes.numberofBytes = this.convertByteToGb(bytes);
    } else if (1048576 <= bytes) {
      this.convertedBytes.unit = 'MB';
      this.convertedBytes.numberofBytes = this.convertByteToMb(bytes);
    } else {
      this.convertedBytes.unit = 'kB';
      this.convertedBytes.numberofBytes = this.convertByteToKb(bytes);
    }
    return this.convertedBytes;
  }
  public convertByteToGb(bytes: number): number {
    return parseFloat((bytes / 1073741824).toFixed(2));
  }

  public convertByteToMb(bytes: number): number {
    return parseFloat((bytes / 1048576).toFixed(2));
  }

  public convertByteToKb(bytes: number): number {
    return parseFloat((bytes / 1024).toFixed(2));
  }

  public saturate(input: number, min: number, max: number): number {
    if (min > input) {
      input = min;
    } else if (max < input) {
      input = max;
    }
    return input;
  }

  public stringToHex(str) {
    let hex = '';
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      const hexValue = charCode.toString(16);
  
      // Pad with zeros to ensure two-digit representation
      hex += hexValue.padStart(3, '0');
    }
    return hex;
  };

  public hexToString(hex) {
    let str = '';
    for (let i = 0; i < hex.length; i += 3) {
      const hexValue = hex.substr(i, 3);
      const decimalValue = parseInt(hexValue, 16);
      str += String.fromCharCode(decimalValue);
    }
    return str;
  };
}
