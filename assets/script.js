$(document).ready(function () {

  let now = moment();

  // Search area variables 
  const searchButt = $(".search-butt");

  // Current weather HTML elements
  const cityLabel = $(".city-label");
  const currentTemp = $("#current-temp");
  const currentHumid = $("#current-humid");
  const currentWind = $("#current-wind");
  const currentUV = $("#current-uv");

  // Forecast elements
  const dayBox = $(".day-box");

  // Recent & Favorite elements
  const recentCitiesUL = $(".recent-cities");

  // Variables for currently searched city
  let currentCity;
  let currentURL;

  // Bring in the local memory
  let recentCities = JSON.parse(localStorage.getItem("recent-cities"));

  // Set it up if it's empty
  if (!recentCities) {
    recentCities = [];
    localStorage.setItem("recent-cities", JSON.stringify(recentCities));

    // Populate with Boston if empty
    currentCity = "Boston, MA, United States of America"
    currentURL = "https://api.openweathermap.org/data/2.5/onecall?lat=42.3602534&lon=-71.0582912&units=imperial&exclude=minutely,hourly&appid=aa0655e595f8fa747f0a44ae37aa4883";
    weatherCall(currentURL);

    // If it's not empty, let's load the last search
  } else {
    currentCity = recentCities[0].city;
    currentURL = recentCities[0].URL;
    weatherCall(currentURL);
  }
  // Put the recent searches from memory in the dropdown.
  writeRecent();

  // Listen for the Search click
  searchButt.on("click", getCoords);

  // Use the search term to determine the correct coordinates
  function getCoords() {
    let placeName = $("input").val();
    let geoAPIURL = "https://api.opencagedata.com/geocode/v1/json?q=" + placeName + "&key=eb47c1b37c7f4b77b7dc729f0915b698";
    $.get(geoAPIURL, function (result) {
      currentCity = result.results[0].formatted;
      const lat = result.results[0].geometry.lat;
      const lng = result.results[0].geometry.lng;

      // Send the cords to be formatted for the weather API call
      buildWeatherURL(lat, lng);
    });
  }

  // Getting the URL built for the weather API call
  function buildWeatherURL(lat, lng) {
    let weatherURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&units=imperial&exclude=minutely,hourly&appid=aa0655e595f8fa747f0a44ae37aa4883`;
    currentURL = weatherURL.toString();

    // Send the formatted URL to the API call function
    weatherCall(weatherURL)
  }

  // API call for the weather
  function weatherCall(weatherURL) {

    $.get(weatherURL, function (result) {

      // Display the current weather results
      $(".current-weather-icon").attr("src", `http://openweathermap.org/img/wn/${result.current.weather[0].icon}@2x.png`);
      cityLabel.text(`Current weather in ${currentCity}`)

      currentTemp.text(` ${Math.round(result.current.temp)}ºF`);
      currentWind.text(` ${Math.round(result.current.wind_speed)} mph`);
      currentHumid.text(` ${Math.round(result.current.humidity)}%`);
      currentUV.text(` ${result.current.uvi}`)

      // Display forecasted weather
      dayBox.each(function (day) {
        const _this = $(this);
        _this.find(".forecast-day").text(now.add(1, "d").format("ddd, MMM D, YYYY"));
        _this.find(".weather-icon").attr("src", `http://openweathermap.org/img/wn/${result.daily[day].weather[0].icon}@2x.png`);
        _this.find(".forecast-temp").text(` ${Math.round(result.daily[day].temp.day)}ºF`);
        _this.find(".forecast-precip").text(` ${Math.round(result.daily[day].pop * 100)}%`);
        _this.find(".forecast-humid").text(` ${Math.round(result.daily[day].humidity)}%`);
      });
      // http://openweathermap.org/img/wn/10d@2x.png



      // Send the current search to local storage for recent history
      storeRecent();
    });
  };

  // Building recent search history
  function storeRecent() {
    recentCities = JSON.parse(localStorage.getItem("recent-cities"));
    const currentLabel = currentCity.split(",");
    const currentCityDisplay = `${currentLabel[0]},${currentLabel[1]}`

    // Recent search object with city and Weather API call URL
    const currentRecent = {
      city: currentCityDisplay,
      full: currentCity,
      URL: currentURL
    }

    // Check to see if recent search already exists in local storage
    let exists = false;
    for (let i = 0; i < recentCities.length; i++) {

      // If it does we move it to the top of the list and update local memory
      if (recentCities[i].city === currentCityDisplay) {
        exists = true;
        recentCities.splice(i, 1);
        recentCities.unshift(currentRecent);
        recentCities = recentCities.slice(0, 5);
        localStorage.setItem("recent-cities", JSON.stringify(recentCities));

        break;
      }
    }

    // If it doesn't already exist, we add it to the top of the list.
    if (!exists) {
      recentCities.unshift(currentRecent);
      recentCities = recentCities.slice(0, 5);
      localStorage.setItem("recent-cities", JSON.stringify(recentCities));

    }

    // Update the dropdown menu
    writeRecent();
  }

  // Filling the recent area in the dropdown
  function writeRecent() {
    recentCities = recentCities.slice(0, 5);
    recentCitiesUL.empty();
    recentCities.forEach(function (item) {

      const newLI = $("<li>").attr("data-url", item.URL).attr("data-full", item.full).text(item.city)
      recentCitiesUL.append(newLI);
    });
  }

  // Activating the recent cities
  recentCitiesUL.on("click", function () {
    const thisClick = event.target;

    if (thisClick.matches("li")) {

      currentCity = thisClick.getAttribute("data-full");
      currentURL = thisClick.getAttribute("data-url");

      weatherCall(currentURL);
    }

  });
  document.querySelector



  // Nothing below here.
});