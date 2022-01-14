const API_key = 'd4a3732932608b542cb92d60253a6c4f';

export const getLocationFromZip = async function (zip_code, country_code) {
  try {
    const response = await fetch(
      `http://api.openweathermap.org/geo/1.0/zip?zip=${zip_code}${
        country_code ? ',' + country_code : ''
      }&appid=${API_key}`,
      { mode: 'cors' }
    );
    const data = await response.json();
    return data;
  } catch (err) {
    console.log(err);
  }
};

export const getLocationsFromCoords = async function (lat, lon, limit) {
  try {
    const response = await fetch(
      `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=${limit}&appid=${API_key}`,
      { mode: 'cors' }
    );
    const data = await response.json();
    return data;
  } catch (err) {
    console.log(err);
  }
};

export const getLocationsFromNames = async function (
  city_name,
  state_code,
  country_code
) {
  try {
    const response = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city_name}${
        state_code ? ',' + state_code : ''
      }${country_code ? ',' + country_code : ''}&limit=5&appid=${API_key}`,
      { mode: 'cors' }
    );
    const data = await response.json();
    return data;
  } catch (err) {
    console.log(err);
  }
};

export const getWeatherFromCoords = async function (lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${API_key}`,
      { mode: 'cors' }
    );
    const data = await response.json();
    return data;
  } catch (err) {
    console.log(err);
  }
};
