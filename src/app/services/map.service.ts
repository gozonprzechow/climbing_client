import { Injectable } from '@angular/core';

interface LineParameter {
  q: number;
  k: number;
}

export interface LabelParam {
  localities: number;
  minerals: number;
}

@Injectable()
export class MapService {
  lineParameters: Array<LineParameter> = [
    { q: 0.027, k: 0.18 },
    { q: 0.021, k: 0.24 },
    { q: 0.008, k: 0.5 },
    { q: 0.00275, k: 0.71 },
    { q: 0.00175, k: 0.79 },
  ];
  x_points: Array<number> = [0, 10, 40, 80, 120, 260];

  geojson_area_data: any = [];
  geojson_area: any;

  public updateGeojsonAreaData(geojson_area_data) {
    this.geojson_area_data = geojson_area_data;
  }

  public updateGeojsonArea(geojson_area) {
    this.geojson_area = geojson_area;
  }

  public getGeojsonArea(): any {
    return this.geojson_area;
  }

  public getRegionGeojson(country: string) {
    let region_geojson = '';
    if ('Czech Republic' === country) {
      region_geojson = 'cz_kraje.json';
    }
    return region_geojson;
  }

  public getInitialGeojsonAreaStyle(): any {
    return {
      weight: 2,
      opacity: 1.0,
      color: 'hsl(9, 88%, 2%, 1)',
      fillOpacity: 1.0,
      fillColor: 'hsla(9, 88%, 17%, 0.12)', // Border width
    };
  }

  public setGeojsonAreaStyle(layer, highlight_option?: boolean) {
    for (let i = 0; i < this.geojson_area_data.length; i++) {
      if (layer.feature.properties.name === this.geojson_area_data[i].name) {
        if (0 < this.geojson_area_data[i].minerals) {
          this.setFilledStyle(
            layer,
            this.geojson_area_data[i].minerals,
            highlight_option,
          );
        } else {
          this.setVoidStyle(layer, highlight_option);
        }
        return;
      }
    }
    this.setVoidStyle(layer, highlight_option);
  }

  public setCountryLabel(layer) {
    let label_param: LabelParam = this.getLabelParam(layer);
    layer.bindTooltip(
      layer.feature.properties.name +
        '<br>' +
        'localities: ' +
        label_param.localities +
        '<br>' +
        'minerals: ' +
        label_param.minerals,
      {
        permanent: true,
        offset: [0, 40],
        sticky: true,
        direction: 'center',
        className: 'countryLabel',
      },
    );
  }

  public initRegionView(map) {
    map.setMinZoom(this.geojson_area.custom.zoom - 1);
    map.setMaxZoom(this.geojson_area.custom.zoom + 2.5);
    map.setMaxBounds(this.geojson_area.custom.bounds);
    map.setView(this.geojson_area.custom.center, this.geojson_area.custom.zoom);
  }

  public initCountryView(map) {
    map.setMinZoom(2);
    map.setMaxZoom(19);
    map.setMaxBounds([
      [-90, -180],
      [90, 180],
    ]);
    map.setView([50, 14.4], 4.4);
  }

  public getLabelParam(layer): LabelParam {
    let label_param: LabelParam = { localities: 0, minerals: 0 };
    for (let i = 0; i < this.geojson_area_data.length; i++) {
      if (layer.feature.properties.name === this.geojson_area_data[i].name) {
        label_param.localities = this.geojson_area_data[i].localities;
        label_param.minerals = this.geojson_area_data[i].minerals;
        return label_param;
      }
    }
    return label_param;
  }

  private countAreaOpacity(input: number): number {
    let result = this.lineParameters[0].k;
    if (this.x_points[0] > input) {
      result = this.lineParameters[0].k;
      return result;
    } else if (this.x_points[this.x_points.length - 1] <= input) {
      result = 1;
      return result;
    }
    for (let i = 0; i < this.x_points.length; i++) {
      if (input < this.x_points[i + 1]) {
        result = this.lineParameters[i].q * input + this.lineParameters[i].k;
        if (1 < result) {
          result = 1;
        }
        return result;
      }
    }
    return result;
  }

  private setVoidStyle(layer, highlight_option?: boolean) {
    if (highlight_option) {
      layer.setStyle({
        weight: 2,
        opacity: 1.0,
        color: 'hsl(9, 88%, 2%, 1)',
        fillOpacity: 1.0,
        fillColor: 'hsla(9, 88%, 17%, 0.34)',
      });
    } else {
      layer.setStyle({
        weight: 2,
        opacity: 1.0,
        color: 'hsl(9, 88%, 2%, 1)',
        fillOpacity: 1.0,
        fillColor: 'hsla(9, 88%, 17%, 0.12)',
      });
    }
  }

  private setFilledStyle(layer, sum_of_minerals: number, highlight_option?: boolean) {
    let area_opacity = this.countAreaOpacity(sum_of_minerals);
    // console.log(area_opacity);

    if (highlight_option) {
      layer.setStyle({
        weight: 2,
        opacity: 1.0,
        color: '#000000',
        fillOpacity: 1.0,
        fillColor: 'hsla(120, 97%, 56%,' + area_opacity + ')',
      });
    } else {
      layer.setStyle({
        weight: 2,
        opacity: 1.0,
        color: '#000000',
        fillOpacity: 1.0,
        fillColor: 'hsla(120, 89%, 31%,' + area_opacity + ')',
      });
    }
  }
}
