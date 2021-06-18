var apiKey = "74b0bbc4a7d8abe4537bfb05b0794c94";
var cityName = "tacoma";
var url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`;
fetch(url)
    .then(function(response){
        return response.json();
    })
    .then(function(data){
        console.log(data);
        // console.log("the humidity in " + data.name + " is " + data.main.humidity);
        
    })
