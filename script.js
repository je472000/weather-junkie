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
   