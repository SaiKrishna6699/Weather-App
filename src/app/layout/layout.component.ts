import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'
import { faSearch, faTemperatureHigh, faTemperatureLow, faWind, faDroplet, faClock } from '@fortawesome/free-solid-svg-icons';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { WeatherService } from '../service/weather.service';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  iconArray: any[] = [faSearch, faTemperatureHigh, faTemperatureLow, faDroplet, faWind, faClock];
  weatherIcons: any[] = [faSun, faMoon];
  weatherData: any;

  localTime = '';
  time = 0;
  temperature = '0';
  city = '';
  country = '';
  minTemp = "";
  maxTemp = "";
  wind = "";
  humidity = "";


  searchForm!: FormGroup;
  constructor(private formBuilder: FormBuilder, private weatherService: WeatherService,) { }

  ngOnInit() {
    this.searchForm = this.formBuilder.group({
      city: [''] // Initial value of the city input field
    });
    
  }



  onSubmit() {
    const city = this.searchForm.value.city;
    this.weatherService.getWeatherData(city).subscribe(
      (data: any) => {
        this.weatherData = data;
        this.updateWeatherInfo();
      },
      (error: any) => {
        console.error('Failed to fetch weather data:', error);
      }
    );
  }

  updateWeatherInfo() {
    if (this.weatherData && this.weatherData.location && this.weatherData.current) {
      this.localTime = this.weatherData.location.localtime;
      this.country = this.weatherData.location.country;
      this.temperature = this.weatherData.current.temp_c;
      this.city = this.weatherData.location.name;
      this.minTemp = this.weatherData.current.mintemp_c;
      this.maxTemp = this.weatherData.current.feelslike_c;
      this.wind = this.weatherData.current.wind_kph;
      this.humidity = this.weatherData.current.humidity;
      this.time = new Date(this.weatherData.localTime.localTime).getHours();
    }
  }
}