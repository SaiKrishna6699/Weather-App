import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private apiKey = '8dc0f10c84564d1597a164926231207';

  constructor(private http: HttpClient) { }

  getWeatherData(city: string): Observable<any> {
    const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${this.apiKey}&q=${city}&aqi=no`;
    return this.http.get(apiUrl);
  }
  
}
