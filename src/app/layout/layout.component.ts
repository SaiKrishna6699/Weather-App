import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  faSearch,
  faTemperatureHigh,
  faTemperatureLow,
  faWind,
  faDroplet,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { WeatherService } from '../service/weather.service';
import { DatePipe } from '@angular/common';
import { LocationService } from '../service/location.service';
import {
  debounceTime,
  distinctUntilChanged,
  tap,
  filter,
  switchMap,
} from 'rxjs';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit {
  iconArray: any[] = [
    faSearch,
    faTemperatureHigh,
    faTemperatureLow,
    faDroplet,
    faWind,
    faClock,
  ];
  weatherIcons: any[] = [faSun, faMoon];
  weatherData: any;

  submit = false;
  localTime = '';
  time: number = 10;
  temperature: number = 0;
  city = '';
  country = '';
  minTemp = '';
  maxTemp = '';
  wind = '';
  humidity = '';

  searchForm!: FormGroup;
  suggestions: any[] = [];
  showMinMessage = false;
  selectedLat?: number;
  selectedLon?: number;

  @ViewChild('cityInput') cityInput!: ElementRef<HTMLInputElement>;
  selectionMade = false;
  selectedDisplay?: string;
  constructor(
    private formBuilder: FormBuilder,
    private weatherService: WeatherService,
    private locSvc: LocationService
  ) {
    this.searchForm = this.formBuilder.group({
      city: [''],
    });
  }

  ngOnInit() {
    this.searchForm
      .get('city')!
      .valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap((val: string) => {
          // if user edits the value (different from the selected display) allow autocomplete again
          if (this.selectionMade && val !== this.selectedDisplay) {
            this.selectionMade = false;
            this.selectedDisplay = undefined;
          }

          if (!val || val.length < 3) {
            this.suggestions = [];
            this.showMinMessage = !!val && val.length < 3;
          } else {
            this.showMinMessage = false;
          }
        }),
        // skip calling the location API when we've just set the selected display
        filter(
          (val: string) =>
            !!val &&
            val.length >= 3 &&
            !(this.selectionMade && val === this.selectedDisplay)
        ),
        switchMap((val: string) => this.locSvc.autocomplete(val))
      )
      .subscribe(
        (features) => {
          this.suggestions = features;
        },
        (err) => {
          console.error(err);
          this.suggestions = [];
        }
      );
  }

  onInputFocus() {
    if (this.selectionMade) {
      this.suggestions = [];
    }
  }

  selectSuggestion(item: any) {
    const p = item?.properties || {};
    const name = p.city || p.name || p.street || '';
    const stateOrCode = p.state_code || p.state ? p.state_code || p.state : '';
    const country = p.country || '';
    let display = '';

    if (name) display = name;
    if (stateOrCode) display += display ? `, ${stateOrCode}` : stateOrCode;
    if (country) display += display ? `, ${country}` : country;
    if (!display) display = p.formatted || '';

    // mark selection so valueChanges does not re-query
    this.selectedDisplay = display;
    this.selectionMade = true;

    // update input (this will emit valueChanges but is skipped by the pipeline)
    this.searchForm.get('city')!.setValue(display);
    this.suggestions = [];

    // store coords in case you want to call weather by lat/lon
    this.selectedLat = p.lat;
    this.selectedLon = p.lon;

    // blur input so it is no longer focused
    try {
      this.cityInput?.nativeElement.blur();
    } catch (e) {
      // ignore if ViewChild not ready
    }

    // automatically call weather API using the display string
    this.submit = true;
    this.weatherService.getWeatherData(display).subscribe(
      (data: any) => {
        this.weatherData = data;
        this.updateWeatherInfo();
      },
      (error: any) => {
        console.error('Failed to fetch weather data:', error);
      }
    );
  }

  onSubmit() {
    const cityInput = this.searchForm.value.city?.trim();
    if (!cityInput) {
      this.submit = false;
      return;
    }
    // If user submits manually, clear selection flag (they typed it)
    this.selectionMade = false;
    this.selectedDisplay = undefined;

    this.submit = true;
    this.weatherService.getWeatherData(cityInput).subscribe(
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
    if (
      this.weatherData &&
      this.weatherData.location &&
      this.weatherData.current
    ) {
      this.localTime = this.weatherData.location.localtime;
      this.country = this.weatherData.location.country;
      this.temperature = this.weatherData.current.temp_c;
      this.city = this.weatherData.location.name;
      this.minTemp = this.weatherData.current.mintemp_c;
      this.maxTemp = this.weatherData.current.feelslike_c;
      this.wind = this.weatherData.current.wind_kph;
      this.humidity = this.weatherData.current.humidity;
      this.time = new Date(this.weatherData.location.localtime).getHours();
    }
    console.log(this.time);
  }
}
