var today = moment();
var currh = today.format("H");  /// 1 to 24 
var currM = "";
var weatherApiKey = "e7555f0a21fec8170d18ea44288e3018";
var noDays = 6;
var formEl = $("form");
var searchBtn = $("button");
var textEl = $("text");
var cityNameEl = $("#city_name");
var currDateEl = $("#curr_date");
var weatherIconEl = $("#weather_icon");
var tempratureEl = $("#temperature");
var humitityEl = $("#humidity");
var windSpeedEl = $("#wind_speed"); 
var uvIndexEl = $("#uv_index"); 
 var inputAreaEl = $(".inputarea");
 var comingDaysEl =$(".comingDays");
var spanEl = "";  var h3El = "";  var pEl = "";

var currDate = moment().format('MM/DD/YYYY');
currDateEl.html(currDate);
var cityList = [];
var ulEl = $("#city_list"); var liEl = ""; var imageEl = "";
var lat = ""; var lon = "";   /// Latitude and longitude variables
var iconcode = "";  var iconurl = "";
var cdate; var temperature; var humidity; var uvindex;  var windspeed;

/*
Call current UV data
By geographic coordinates
API call

http://api.openweathermap.org/data/2.5/uvi?lat={lat}&lon={lon}&appid={API key}
*/
function fetchDailyForecast(lat, lon){
 // var uvUrl = "https://api.openweathermap.org/data/2.5/uvi?lat="+lat+"&lon="+lon+"&appid="+weatherApiKey;
  var sevenUrl = "https://api.openweathermap.org/data/2.5/onecall?lat="+lat+"&lon="+lon+"&units=metric&exclude=minutely,hourly,&appid="+weatherApiKey;
  fetch(sevenUrl)
  .then(function (response) {
   // if (response.ok) {
    // console.log(response.ok+" ---- " +response.status);
    if (response.status === 200) {
      response.json().then(function (data) {
        
      //  console.log("uv-index data : " + data)
        //console.log(data);
        uvIndexEl.text(data.current.uvi)
        displayWeekly(data)
      });
    } else {
      alert('Error: ' + response.statusText);
    }
  })
  .catch(function (error) {
    alert('Unable to connect to UV Index site');
  });

}
var getCityWeather = function (city) {
  //var apiUrl = "https://api.openweathermap.org/data/2.5/forecast/daily?q="+city+"&cnt="+noDays+"&APPID="+weatherApiKey;
    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q="+city+"&cnt="+noDays+"&APPID="+weatherApiKey;

  fetch(apiUrl)
    .then(function (response) {
     // if (response.ok) {
     // console.log(response.ok+" ---- " +response.status);
      if (response.status === 200) {
        response.json().then(function (data) {
         // console.log(data)
          lat = ""; lon = "";
          displayWeather(data);
          if(lat != "" && lon != ""){
            fetchDailyForecast(lat, lon);
          }
        });
      } else {
        alert('Error: ' + response.statusText);
      }
    })
    .catch(function (error) {
      alert('Unable to connect to Weather API site');
    });
};
function displayWeather(data){
  cityNameEl.text(data.name+", "+data.sys.country);
  lon = data.coord.lon;
  lat = data.coord.lat;
}
function displayWeekly(data){
  temperature = data.daily[0].temp.day;
  temperature = temperature.toFixed(0);
  tempratureEl.text(temperature);
  
  for (var i = 0; i < 6; i++) {     ////data.daily.length
    cdate = moment.unix(data.daily[i].dt).format('MM/DD/YYYY');
    iconcode = data.daily[i].weather[0].icon;
    iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
    temperature = data.daily[i].temp.day;
    temperature = temperature.toFixed(0);
    humidity = data.daily[i].humidity;
    windspeed = data.daily[i].wind_speed;
    
    if(i==0){
      weatherIconEl.attr('src', iconurl);
      tempratureEl.text(temperature);
      humitityEl.text(humidity+"%");
      windSpeedEl.text(windspeed+" KPH");
      uvindex = data.daily[i].uvi;
      uvIndexEl.removeClass();
      var uvClass = uvIndexLevel(uvindex)
      uvIndexEl.text(uvindex)
      uvIndexEl.attr('class', uvClass);
    }else{
      setWeather(cdate, iconurl, temperature, humidity, windspeed);
    }
  }
}
function setWeather(cdate, iconurl, temperature, humidity){
  spanEl = $('<span>');
  h3El = $('<h5>');
  imageEl = $('<img>');
  pEl = $('<p>');
  h3El.text(cdate);
  imageEl.attr('src', iconurl);
  pEl.text("Temperature : " + temperature);
  pEl.attr('class','temperature');
  spanEl.append(h3El, imageEl, pEl);
  pEl = $('<p>').text("Humidity : " + humidity+"%");
  spanEl.append(pEl)
  comingDaysEl.append(spanEl)
}
function handleSearchFormSubmit(event) {
  event.preventDefault();

  var searchInputVal = $('#search').val();
  
  if (!searchInputVal) {
    console.error('You need a search input value!');
    return;
  }
  
  $('#search').val(''); /// to clear the search field
  comingDaysEl.empty();
  getCityWeather(searchInputVal)

  searchInputVal = searchInputVal.toLowerCase();
  
  if(cityList.includes(searchInputVal) !== true){
    cityList.push(searchInputVal);
    localStorage.setItem("cityList",JSON.stringify(cityList))
    liEl = $("<li>").text(searchInputVal);
    liEl.attr('class','list-group-item');
    ulEl.append(liEl)
  }
  
  //var queryString = './search-results.html?q=' + searchInputVal + '&format=' + formatInputVal;
  //location.assign(queryString);
}
function showPreviousCities(){
  var cities = localStorage.getItem("cityList")
  if(cities === "" || cities === null){return false;}
  cityList = JSON.parse(cities);
  if(cityList.length < 0){return false;}
  cityList.sort();
  ulEl.empty();   /// Creal all the li elements if exists
  for(var i=0; i<cityList.length; i++){
    liEl = $("<li>").text(cityList[i]);
    liEl.attr('class','list-group-item');
    ulEl.append(liEl)
    liEl = ""
  }
}
/*UV Index colors*/
  /*2 or less	Low	Green
3 to 5	Moderate	Yellow
6 to 7	High	Orange
8 to 10	Very High	Red
11+	Extreme	Violet*/
function uvIndexLevel(uvi){
  uvi = parseFloat(uvi)
  var cat = "";
  if(uvi <= 2){
    cat = "green"
  }else if(uvi >= 3 && uvi < 6){
    cat = "yellow"
  }else if(uvi >= 6 && uvi < 8){
    cat = "orange"
  }else if(uvi >= 8 && uvi < 11){
    cat = "red"
  }else{
    cat = "violet"
  }
  return cat;
}


formEl.on('submit', handleSearchFormSubmit);
ulEl.on('click', function(event){
  event.preventDefault();
  var currval = $(event.target).html();
  $('#search').val(currval);
  searchBtn.click();
});
showPreviousCities();