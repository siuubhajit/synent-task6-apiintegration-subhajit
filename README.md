# Bharat Weather

A small weather app for Indian cities, written in plain HTML, CSS and JavaScript. It reads live data from the Open-Meteo API with the Fetch API. Open-Meteo is free and needs no API key.

## Features

- City picker with Kolkata, Howrah, Delhi, Mumbai, Chennai, Bengaluru, Hyderabad, Pune, Ahmedabad, Jaipur, Lucknow and Guwahati
- Current temperature, feels-like temperature, humidity and wind speed, with a weather icon and description
- Loading spinner while the request is in flight; the city picker is locked until it finishes
- Error handling for network failures, non-200 responses, malformed data and an 8 second timeout, with a retry button
- Late responses from a previously selected city are ignored
- 5-day forecast with daily high, low and conditions
- The last selected city is remembered in localStorage

## Project structure

```
index.html   page markup
style.css    styling
script.js    city list, Fetch calls and rendering
```

## Run it

Open `index.html` in a browser. No build step and no dependencies.

## API

`GET https://api.open-meteo.com/v1/forecast` with `latitude`, `longitude`, `current`, `daily` and `timezone=Asia/Kolkata`. Coordinates for each city are stored in the `CITIES` array in `script.js`. To add a city, add one object to that array.
