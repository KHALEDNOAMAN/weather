const API_KEY = CONFIG.API_KEY;
const BASE_URL = CONFIG.BASE_URL;

const cityInput = document.querySelector("#city-input");
const searchBtn = document.querySelector("#search-btn");
const temperatureEl = document.querySelector(".temperature");
const conditionEl = document.querySelector(".condition");
const humidityEl = document.querySelector(
  ".weather-details .detail-text:first-child"
);
const windEl = document.querySelector(
  ".weather-details .detail-text:last-child"
);
const forecastContainer = document.querySelector("#forecast-container");

function safeUpdateText(element, text) {
  if (element) {
    element.textContent = text;
  } else {
    console.warn("Element not found when trying to update text");
  }
}

async function fetchCurrentWeather(city) {
  try {
    const response = await fetch(
      `${BASE_URL}weather?q=${city}&units=metric&appid=${API_KEY}`
    );
    const data = await response.json();

    if (data.cod !== 200) {
      throw new Error("City not found");
    }

    safeUpdateText(temperatureEl, `${Math.round(data.main.temp)}°`);
    safeUpdateText(conditionEl, data.weather[0].description);
    safeUpdateText(humidityEl, `${data.main.humidity}% Humidity`);
    safeUpdateText(windEl, `${data.wind.speed.toFixed(1)} Km/h Wind`);

    // Fetch 5-day forecast
    await fetchForecast(city);
  } catch (error) {
    console.error("Error fetching weather data:", error);

    if (error.message === "City not found") {
      alert(
        "The city you entered was not found. Please check the spelling and try again."
      );
    } else {
      alert(
        "Failed to fetch weather data. Please check your internet connection."
      );
    }
  }
}

// Fetch 5-Day Forecast
async function fetchForecast(city) {
  try {
    const response = await fetch(
      `${BASE_URL}forecast?q=${city}&units=metric&appid=${API_KEY}`
    );
    const data = await response.json();

    // Clear previous forecast
    if (forecastContainer) {
      forecastContainer.innerHTML = "";
    }

    // Group forecast by day
    const dailyForecasts = {};
    data.list.forEach((forecast) => {
      const date = new Date(forecast.dt * 1000);
      const day = date.toLocaleDateString("en-US", { weekday: "short" });

      if (!dailyForecasts[day]) {
        dailyForecasts[day] = {
          temps: [],
          weather: [],
        };
      }

      dailyForecasts[day].temps.push(forecast.main.temp);
      dailyForecasts[day].weather.push(forecast.weather[0].main);
    });

    if (forecastContainer) {
      Object.entries(dailyForecasts)
        .slice(0, 4)
        .forEach(([day, forecast]) => {
          const forecastDay = document.createElement("div");
          forecastDay.classList.add("forecast-day");

          const weatherCondition = getMostFrequentWeather(forecast.weather);
          const weatherIcon = getWeatherIcon(weatherCondition);

          forecastDay.innerHTML = `
                    <div>${day}</div>
                    ${weatherIcon}
                    <div class="forecast-temp">
                        <div class="forecast-temp-high">${Math.round(
                          Math.max(...forecast.temps)
                        )}°</div>
                        <div class="forecast-temp-low">${Math.round(
                          Math.min(...forecast.temps)
                        )}°</div>
                    </div>
                `;

          forecastContainer.appendChild(forecastDay);
        });
    }
  } catch (error) {
    console.error("Error fetching forecast:", error);
    alert("Failed to fetch forecast data.");
  }
}

function getMostFrequentWeather(weatherArray) {
  return weatherArray.reduce((a, b) =>
    weatherArray.filter((v) => v === a).length >=
    weatherArray.filter((v) => v === b).length
      ? a
      : b
  );
}

function getWeatherIcon(condition) {
  switch (condition) {
    case "Clear":
      return `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
            `;
    case "Clouds":
      return `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-cloud">
                    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                </svg>
            `;
    case "Rain":
      return `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-cloud-rain">
                    <line x1="16" y1="13" x2="16" y2="21" />
                    <line x1="8" y1="13" x2="8" y2="21" />
                    <line x1="12" y1="15" x2="12" y2="23" />
                    <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
                </svg>
            `;
    case "Snow":
      return `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-cloud-snow">
                    <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
                    <line x1="8" y1="16" x2="8.01" y2="16" />
                    <line x1="8" y1="20" x2="8.01" y2="20" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                    <line x1="12" y1="22" x2="12.01" y2="22" />
                    <line x1="16" y1="16" x2="16.01" y2="16" />
                    <line x1="16" y1="20" x2="16.01" y2="20" />
                </svg>
            `;
    default:
      return `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-cloud">
                    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                </svg>
            `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Event Listeners
  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      const city = cityInput ? cityInput.value.trim() : "";
      if (city) {
        fetchCurrentWeather(city);
      } else {
        alert("Please enter a city name");
      }
    });
  }

  if (cityInput) {
    cityInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const city = cityInput.value.trim();
        if (city) {
          fetchCurrentWeather(city);
        } else {
          alert("Please enter a city name");
        }
      }
    });
  }

  // Initial load with default city
  fetchCurrentWeather("Istanbul");
});
