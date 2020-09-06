$(document).ready(function () {
  // get local storage
  const localStorageItems = { ...localStorage };

  Object.keys(localStorageItems).map((obj) => {
    $("#allCities").append(`<li class="savedCities" id="${obj}">${obj}</li>`);
  });

  // If a saved city is clicked, remove current states and repopulate DOM
  $(".savedCities").click(function () {
    $(".card").remove(); // remove old 'cards'
    $("#uvIndex").removeClass("hot"); // remove hot and cold classes for uv index
    $("#uvIndex").removeClass("cool"); // remove hot and cold classes for uv index
    var searchInput = $(this).attr("id");
    if (searchInput in localStorage) {
      const savedData = JSON.parse(localStorage[searchInput]);
      updateInterface(savedData);
      return false;
    }
  });

  // Search button click event
  $("#CitySearchBtn").click(function () {
    $(".card").remove();
    $("#uvIndex").removeClass("hot"); // remove hot and cold classes for uv index
    $("#uvIndex").removeClass("cool"); // remove hot and cold classes for uv index
    var searchInput = $("#citySearch").val();

    // if we've already searched this, pull from local storage instead of api call
    if (searchInput in localStorage) {
      const savedData = JSON.parse(localStorage[searchInput]);
      updateInterface(savedData);
      return false;
    }
    // if button is clicked without input, return null
    if (!searchInput) {
      return null;
    }

    // get current weather forecast for city
    $.get(
      `http://api.openweathermap.org/data/2.5/weather?q=${searchInput}&units=imperial&APPID=b8f5f2e18ac64dd7af4f0ab6c0c25a98`,
      function (data) {
        if (data) {
          // populate the dom with response
          $("#weather").text("(" + moment().format("MM/DD/YYYY") + ")");
          $("#CityResponse").text(data.name);
          $("#Humidity").text(data.main.humidity);
          $("#WindSpeed").text(data.wind.speed);
          $("#Temperature").text(data.main.temp);
          $("#lat").text(data.coord.lat);
          $("#lon").text(data.coord.lon);
          $("#uvIndex").removeClass("hot");
          $("#uvIndex").removeClass("cool");

          // build Icon
          var iconString = `<img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png"/>`;

          $("#icon").html(iconString);
          // get UV index
          $.get(
            `http://api.openweathermap.org/data/2.5/uvi?lat=${data.coord.lat}&lon=${data.coord.lon}&APPID=b8f5f2e18ac64dd7af4f0ab6c0c25a98`,
            function (data) {
              $("#uvIndex").html(data.value);
              // using 9 as a condition to show red or green UV - value could be anything
              if (data.value > 9) {
                $("#uvIndex").addClass("hot");
              } else {
                $("#uvIndex").addClass("cool");
              }
            }
          );
        }
      }
    );
    // get 5 day forecast
    $.get(
      `http://api.openweathermap.org/data/2.5/forecast?q=${searchInput}&units=imperial&appid=b8f5f2e18ac64dd7af4f0ab6c0c25a98`,
      function (data) {
        console.log("FORECAST DATA: ", data);
        let newIndex = 0;
        data.list.map((d) => {
          let tempString = moment.unix(d.dt).format("MM/DD/YYYY hh:mm a");
          // we will only use the 4pm item returned vs. the hourly breakdown the api returns
          if (tempString.includes("04:00 pm")) {
            $("#allCards").append(`
              <div id="card${newIndex}" data-weather='${JSON.stringify(
              d
            )}' class="card">
              <h5 class="date">${moment.unix(d.dt).format("MM/DD/YYYY")}</h5>
              <img class="weatherIcon" src="http://openweathermap.org/img/wn/${
                d.weather[0].icon
              }@2x.png" />
              <p>Temp: ${d.main.temp} F</p>
              <p>Humidity: ${d.main.humidity}%</p>
            </div>`);
            newIndex = newIndex + 1;
          }
        });
      }
    );
    // save values to local storage in a JSON object
    setTimeout(() => {
      const SearchValues = {
        name: $("#CityResponse").text(),
        date: $("#weather").text(),
        icon: $("#icon").html(),
        temperature: $("#Temperature").text(),
        humidity: $("#Humidity").text(),
        windSpeed: $("#WindSpeed").text(),
        uvIndex: $("#uvIndex").html(),
        dayOne: $("#card0").data(),
        dayTwo: $("#card1").data(),
        dayThree: $("#card2").data(),
        dayFour: $("#card3").data(),
        dayFive: $("#card4").data(),
      };
      // stringify JSON and save to local storage
      localStorage.setItem(searchInput, JSON.stringify(SearchValues));
    }, 3000);

    return false;
  });

  // When a user clicks or searches this utility function will repopulate the Document Object Model
  function updateInterface(savedData) {
    $("#weather").text(savedData.date);
    $("#CityResponse").text(savedData.name);
    $("#Humidity").text(savedData.humidity);
    $("#WindSpeed").text(savedData.windSpeed);
    $("#Temperature").text(savedData.temperature);
    $("#icon").html(savedData.icon);
    $("#uvIndex").html(savedData.uvIndex);
    if (savedData.uvIndex > 9) {
      $("#uvIndex").addClass("hot");
    } else {
      $("#uvIndex").addClass("cool");
    }

    $("#allCards").html(
      `<div id="card0" class="card">
            <h5 class="date">${moment
              .unix(savedData.dayOne.weather.dt)
              .format("MM/DD/YYYY")}</h5>
            <img class="weatherIcon" src="http://openweathermap.org/img/wn/${
              savedData.dayOne.weather.weather[0].icon
            }@2x.png" />
            <p>Temp: ${savedData.dayOne.weather.main.temp} F</p>
            <p>Humidity: ${savedData.dayOne.weather.main.humidity}%</p>
          </div>
        <div id="card1" class="card">
          <h5 class="date">${moment
            .unix(savedData.dayTwo.weather.dt)
            .format("MM/DD/YYYY")}</h5>
          <img class="weatherIcon" src="http://openweathermap.org/img/wn/${
            savedData.dayTwo.weather.weather[0].icon
          }@2x.png" />
          <p>Temp: ${savedData.dayTwo.weather.main.temp} F</p>
          <p>Humidity: ${savedData.dayTwo.weather.main.humidity}%</p>
        </div>
        <div id="card2" class="card">
        <h5 class="date">${moment
          .unix(savedData.dayThree.weather.dt)
          .format("MM/DD/YYYY")}</h5>
        <img class="weatherIcon" src="http://openweathermap.org/img/wn/${
          savedData.dayThree.weather.weather[0].icon
        }@2x.png" />
        <p>Temp: ${savedData.dayThree.weather.main.temp} F</p>
        <p>Humidity: ${savedData.dayThree.weather.main.humidity}%</p>
      </div>
        <div id="card3" class="card">
      <h5 class="date">${moment
        .unix(savedData.dayFour.weather.dt)
        .format("MM/DD/YYYY")}</h5>
      <img class="weatherIcon" src="http://openweathermap.org/img/wn/${
        savedData.dayFour.weather.weather[0].icon
      }@2x.png" />
      <p>Temp: ${savedData.dayFour.weather.main.temp} F</p>
      <p>Humidity: ${savedData.dayFour.weather.main.humidity}%</p>
    </div>
        <div id="card4" class="card">
    <h5 class="date">${moment
      .unix(savedData.dayFive.weather.dt)
      .format("MM/DD/YYYY")}</h5>
    <img class="weatherIcon" src="http://openweathermap.org/img/wn/${
      savedData.dayFive.weather.weather[0].icon
    }@2x.png" />
    <p>Temp: ${savedData.dayFive.weather.main.temp} F</p>
    <p>Humidity: ${savedData.dayFive.weather.main.humidity}%</p>
  </div>`
    );
    return false;
  }
});
