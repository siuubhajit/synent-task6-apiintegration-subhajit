// Bharat Weather: shows live weather for Indian cities using the Open-Meteo API.

const API_URL = "https://api.open-meteo.com/v1/forecast";

const CITIES = [
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lon: 88.3639 },
  { name: "Howrah", state: "West Bengal", lat: 22.5958, lon: 88.2636 },
  { name: "Delhi", state: "Delhi", lat: 28.6139, lon: 77.209 },
  { name: "Mumbai", state: "Maharashtra", lat: 19.076, lon: 72.8777 },
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lon: 80.2707 },
  { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lon: 77.5946 },
  { name: "Hyderabad", state: "Telangana", lat: 17.385, lon: 78.4867 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lon: 73.8567 },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lon: 72.5714 },
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lon: 75.7873 },
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lon: 80.9462 },
  { name: "Guwahati", state: "Assam", lat: 26.1445, lon: 91.7362 },
];

const citySelect = document.getElementById("city-select");
const weatherEl = document.getElementById("weather");

function buildUrl(city) {
  const params = new URLSearchParams({
    latitude: city.lat,
    longitude: city.lon,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    timezone: "Asia/Kolkata",
  });
  return `${API_URL}?${params}`;
}

function render(city, data) {
  const now = data.current;
  weatherEl.textContent = `${city.name}: ${now.temperature_2m}°C, wind ${now.wind_speed_10m} km/h`;
}

async function loadWeather(city) {
  const response = await fetch(buildUrl(city));
  const data = await response.json();
  render(city, data);
}

function init() {
  CITIES.forEach((city, index) => {
    citySelect.add(new Option(`${city.name}, ${city.state}`, index));
  });

  citySelect.addEventListener("change", () => {
    loadWeather(CITIES[citySelect.value]);
  });

  loadWeather(CITIES[citySelect.value]);
}

init();
