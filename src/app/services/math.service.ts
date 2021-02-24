import { Injectable } from '@angular/core';

export interface ConvertedBytes {
  numberofBytes: number;
  unit: string;
}

@Injectable()
export class MathServices {
  convertedBytes: ConvertedBytes = {
    numberofBytes: 0,
    unit: ""
  };

  public setUserFriendlyByteUnit(bytes: number): ConvertedBytes {
    if (1073741824 <= bytes) {
      this.convertedBytes.unit = "GB";
      this.convertedBytes.numberofBytes = this.convertByteToGb(bytes);
    } else if (1048576 <= bytes) {
      this.convertedBytes.unit = "MB";
      this.convertedBytes.numberofBytes = this.convertByteToMb(bytes);
    } else {
      this.convertedBytes.unit = "kB";
      this.convertedBytes.numberofBytes = this.convertByteToKb(bytes);
    }
    return this.convertedBytes;
  }
  public convertByteToGb (bytes: number): number {
    return parseFloat((bytes/1073741824).toFixed(2));
  }

  public convertByteToMb (bytes: number): number {
    return parseFloat((bytes/1048576).toFixed(2));
  }

  public convertByteToKb (bytes: number): number {
    return parseFloat((bytes/1024).toFixed(2));
  }
}