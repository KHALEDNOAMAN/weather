document.getElementById("search-btn").addEventListener("click", fetchWeather);

async function fetchWeather() {
  const city = document.getElementById("city-input").value;
  if (!city) {
    alert("Please enter a city name");
    return;
  }

  const apiKey = "API_KEY";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
      alert("City not found!");
      return;
    }

    document.querySelector(".temperature").textContent = `${Math.round(
      data.main.temp
    )}°`;
    document.querySelector(".condition").textContent =
      data.weather[0].description;
    document.querySelector(
      ".weather-details .detail-text:nth-child(1)"
    ).textContent = `Humidity: ${data.main.humidity}%`;
    document.querySelector(
      ".weather-details .detail-text:nth-child(2)"
    ).textContent = `Wind: ${data.wind.speed} Km/h`;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    alert("Failed to fetch weather data.");
  }
}
