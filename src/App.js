import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";
import { FaTrash } from "react-icons/fa";

function App() {
  const [data, setData] = useState({});
  const [location, setLocation] = useState("");
  const [favoriteLocations, setFavoriteLocations] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);

  const API_KEY = "e5da6fede8396346537b822344e36d21";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=imperial&appid=${API_KEY}`;

  const searchLocation = (event) => {
    if (event.key === "Enter") {
      if (location) {
        axios.get(url).then((response) => {
          setData(response.data);
          if (
            response.data.name &&
            !searchHistory.includes(response.data.name)
          ) {
            const newSearchHistory = [
              response.data.name,
              ...searchHistory.slice(0, 4),
            ];
            setSearchHistory(newSearchHistory);
            localStorage.setItem(
              "searchHistory",
              JSON.stringify(newSearchHistory)
            );
          }
        });
      } else {
        setLocation("");
      }
      setShowSearchHistory(false);
    }
  };

  useEffect(() => {
    const success = (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`;
      axios.get(url).then((response) => {
        setData(response.data);
      });
    };

    const error = () => {
      console.log("Unable to retrieve location.");
    };

    if (!location) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
      } else {
        console.log("Geolocation is not supported by this browser.");
      }
    }
  }, [location, API_KEY]);

  useEffect(() => {
    const storedLocations = localStorage.getItem("favoriteLocations");
    if (storedLocations) {
      setFavoriteLocations(JSON.parse(storedLocations));
    }
    const storedSearchHistory = localStorage.getItem("searchHistory");
    if (storedSearchHistory) {
      setSearchHistory(JSON.parse(storedSearchHistory));
    }
  }, []);

  const handleAddToFavorites = () => {
    if (data.name && !favoriteLocations.includes(data.name)) {
      setFavoriteLocations([...favoriteLocations, data.name]);
      localStorage.setItem(
        "favoriteLocations",
        JSON.stringify([...favoriteLocations, data.name])
      );
    }
  };

  const handleRemoveFromFavorites = (location) => {
    setFavoriteLocations(favoriteLocations.filter((l) => l !== location));
    localStorage.setItem(
      "favoriteLocations",
      JSON.stringify(favoriteLocations.filter((l) => l !== location))
    );
  };

  const handleSearchHistoryClick = (location) => {
    axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=imperial&appid=${API_KEY}`
      )
      .then((response) => {
        setData(response.data);
      });
    setLocation(location);
    setShowSearchHistory(false);
  };

  const handleFavLocationClick = (location) => {
    axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=imperial&appid=${API_KEY}`
      )
      .then((response) => {
        setData(response.data);
      });
    setLocation(location);
    setShowSearchHistory(false);
  };

  return (
    <div className="app">
      <div className="search">
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          onKeyPress={searchLocation}
          placeholder="Enter Location"
          type="text"
          onFocus={() => setShowSearchHistory(true)}
        />

        {data.name && (
          <button id="addToFav" onClick={handleAddToFavorites}>
            &#10084;
          </button>
        )}
      </div>

      <div className="searchHistory">
        {showSearchHistory && searchHistory.length > 0 && (
          <ul className="search-history-list">
            {searchHistory.map((location) => (
              <li
                key={location}
                onClick={() => handleSearchHistoryClick(location)}
              >
                {location}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="container">
        <div className="top">
          <div className="location">
            <p>{data.name}</p>
          </div>
          <div className="temp">
            {data.main ? (
              <h1>{(((data.main.temp - 32) * 5) / 9).toFixed()}°C</h1>
            ) : null}
          </div>
          <div className="description">
            {data.weather ? <p>{data.weather[0].main}</p> : null}
          </div>
        </div>

        <div className="favorites">
          <h2>Favorites</h2>
          <ul>
            {favoriteLocations.map((location) => (
              <li
                key={location}
                onClick={() => handleFavLocationClick(location)}
              >
                {location}{" "}
                <button
                  id="remove"
                  onClick={() => handleRemoveFromFavorites(location)}
                >
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {data.name !== undefined && (
          <div className="bottom">
            <div className="feels">
              {data.main ? (
                <p className="bold">{data.main.feels_like.toFixed()}°F</p>
              ) : null}
              <p>Feels Like</p>
            </div>
            <div className="humidity">
              {data.main ? <p className="bold">{data.main.humidity}%</p> : null}
              <p>Humidity</p>
            </div>
            <div className="wind">
              {data.wind ? (
                <p className="bold">{data.wind.speed.toFixed()} MPH</p>
              ) : null}
              <p>Wind Speed</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
