import * as weatherAPI from './weatherAPI.js';
import * as utilities from './utilities.js';

const getSystem = function () {
  const btnCover = document.querySelector('.cover');
  let system = btnCover.classList.contains('fahrenheit')
    ? 'fahrenheit'
    : 'celsius';
  return system;
};

const getLocationName = async function (data) {
  const { lat, lon } = data;
  const location = await weatherAPI.getLocationsFromCoords(lat, lon, 1);
  const { name, state, country } = location[0];
  return { name, state, country };
};

const getLocationWeather = async function (data) {
  const { lat, lon } = data;
  const weatherData = await weatherAPI.getWeatherFromCoords(lat, lon);
  return weatherData;
};

const handleZipcodeInput = async function (input) {
  const data = await weatherAPI.getLocationFromZip(input);
  if (!data) {
    console.log('sorry, no result');
    return;
  }
  const locationName = await getLocationName(data);
  const weatherData = await getLocationWeather(data);
  renderLocationHeader(locationName);
  renderMainDisplay(weatherData);
};

const handleTextInput = async function (input) {
  const locations = await weatherAPI.getLocationsFromNames(input);
  if (locations.length === 1) {
    const locationName = await getLocationName(locations[0]);
    const weatherData = await getLocationWeather(locations[0]);
    renderLocationHeader(locationName);
    renderMainDisplay(weatherData);
  } else {
    renderSearchResults(locations);
  }
};

const parseInputValue = function (inputValue) {
  if (/^\d{5}(?:[-\s]\d{4})?$/.test(inputValue)) {
    handleZipcodeInput(inputValue);
  } else {
    handleTextInput(inputValue);
  }
};

const setToLoading = function () {
  const loadingMsg = document.createElement('div');
  loadingMsg.classList.add('loading-message');
  loadingMsg.textContent = 'Loading...';
  main.appendChild(loadingMsg);
};

const handleSearchSubmission = async function (e) {
  e.preventDefault();
  const input = e.target.children[0];
  const inputValue = input.value;
  parseInputValue(inputValue);
  input.value = '';
  const locationHeading = document.querySelector('.location-title');
  const main = document.querySelector('main');
  locationHeading.textContent = '';
  utilities.removeElementContents(main);
  const loadingMsg = document.createElement('div');
  loadingMsg.classList.add('loading-message');
  loadingMsg.textContent = 'Loading...';
  main.appendChild(loadingMsg);
};

const handleLocationClick = async function (e) {
  const main = document.querySelector('main');
  utilities.removeElementContents(main);
  const loadingMsg = document.createElement('div');
  loadingMsg.classList.add('loading-message');
  loadingMsg.textContent = 'Loading...';
  main.appendChild(loadingMsg);
  const elem = e.target;
  const location = elem.innerText.slice(0, -1);
  handleTextInput(location);
};

const renderSearchResults = function (locations) {
  const locationHeading = document.querySelector('.location-title');
  locationHeading.textContent = '';

  const main = document.querySelector('main');
  utilities.removeElementContents(main);

  const resultsContainer = document.createElement('div');
  resultsContainer.className = 'search-results';

  const locationsContainer = document.createElement('div');
  locationsContainer.className = 'locations-container';

  const resultsHeading = document.createElement('h3');
  resultsHeading.className = 'results-heading';
  if (locations.length === 0) {
    resultsHeading.textContent = 'Sorry, no matches.';
    resultsContainer.appendChild(resultsHeading);
    main.appendChild(resultsContainer);
    return;
  }
  resultsHeading.textContent = 'Did you mean...';

  locations.forEach((location) => {
    const locationResult = document.createElement('p');
    locationResult.className = 'location-result';
    locationResult.textContent = `${location.name}, ${location.state}, ${location.country}?`;
    locationResult.dataset.lat = location.lat;
    locationResult.dataset.lon = location.lon;
    locationResult.addEventListener('click', handleLocationClick);
    locationsContainer.appendChild(locationResult);
  });

  resultsContainer.appendChild(resultsHeading);
  resultsContainer.appendChild(locationsContainer);
  main.appendChild(resultsContainer);
};

const renderLocationHeader = function (locationName) {
  const locationHeading = document.querySelector('.location-title');
  locationHeading.textContent = `${locationName.name}, ${locationName.state}, ${locationName.country}`;
};

const displays = {
  currenty: null,
  hourly: null,
  daily: null,
};

const switchTempSystem = function (type) {
  const tempSpans = [
    ...displays['currently'].querySelectorAll('.temp'),
    ...displays['hourly'].querySelectorAll('.temp'),
    ...displays['daily'].querySelectorAll('.temp'),
  ];
  tempSpans.forEach((span) => {
    if (span.classList.contains(type)) {
      return;
    }
    const oldText = span.innerText;
    const oldNumber = /\d*/.exec(oldText);
    const oldLetter = /[FC]/g.exec(oldText);

    span.classList.remove('fahrenheit');
    span.classList.remove('celsius');
    span.classList.add(type);

    const newNumber = Math.round(
      utilities.temperatureConversion(
        type,
        `${type === 'celsius' ? 'fahrenheit' : 'celsius'}`,
        oldNumber
      )
    );
    const newLetter = type.slice(0, 1).toUpperCase();
    const newText = `${newNumber}\u00B0${newLetter}`;
    span.textContent = newText;
  });
};

const handleNavItemClick = function (e) {
  const tab = e.target;
  [...tab.parentElement.children].forEach((child) =>
    child.classList.remove('active')
  );
  tab.classList.add('active');
  const tabData = tab.dataset.content;
  renderWeatherDisplay(displays[tabData]);
};

const renderWeatherNav = function () {
  const weatherNav = document.createElement('nav');
  weatherNav.className = 'weather-nav';

  const createNavTab = function (title) {
    const tab = document.createElement('p');
    tab.className = `${title}-tab`;
    tab.dataset.content = title;
    tab.textContent = title;
    if (title === 'currently') tab.classList.add('active');
    return tab;
  };

  ['currently', 'hourly', 'daily'].forEach((title) =>
    weatherNav.appendChild(createNavTab(title))
  );

  return weatherNav;
};

const renderMainDisplay = function (weatherData) {
  const main = document.querySelector('main');
  utilities.removeElementContents(main);

  displays['currently'] = renderCurrentlyDisplay(weatherData);
  displays['hourly'] = renderHourlyDisplay(weatherData);
  displays['daily'] = renderDailyDisplay(weatherData);

  const weatherNav = renderWeatherNav();
  [...weatherNav.children].forEach((navItem) => {
    navItem.addEventListener('click', handleNavItemClick);
  });

  main.appendChild(weatherNav);
  renderWeatherDisplay(displays['currently']);
};

const renderWeatherDisplay = function (display) {
  const main = document.querySelector('main');
  const elem = main.children[1];
  if (elem) {
    main.removeChild(elem);
  }
  main.appendChild(display);
};

const renderCurrentlyDisplay = function (weatherData) {
  const system = getSystem();

  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'content-wrapper';

  const imgContainer = document.createElement('div');
  imgContainer.className = 'image-container';
  contentWrapper.appendChild(imgContainer);

  const icon = weatherData.current.weather[0].icon;
  const image = document.createElement('img');
  image.src = `http://openweathermap.org/img/wn/${icon}@2x.png`;
  imgContainer.appendChild(image);

  const description = document.createElement('p');
  description.textContent = `${weatherData.current.weather[0].description}`;
  imgContainer.appendChild(description);

  const textContainer = document.createElement('div');
  textContainer.className = 'text-container';
  contentWrapper.appendChild(textContainer);

  const currentTime = document.createElement('p');
  currentTime.textContent = `Time: ${utilities.formatTime(
    weatherData.current.dt,
    weatherData.timezone_offset
  )}`;
  textContainer.appendChild(currentTime);

  const currentTemp = document.createElement('p');
  currentTemp.textContent = 'Temp: ';
  const currentTempText = document.createElement('span');
  currentTempText.classList.add('temp');
  currentTempText.classList.add(system);
  currentTempText.textContent = `${Math.round(
    utilities.temperatureConversion(system, 'kelvin', weatherData.current.temp)
  )}º${system.split()[0][0].toUpperCase()}`;
  currentTemp.appendChild(currentTempText);
  textContainer.appendChild(currentTemp);

  const feelsLike = document.createElement('p');
  feelsLike.textContent = 'Feels like: ';
  const feelsLikeText = document.createElement('span');
  feelsLikeText.classList.add('temp');
  feelsLikeText.classList.add(system);
  feelsLikeText.textContent = `${Math.round(
    utilities.temperatureConversion(
      system,
      'kelvin',
      weatherData.current.feels_like
    )
  )}º${system.split()[0][0].toUpperCase()}`;
  feelsLike.appendChild(feelsLikeText);
  textContainer.appendChild(feelsLike);

  const sunrise = document.createElement('p');
  sunrise.textContent = `Sunrise: ${utilities.formatTime(
    weatherData.current.sunrise,
    weatherData.timezone_offset
  )}`;
  textContainer.appendChild(sunrise);

  const sunset = document.createElement('p');
  sunset.textContent = `Sunset: ${utilities.formatTime(
    weatherData.current.sunset,
    weatherData.timezone_offset
  )}`;
  textContainer.appendChild(sunset);

  const humidity = document.createElement('p');
  humidity.textContent = `Humidity: ${weatherData.current.humidity}%`;
  textContainer.appendChild(humidity);

  const windSpeed = document.createElement('p');
  windSpeed.textContent = `Wind speed: ${Math.round(
    utilities.convert_metersSec_to_mph(weatherData.current.wind_speed)
  )} mph`;
  textContainer.appendChild(windSpeed);

  return contentWrapper;
};

const renderHourlyDisplay = function (data) {
  const system = getSystem();

  const timezone_offset = data.timezone_offset;
  const hourlyCardContainer = document.createElement('div');
  hourlyCardContainer.className = 'hourly-card-container';

  const renderHourCard = function (data) {
    const hourCard = document.createElement('div');
    hourCard.className = 'hour-card';

    const timeContainer = document.createElement('div');
    timeContainer.className = 'day-container';
    hourCard.appendChild(timeContainer);

    const time = document.createElement('p');
    time.textContent = `${
      utilities.formatTime(data.dt, timezone_offset) === '0:00 AM'
        ? '12:00 AM'
        : utilities.formatTime(data.dt, timezone_offset) === '0:00 PM'
        ? '12:00 PM'
        : utilities.formatTime(data.dt, timezone_offset)
    }`;
    timeContainer.appendChild(time);

    const imgContainer = document.createElement('div');
    imgContainer.className = 'img-container';
    hourCard.appendChild(imgContainer);

    const img = document.createElement('img');
    img.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    imgContainer.appendChild(img);

    const tempContainer = document.createElement('div');
    tempContainer.className = 'temp-container';
    hourCard.appendChild(tempContainer);

    const tempText = document.createElement('span');
    tempText.classList.add('temp');
    tempText.classList.add('fahrenheit');
    tempText.textContent = `${Math.round(
      utilities.temperatureConversion(system, 'kelvin', data.temp)
    )}º${system.split()[0][0].toUpperCase()}`;
    tempContainer.appendChild(tempText);

    const descriptionContainer = document.createElement('div');
    descriptionContainer.className = 'description-container';
    hourCard.appendChild(descriptionContainer);

    const description = document.createElement('p');
    description.textContent = data.weather[0].description;
    descriptionContainer.appendChild(description);

    const percipitationContainer = document.createElement('div');
    percipitationContainer.className = 'percipitation-container';
    hourCard.appendChild(percipitationContainer);

    const percipitation = document.createElement('p');
    percipitation.textContent = `${Math.round(data.pop * 100)}%`;
    percipitationContainer.appendChild(percipitation);

    return hourCard;
  };

  data.hourly.forEach((hour) => {
    const hourCard = renderHourCard(hour);
    hourlyCardContainer.appendChild(hourCard);
  });

  return hourlyCardContainer;
};

const renderDailyDisplay = function (data) {
  return renderDayCards(data.daily);
};

const renderDayCards = function (data) {
  const system = getSystem();

  const cardContainer = document.createElement('div');
  cardContainer.className = 'card-container';

  const renderDayCard = function (data) {
    const dayCard = document.createElement('div');
    dayCard.className = 'day-card';

    const dayContainer = document.createElement('div');
    dayContainer.className = 'day-container';
    dayCard.appendChild(dayContainer);

    const day = document.createElement('p');
    day.textContent = data.day_of_week;
    dayContainer.appendChild(day);

    const imgContainer = document.createElement('div');
    imgContainer.className = 'img-container';
    dayCard.appendChild(imgContainer);

    const img = document.createElement('img');
    img.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    imgContainer.appendChild(img);

    const tempContainer = document.createElement('div');
    tempContainer.className = 'temp-container';
    dayCard.appendChild(tempContainer);

    const highTempText = document.createElement('p');
    highTempText.textContent = 'High: ';
    const highTempSpan = document.createElement('span');
    highTempSpan.classList.add('temp');
    highTempSpan.classList.add(system);
    highTempSpan.textContent = `${Math.round(
      utilities.temperatureConversion(system, 'kelvin', data.temp.max)
    )}º${system.split()[0][0].toUpperCase()}`;
    highTempText.appendChild(highTempSpan);
    tempContainer.appendChild(highTempText);

    const lowTempText = document.createElement('p');
    lowTempText.textContent = 'Low: ';
    const lowTempSpan = document.createElement('span');
    lowTempSpan.classList.add('temp');
    lowTempSpan.classList.add(system);
    lowTempSpan.textContent = `${Math.round(
      utilities.temperatureConversion(system, 'kelvin', data.temp.min)
    )}º${system.split()[0][0].toUpperCase()}`;
    lowTempText.appendChild(lowTempSpan);
    tempContainer.appendChild(lowTempText);

    const descriptionContainer = document.createElement('div');
    descriptionContainer.className = 'description-container';
    dayCard.appendChild(descriptionContainer);

    const description = document.createElement('p');
    description.textContent = data.weather[0].description;
    descriptionContainer.appendChild(description);

    return dayCard;
  };

  data.forEach((day, index) => {
    const today = new Date();
    day.day_of_week = utilities.getDayOfWeek((today.getDay() + index) % 7);
    const dayCard = renderDayCard(day);
    cardContainer.appendChild(dayCard);
  });

  return cardContainer;
};

const renderLocationForm = function () {
  // const header = document.querySelector('header');
  const rightSide = document.querySelector('.right-side');

  const elementTypes = ['form', 'input', 'button'];

  const elements = elementTypes.map((type) => {
    const elem = document.createElement(type);
    elem.className = `location-${type}`;

    if (type === 'label') {
      elem.htmlFor = 'location-input';
      elem.textContent = 'location:';
    }

    if (type === 'input') {
      elem.id = 'location-input';
      elem.placeholder = 'enter location...';
    }

    if (type === 'button') {
      elem.type = 'submit';
      elem.textContent = 'search';
    }
    return elem;
  });

  elements.forEach((elem, index, elements) => {
    if (index > 0) elements[0].appendChild(elem);
  });

  elements[0].addEventListener('submit', handleSearchSubmission);
  rightSide.appendChild(elements[0]);
};

(function () {
  const tempSwitch = document.querySelector('#temp');
  const switchCover = document.querySelector('.cover');
  tempSwitch.addEventListener('change', () => {
    if (tempSwitch.checked) {
      switchTempSystem('celsius');
      switchCover.classList.remove('fahrenheit');
      switchCover.classList.add('celsius');
    }
    if (!tempSwitch.checked) {
      switchTempSystem('fahrenheit');
      switchCover.classList.remove('celsius');
      switchCover.classList.add('fahrenheit');
    }
  });
})();

renderLocationForm();
parseInputValue('01801');

// const timer = setTimeout(() => {
//   utilities.switchTempSystem('celsius');
//   clearTimeout(timer);
// }, 5000);

export { renderLocationForm };
