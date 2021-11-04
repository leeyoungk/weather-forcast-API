var APIKey = '74b0bbc4a7d8abe4537bfb05b0794c94';
var APIURL = 'https://api.openweathermap.org/data/2.5/';


var searchDataEl = $( '#searchData' );
var previousDataEl = $( '#previousData' );
var weatherContainerEl = $( '#weatherContainer' );


var searchedCityVal;
var searchSuccess = false;
var fiveDay = 5;
var setOffForecast = 0;
var previousCities = JSON.parse( localStorage.getItem( 'previousCities' ) ) || [];



function cantFindLocation() {
	weatherContainerEl.empty();
	weatherContainerEl.append( `
        <h3>Can not find location </h3>
    ` );
}

function temperatureScaling( t ) {
	return ( t < 35 ? 'frozenDay' : ( t < 45 ? 'coldDay' : ( t < 68 ? 'chillDay' : ( t < 75 ? 'niceDay' : ( t < 85 ? 'perfectDay' : ( t < 100 ? 'crazyDay' : 'burning' ) ) ) ) ) );
}

function showForecast( data ) {
	var forecast = [];

	setOffForecast = ( moment( data.current.dt, 'X' ).format( 'D' ) === moment( data.daily[0].dt, 'X' ).format( 'D' ) ? 1 : 0 );

	for( var i = 0 + setOffForecast; i < fiveDay +setOffForecast; i++ ) {
		forecast.push( `
            <div class="forecastBox ${temperatureScaling( data.daily[i].temp.day )}">
                <h4>${moment( data.daily[i].dt, 'X' ).format( 'M/D/YYYY' )}</h4>
                <img src="https://openweathermap.org/img/wn/${data.daily[i].weather[0].icon}@2x.png" alt="weather icon" class="icon"> 
                <p>Temp: ${data.daily[i].temp.day} <span>&#176;</span> F</p>
                <p>Wind: ${data.daily[i].wind_speed} MPH</p>
                <p>Humidity: ${data.daily[i].humidity} %</p>    
            </div>
        ` );
	}
	return forecast.join( '' );
}

function uvScale( uvi ) {
	return ( uvi < 2 ? 'uvLow' : ( uvi < 5 ? 'uvMid' : ( uvi < 7 ? 'uvMidHigh' : ( uvi < 12 ? 'uvHigh' : 'uvWarning' ) ) ) );
}



function saveLocations() {
	localStorage.setItem( 'previousCities', JSON.stringify( previousCities ) );
}
function displayData( weatherData ) {
	weatherContainerEl.empty();
	weatherContainerEl.append( `
        <div id="currentWeatherContainer">
            <h2>${searchedCityVal} (${moment( weatherData.current.dt, 'X' ).format( 'M/D/YYYY' )})
                <img src="https://openweathermap.org/img/wn/${weatherData.current.weather[0].icon}@2x.png" alt="weather icon" class="icon"> 
            </h2>
            <p>Temp: ${weatherData.current.temp} <span>&#176;</span> F</p>
            <p>Wind: ${weatherData.current.wind_speed} MPH</p>
            <p>Humidity: ${weatherData.current.humidity} %</p>
            <p>UV Index: <span class="uvStyle ${uvScale( weatherData.current.uvi )}">${weatherData.current.uvi}</span></p>
        </div>
        <h3>5-Day Forecast:</h3>
        <div id="fiveDayBoxes">
            ${showForecast( weatherData )}
        </div>
    ` );
}
function emptySearchBox() {
	searchDataEl.empty();
	searchDataEl.append( `
        <input type="search" placeholder="Location" class="form-control" id="searchInput">
        <button type="submit" class="btn" id="searchBtn">Search</button>
    ` );
}

function clearSearchedCities() {
	previousDataEl.empty();
	previousDataEl.append( `
        <button type="button" class="btn clearBtn btn-primary border border-dark w-100 btn btn-primary " value="clear">CLEAR </button>
    ` );
}

function showSearchedLocation() {
	if( searchSuccess ) {
		var cityCaps = searchedCityVal.toUpperCase();

		for( var i = 0; i < previousCities.length; i++ ) {
			if( cityCaps === previousCities[i] ) {
				previousCities.splice( i, 1 );
			}
		}

		previousCities.unshift( cityCaps );
	}

	emptySearchBox();
	clearSearchedCities();

	for( var i = 0; i < previousCities.length; i++ ) {
		previousDataEl.append( `
            <button type="button" class="btn" value="${previousCities[i]}">${previousCities[i]}</button>
        ` );
	}

	saveLocations();
}

function searchApiByCoordinates( lat, lon ) {
	var locQueryUrl = `${APIURL}onecall?${lat}&${lon}&exclude=minutely,hourly&units=imperial&appid=${APIKey}`;

	fetch( locQueryUrl )
		.then( function ( response ) {
			if( !response.ok ) {
				cantFindLocation();
				throw response.json();
			}
			return response.json();
		} )
		.then( function ( locRes ) {
			displayData( locRes );
			searchSuccess = true;
			showSearchedLocation();
		} )
		.catch( function ( error ) {
			return error;
		} );
}

function searchApiByCity() {
	var locQueryUrl = `${APIURL}weather?q=${searchedCityVal}&appid=${APIKey}`;

	fetch( locQueryUrl )
		.then( function ( response ) {
			if( !response.ok ) {
				cantFindLocation();
				throw response.json();
			}
			return response.json();
		} )
		.then( function ( locRes ) {
			searchedCityVal = locRes.name;
			var cityLat = `lat=${locRes.coord.lat}`;
			var cityLon = `lon=${locRes.coord.lon}`;
			searchApiByCoordinates( cityLat, cityLon );
		} )
		.catch( function ( error ) {
			return error;
		} );
}

function handleSearchSubmit( event ) {
	event.preventDefault();

	searchedCityVal = $( '#searchInput' ).val();

	searchApiByCity();
}

function handleButtonClick( event ) {
	event.preventDefault();

	var btnValue = event.target.value;

	if( btnValue === 'clear' ) {
		clearSearchedCities();
		weatherContainerEl.empty();
		previousCities = [];
		saveLocations();
	} else {
		searchedCityVal = btnValue;
		searchApiByCity();
	}
}

showSearchedLocation();


searchDataEl.on( 'submit', handleSearchSubmit );
previousDataEl.on( 'click', handleButtonClick );