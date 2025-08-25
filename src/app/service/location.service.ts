import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
export const environment = {
  production: false,
  geoapifyKey: 'b9c950bb61dd420e8f1cbfb77db5ada2',
};

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  constructor(private http: HttpClient) {}
  private base = 'https://api.geoapify.com/v1/geocode/autocomplete';

  autocomplete(text: string): Observable<any[]> {
    const params = new HttpParams()
      .set('text', text)
      .set('apiKey', environment.geoapifyKey)
      .set('limit', '6');

    return this.http
      .get(this.base, { params })
      .pipe(map((res: any) => res?.features || []));
  }
}
