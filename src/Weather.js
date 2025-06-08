import React, { useState } from "react";

export default function Weather() {
  const [city, setCity] = useState();
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState();
  const [forecast, setForecast] = useState(null);

  const handleCityChange = (event) => {
    setCity(event.target.value);
  };

  async function fetchWeather() {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${"ef901360790b1a2e99d90ce7989f738a"}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status:${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setWeather(data);
        fetchForecast();
        setCity("");
        setError(null);
      })
      .catch((error) => {
        console.error("Weather Fetching Error", error);
        setError(error.message);
        setWeather(null);
        setForecast(null);
      });
  }

  const fetchForecast = () => {
    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${"ef901360790b1a2e99d90ce7989f738a"}`
    )
      .then((response) => {
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("City not found. Please enter a valid city name.");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const dailyForecast = processForecastData(data.list);
        setForecast(dailyForecast);
        setError(null);
      })
      .catch((error) => {
        console.error("Forecast Fetching Error", error);
        setError(error.message || "Error fetching forecast. Please try again.");
        setForecast(null);
      });
  };

  const processForecastData = (forecastList) => {
    const dailyData = {};
    forecastList.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const day = date.toDateString().split(" ")[0];
      if (!dailyData[day]) {
        dailyData[day] = {
          date: date,
          temps: [],
          icons: [],
        };
      }
      dailyData[day].temps.push(item.main.temp);
      dailyData[day].icons.push(item.weather[0].icon);
    });

    const dailySummaries = Object.values(dailyData).map((dayData) => {
      const highTemp = Math.max(...dayData.temps);
      const lowTemp = Math.min(...dayData.temps);
      const icon = dayData.icons[Math.floor(dayData.icons.length / 2)];

      return {
        date: dayData.date,
        highTemp: (highTemp - 273.15).toFixed(2),
        lowTemp: (lowTemp - 273.15).toFixed(2),
        icon: icon,
      };
    });
    return dailySummaries;
  };

  const handleClick = () => {
    fetchWeather();
  };

  const ForecastCard = ({ day, highTemp, lowTemp, icon }) => {
    const today = new Date().toDateString().split(" ")[0];

    const displayDay = day === today ? "Today" : day;

    return (
      <div className="forecast-card">
        <p>{displayDay}</p>
        <img
          src={`http://openweathermap.org/img/w/${icon}.png`}
          alt="Weather Icon"
        />
        <p>
          {highTemp}°C / {lowTemp}°C
        </p>
      </div>
    );
  };

  return (
    <div className="weather-container">
      <div className="searchCity">
        <h3> What city are you curious about? </h3>
        <input
          type="text"
          id="search"
          placeholder="Enter City Name"
          value={city}
          onChange={handleCityChange}
        />
        <button id="btn" onClick={handleClick}>
          Get Weather
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
      <div className="weatherForecast">
        {weather && (
          <div className="weather-info">
            <h3 className="wname">{weather.name}</h3>
            <p>Temperature: {(weather.main.temp - 273.15).toFixed(2)}°C</p>
            <p>{weather.weather[0].description}</p>
          </div>
        )}

        {forecast && (
          <div className="forecast-container">
            {forecast.map((day) => (
              <ForecastCard
                key={day.date.getTime()}
                day={day.date.toDateString().split(" ")[0]}
                highTemp={day.highTemp}
                lowTemp={day.lowTemp}
                icon={day.icon}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
