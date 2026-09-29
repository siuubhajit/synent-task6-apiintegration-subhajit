# Bharat Weather

A small weather app for Indian cities, written in plain HTML, CSS and JavaScript. It reads live data from the Open-Meteo API with the Fetch API. Open-Meteo is free and needs no API key.

## Features

- City picker with Kolkata, Howrah, Delhi, Mumbai, Chennai, Bengaluru, Hyderabad, Pune, Ahmedabad, Jaipur, Lucknow and Guwahati
- Current temperature, feels-like temperature, humidity and wind speed, with a weather icon and description

## Project structure

```
index.html   page markup
style.css    styling
script.js    city list, Fetch calls and rendering
```

## Run it

Open `index.html` in a browser. No build step and no dependencies.

## API

`GET https://api.open-meteo.com/v1/forecast` with `latitude`, `longitude`, `current` and `timezone=Asia/Kolkata`. Coordinates for each city are stored in the `CITIES` array in `script.js`. To add a city, add one object to that array.
