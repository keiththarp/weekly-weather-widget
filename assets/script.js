$(document).ready(function () {

  // Search area variables 
  const searchButt = $(".search-butt");

  // Current weather HTML elements
  const cityLabel = $(".city-label");
  const currentTemp = $("#current-temp");
  const currentHumid = $("#current-humid");
  const currentWind = $("#current-wind");
  const currentUV = $("#current-uv");

  // Recent & Favorite elements
  const recentCitiesUL = $(".recent-cities");

  // Variables for currently searched city
  let currentCity;
  let currentURL;

  // Bring in the local memory
  let recentCities = JSON.parse(localStorage.getItem("recent-cities"));
  if (!recentCities) {
    recentCities = [];
    localStorage.setItem("recent-cities", JSON.stringify(recentCities));
  }
  // Put the recent searches from memory in the dropdown.
  writeRecent();

  // Listen for the Search click
  searchButt.on("click", getCoords);

  // Use the search term to determine the correct coordinates
  function getCoords() {
    let placeName = $("input").val();
    console.log(placeName);
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
      cityLabel.text(`Current weather in ${currentCity}`)
      currentTemp.text(` ${Math.round(result.current.temp)}ºF`);
      currentWind.text(` ${Math.round(result.current.wind_speed)} mph`);
      currentHumid.text(` ${Math.round(result.current.humidity)}%`);
      currentUV.text(` ${result.current.uvi}`)

      // Send the current search to local storage for recent history
      storeRecent();
    });
  };

  // Building recent search history
  function storeRecent() {
    recentCities = JSON.parse(localStorage.getItem("recent-cities"));
    const currentLabel = currentCity.split(",");
    const currentCityDisplay = `${currentLabel[0]},${currentLabel[1]}`
    console.log(currentLabel);
    console.log(`this is the string of city state ${currentCityDisplay}`);

    // Recent search object with city and Weather API call URL
    const currentRecent = {
      city: currentCityDisplay,
      URL: currentURL
    }

    // Check to see if recent search already exists in local storage
    let exists = false;
    for (let i = 0; i < recentCities.length; i++) {

      // If it does we move it to the top of the list and update local memory
      if (recentCities[i].city === currentCityDisplay) {
        exists = true;
        console.log("We got to TRUE");
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
      console.log(item.city);

      const newLI = $("<li>").attr("data-url", item.URL).text(item.city)
      recentCitiesUL.append(newLI);
    });
  }




  // Nothing below here.
});