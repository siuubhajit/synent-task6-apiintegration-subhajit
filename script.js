// Bharat Weather: shows live weather for Indian cities using the Open-Meteo API.

const API_URL = "https://api.open-meteo.com/v1/forecast";
const REQUEST_TIMEOUT_MS = 8000;
const STORAGE_KEY = "bharat-weather:last-city";

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

// WMO weather codes used by Open-Meteo, grouped by range.
function describeCode(code) {
  if (code === 0) return { label: "Clear sky", icon: "☀️" };
  if (code <= 2) return { label: "Partly cloudy", icon: "⛅" };
  if (code === 3) return { label: "Overcast", icon: "☁️" };
  if (code <= 48) return { label: "Fog", icon: "🌫️" };
  if (code <= 57) return { label: "Drizzle", icon: "🌦️" };
  if (code <= 67) return { label: "Rain", icon: "🌧️" };
  if (code <= 77) return { label: "Snow", icon: "❄️" };
  if (code <= 82) return { label: "Rain showers", icon: "🌧️" };
  return { label: "Thunderstorm", icon: "⛈️" };
}

const citySelect = document.getElementById("city-select");
const weatherEl = document.getElementById("weather");
const loaderEl = document.getElementById("loader");
const errorBox = document.getElementById("error-box");
const errorMessage = document.getElementById("error-message");
const retryBtn = document.getElementById("retry-btn");
let latestRequest = 0;

function buildUrl(city) {
  const params = new URLSearchParams({
    latitude: city.lat,
    longitude: city.lon,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    timezone: "Asia/Kolkata",
  });
  params.set("daily", "weather_code,temperature_2m_max,temperature_2m_min");
  params.set("forecast_days", "5");
  return `${API_URL}?${params}`;
}

function render(city, data) {
  const now = data.current;
  const info = describeCode(now.weather_code);

  weatherEl.innerHTML = `
    <div class="current">
      <div class="icon">${info.icon}</div>
      <div>
        <h2>${city.name}, <span>${city.state}</span></h2>
        <p class="condition">${info.label}</p>
      </div>
      <p class="temp">${Math.round(now.temperature_2m)}°C</p>
    </div>
    <ul class="stats">
      <li><span>Feels like</span><strong>${Math.round(now.apparent_temperature)}°C</strong></li>
      <li><span>Humidity</span><strong>${now.relative_humidity_2m}%</strong></li>
      <li><span>Wind</span><strong>${Math.round(now.wind_speed_10m)} km/h</strong></li>
    </ul>`;
  weatherEl.insertAdjacentHTML("beforeend", renderForecast(data.daily));
}

function renderForecast(daily) {
  const rows = daily.time
    .map((date, i) => {
      const day = new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short" });
      const info = describeCode(daily.weather_code[i]);
      const high = Math.round(daily.temperature_2m_max[i]);
      const low = Math.round(daily.temperature_2m_min[i]);
      return `
        <div class="forecast-row">
          <span class="day">${i === 0 ? "Today" : day}</span>
          <span>${info.icon} ${info.label}</span>
          <span class="range"><b>${high}°</b> / ${low}°</span>
        </div>`;
    })
    .join("");

  return `<div class="forecast"><h3>Next 5 days</h3>${rows}</div>`;
}

function setLoading(isLoading) {
  loaderEl.hidden = !isLoading;
  weatherEl.hidden = isLoading;
  citySelect.disabled = isLoading;
}

function showError(message) {
  errorMessage.textContent = message;
  errorBox.hidden = false;
}

function hideError() {
  errorBox.hidden = true;
}

function friendlyMessage(err) {
  if (err.name === "AbortError") return "The weather service took too long to respond.";
  if (!navigator.onLine) return "You seem to be offline. Check your connection and retry.";
  if (err.message.startsWith("HTTP")) return `The weather service returned an error (${err.message}).`;
  return "Could not load the weather right now.";
}

async function loadWeather(city) {
  const requestId = ++latestRequest;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  hideError();
  setLoading(true);

  try {
    const response = await fetch(buildUrl(city), { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.current) throw new Error("Missing weather data");

    // Ignore the result if the user has already picked another city.
    if (requestId !== latestRequest) return;
    render(city, data);
  } catch (err) {
    if (requestId !== latestRequest) return;
    weatherEl.innerHTML = "";
    showError(friendlyMessage(err));
  } finally {
    clearTimeout(timer);
    if (requestId === latestRequest) setLoading(false);
  }
}

function getSavedCity() {
  try {
    const saved = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isInteger(saved) && saved >= 0 && saved < CITIES.length ? saved : 0;
  } catch {
    return 0;
  }
}

function saveCity(index) {
  try {
    localStorage.setItem(STORAGE_KEY, index);
  } catch {
    // Storage can be blocked in private mode; the app still works without it.
  }
}

function init() {
  CITIES.forEach((city, index) => {
    citySelect.add(new Option(`${city.name}, ${city.state}`, index));
  });
  citySelect.value = getSavedCity();

  citySelect.addEventListener("change", () => {
    saveCity(citySelect.value);
    loadWeather(CITIES[citySelect.value]);
  });
  retryBtn.addEventListener("click", () => loadWeather(CITIES[citySelect.value]));

  loadWeather(CITIES[citySelect.value]);
}

init();
