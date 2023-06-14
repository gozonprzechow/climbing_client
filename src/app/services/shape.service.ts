import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ShapeService {
  constructor(private http: HttpClient) {}

  getStateShapes(shape_location: string) {
    return this.http.get(shape_location);
  }
}
